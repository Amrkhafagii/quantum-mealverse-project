
import Foundation
import Capacitor
import MapKit
import CoreLocation

/**
 * Route Optimization Plugin for iOS using MapKit
 */
@objc(RouteOptimizationPlugin)
public class RouteOptimizationPlugin: CAPPlugin {
    private var activeDirectionsRequest: MKDirections?
    private var activeRequest: CAPPluginCall?
    private let locationManager = CLLocationManager()
    private var isAuthorized: Bool {
        if #available(iOS 14.0, *) {
            return self.locationManager.authorizationStatus == .authorizedWhenInUse ||
                  self.locationManager.authorizationStatus == .authorizedAlways
        } else {
            return CLLocationManager.authorizationStatus() == .authorizedWhenInUse ||
                  CLLocationManager.authorizationStatus() == .authorizedAlways
        }
    }
    
    @objc func calculateOptimalRoute(_ call: CAPPluginCall) {
        guard isAuthorized else {
            call.reject("Location permission is required")
            return
        }
        
        activeRequest = call
        
        guard let originDict = call.getObject("origin"),
              let originLat = originDict["latitude"] as? Double,
              let originLng = originDict["longitude"] as? Double,
              let destDict = call.getObject("destination"),
              let destLat = destDict["latitude"] as? Double, 
              let destLng = destDict["longitude"] as? Double else {
            call.reject("Origin and destination coordinates are required")
            return
        }
        
        let origin = CLLocationCoordinate2D(latitude: originLat, longitude: originLng)
        let destination = CLLocationCoordinate2D(latitude: destLat, longitude: destLng)
        
        // Get waypoints if provided
        var waypoints: [MKWaypoint] = []
        if let waypointsArray = call.getArray("waypoints") as? [[String: Any]] {
            for waypointDict in waypointsArray {
                if let lat = waypointDict["latitude"] as? Double,
                   let lng = waypointDict["longitude"] as? Double {
                    let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
                    let name = waypointDict["name"] as? String ?? "Waypoint"
                    if #available(iOS 16.0, *) {
                        let waypoint = MKWaypoint(coordinate: coordinate, name: name)
                        waypoints.append(waypoint)
                    } else {
                        // For iOS versions below 16.0, we'll handle waypoints differently
                        // by using MKMapItem directly in the request below
                    }
                }
            }
        }
        
        // Get options if provided
        let optionsDict = call.getObject("options") ?? [:]
        let optimizeWaypoints = optionsDict["optimizeWaypoints"] as? Bool ?? true
        let avoidTolls = optionsDict["avoidTolls"] as? Bool ?? false
        let avoidHighways = optionsDict["avoidHighways"] as? Bool ?? false
        
        // Create route request
        let originItem = MKMapItem(placemark: MKPlacemark(coordinate: origin))
        let destinationItem = MKMapItem(placemark: MKPlacemark(coordinate: destination))
        
        let request = MKDirections.Request()
        request.source = originItem
        request.destination = destinationItem
        
        // Set transport type
        let modeString = optionsDict["mode"] as? String ?? "driving"
        switch modeString {
        case "walking":
            request.transportType = .walking
        case "transit":
            if #available(iOS 16.0, *) {
                request.transportType = .transit
            } else {
                request.transportType = .automobile
            }
        default:
            request.transportType = .automobile
        }
        
        // Handle route options
        if #available(iOS 16.0, *) {
            if avoidHighways {
                request.highwayPreference = .avoid
            }
            if avoidTolls {
                request.tollPreference = .avoid
            }
        }
        
        // Make the request
        self.activeDirectionsRequest = MKDirections(request: request)
        self.activeDirectionsRequest?.calculate { [weak self] response, error in
            guard let self = self else { return }
            
            if let error = error {
                self.activeRequest?.reject("Failed to calculate route: \(error.localizedDescription)")
                self.activeDirectionsRequest = nil
                self.activeRequest = nil
                return
            }
            
            guard let response = response, let route = response.routes.first else {
                self.activeRequest?.reject("No routes found")
                self.activeDirectionsRequest = nil
                self.activeRequest = nil
                return
            }
            
            // Process the route
            var legs: [[String: Any]] = []
            var totalDistance: Double = 0
            var totalDuration: Double = 0
            
            for step in route.steps {
                let leg: [String: Any] = [
                    "startLocation": [
                        "latitude": step.polyline.points[0].coordinate.latitude,
                        "longitude": step.polyline.points[0].coordinate.longitude
                    ],
                    "endLocation": [
                        "latitude": step.polyline.points[step.polyline.pointCount - 1].coordinate.latitude,
                        "longitude": step.polyline.points[step.polyline.pointCount - 1].coordinate.longitude
                    ],
                    "distance": step.distance,
                    "duration": step.expectedTravelTime,
                    "instructions": step.instructions
                ]
                legs.append(leg)
                totalDistance += step.distance
                totalDuration += step.expectedTravelTime
            }
            
            // Encode polyline
            let encodedPolyline = self.encodePolyline(route.polyline)
            
            // Format response
            let routeResponse: [String: Any] = [
                "route": [
                    "waypoints": self.formatWaypoints(route: route),
                    "distance": totalDistance,
                    "duration": totalDuration,
                    "polyline": encodedPolyline,
                    "legs": legs
                ]
            ]
            
            self.activeRequest?.resolve(routeResponse)
            self.activeDirectionsRequest = nil
            self.activeRequest = nil
        }
    }
    
    @objc func calculateMultiStopRoute(_ call: CAPPluginCall) {
        guard isAuthorized else {
            call.reject("Location permission is required")
            return
        }
        
        activeRequest = call
        
        guard let stopsArray = call.getArray("stops") as? [[String: Any]], stopsArray.count >= 2 else {
            call.reject("At least 2 stops are required")
            return
        }
        
        let returnToOrigin = call.getBool("returnToOrigin") ?? false
        
        // Create an array of stops with coordinates
        var coordinates: [CLLocationCoordinate2D] = []
        for stopDict in stopsArray {
            if let lat = stopDict["latitude"] as? Double,
               let lng = stopDict["longitude"] as? Double {
                coordinates.append(CLLocationCoordinate2D(latitude: lat, longitude: lng))
            }
        }
        
        if returnToOrigin && coordinates.count > 0 {
            // Add the first point at the end to return to origin
            coordinates.append(coordinates[0])
        }
        
        // For multi-stop routes, we'll need to make multiple requests
        // For simplicity in this example, we're just going to chain them
        self.calculateSegmentedRoute(coordinates: coordinates, index: 0, legs: [], totalDistance: 0, totalDuration: 0, encodedPoints: "")
    }
    
    private func calculateSegmentedRoute(coordinates: [CLLocationCoordinate2D], index: Int, legs: [[String: Any]], totalDistance: Double, totalDuration: Double, encodedPoints: String) {
        // If we've processed all segments, return the result
        if index >= coordinates.count - 1 {
            // Format and return the complete route
            let waypoints = coordinates.map { coordinate -> [String: Any] in
                return [
                    "latitude": coordinate.latitude,
                    "longitude": coordinate.longitude
                ]
            }
            
            let routeResponse: [String: Any] = [
                "route": [
                    "waypoints": waypoints,
                    "distance": totalDistance,
                    "duration": totalDuration,
                    "polyline": encodedPoints,
                    "legs": legs
                ]
            ]
            
            self.activeRequest?.resolve(routeResponse)
            self.activeDirectionsRequest = nil
            self.activeRequest = nil
            return
        }
        
        // Create the request for this segment
        let originItem = MKMapItem(placemark: MKPlacemark(coordinate: coordinates[index]))
        let destinationItem = MKMapItem(placemark: MKPlacemark(coordinate: coordinates[index + 1]))
        
        let request = MKDirections.Request()
        request.source = originItem
        request.destination = destinationItem
        request.transportType = .automobile
        
        // Make the request
        let directions = MKDirections(request: request)
        directions.calculate { [weak self] response, error in
            guard let self = self else { return }
            
            if let error = error {
                self.activeRequest?.reject("Failed to calculate route segment: \(error.localizedDescription)")
                self.activeDirectionsRequest = nil
                self.activeRequest = nil
                return
            }
            
            guard let response = response, let route = response.routes.first else {
                self.activeRequest?.reject("No route found for segment \(index)")
                self.activeDirectionsRequest = nil
                self.activeRequest = nil
                return
            }
            
            // Add this segment's info
            var updatedLegs = legs
            let segmentLeg: [String: Any] = [
                "startLocation": [
                    "latitude": coordinates[index].latitude,
                    "longitude": coordinates[index].longitude
                ],
                "endLocation": [
                    "latitude": coordinates[index + 1].latitude,
                    "longitude": coordinates[index + 1].longitude
                ],
                "distance": route.distance,
                "duration": route.expectedTravelTime
            ]
            updatedLegs.append(segmentLeg)
            
            // Update totals
            let newTotalDistance = totalDistance + route.distance
            let newTotalDuration = totalDuration + route.expectedTravelTime
            
            // Encode and append polyline
            let segmentPolyline = self.encodePolyline(route.polyline)
            let updatedEncodedPoints = encodedPoints.isEmpty ? segmentPolyline : encodedPoints + segmentPolyline
            
            // Calculate the next segment
            self.calculateSegmentedRoute(
                coordinates: coordinates,
                index: index + 1,
                legs: updatedLegs,
                totalDistance: newTotalDistance,
                totalDuration: newTotalDuration,
                encodedPoints: updatedEncodedPoints
            )
        }
    }
    
    @objc func getEstimatedTime(_ call: CAPPluginCall) {
        guard isAuthorized else {
            call.reject("Location permission is required")
            return
        }
        
        guard let originDict = call.getObject("origin"),
              let originLat = originDict["latitude"] as? Double,
              let originLng = originDict["longitude"] as? Double,
              let destDict = call.getObject("destination"),
              let destLat = destDict["latitude"] as? Double, 
              let destLng = destDict["longitude"] as? Double else {
            call.reject("Origin and destination coordinates are required")
            return
        }
        
        let origin = CLLocationCoordinate2D(latitude: originLat, longitude: originLng)
        let destination = CLLocationCoordinate2D(latitude: destLat, longitude: destLng)
        
        // Create route request
        let originItem = MKMapItem(placemark: MKPlacemark(coordinate: origin))
        let destinationItem = MKMapItem(placemark: MKPlacemark(coordinate: destination))
        
        let request = MKDirections.Request()
        request.source = originItem
        request.destination = destinationItem
        request.transportType = .automobile
        
        // Make the request
        let directions = MKDirections(request: request)
        directions.calculate { response, error in
            if let error = error {
                call.reject("Failed to calculate ETA: \(error.localizedDescription)")
                return
            }
            
            guard let response = response, let route = response.routes.first else {
                call.reject("No routes found")
                return
            }
            
            // Return the estimated time and distance
            call.resolve([
                "duration": route.expectedTravelTime,
                "distance": route.distance
            ])
        }
    }
    
    @objc func cancelRouteCalculation(_ call: CAPPluginCall) {
        self.activeDirectionsRequest?.cancel()
        self.activeDirectionsRequest = nil
        
        if let activeRequest = self.activeRequest {
            activeRequest.reject("Route calculation cancelled")
            self.activeRequest = nil
        }
        
        call.resolve()
    }
    
    // Helper to format waypoints from a route
    private func formatWaypoints(route: MKRoute) -> [[String: Any]] {
        var waypoints: [[String: Any]] = []
        
        // Add source
        if let sourceCoordinate = route.steps.first?.polyline.points[0].coordinate {
            waypoints.append([
                "latitude": sourceCoordinate.latitude,
                "longitude": sourceCoordinate.longitude
            ])
        }
        
        // Add destination
        if let lastStep = route.steps.last,
           let destinationCoordinate = lastStep.polyline.points[lastStep.polyline.pointCount - 1].coordinate {
            waypoints.append([
                "latitude": destinationCoordinate.latitude,
                "longitude": destinationCoordinate.longitude
            ])
        }
        
        return waypoints
    }
    
    // Helper to encode a polyline
    private func encodePolyline(_ polyline: MKPolyline) -> String {
        var result = ""
        var lastLat = 0
        var lastLng = 0
        
        for i in 0..<polyline.pointCount {
            let point = polyline.points[i]
            let coordinate = point.coordinate
            
            let lat = Int(coordinate.latitude * 100000)
            let lng = Int(coordinate.longitude * 100000)
            
            let dLat = lat - lastLat
            let dLng = lng - lastLng
            
            result += encodeNumber(dLat) + encodeNumber(dLng)
            
            lastLat = lat
            lastLng = lng
        }
        
        return result
    }
    
    private func encodeNumber(_ num: Int) -> String {
        var n = num
        if n < 0 {
            n = ~(n << 1)
        } else {
            n = n << 1
        }
        
        var result = ""
        while n >= 0x20 {
            result += String(UnicodeScalar((0x20 | (n & 0x1f)) + 63)!)
            n = n >> 5
        }
        result += String(UnicodeScalar(n + 63)!)
        return result
    }
}
