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
        
        // Create first and last point
        var allStops = [origin]
        
        // Get waypoints if provided and add to allStops
        var waypointItems: [MKMapItem] = []
        if let waypointsArray = call.getArray("waypoints") as? [[String: Any]] {
            for waypointDict in waypointsArray {
                if let lat = waypointDict["latitude"] as? Double,
                   let lng = waypointDict["longitude"] as? Double {
                    let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
                    let name = waypointDict["name"] as? String ?? "Waypoint"
                    let placemark = MKPlacemark(coordinate: coordinate)
                    let mapItem = MKMapItem(placemark: placemark)
                    mapItem.name = name
                    waypointItems.append(mapItem)
                    allStops.append(coordinate)
                }
            }
        }
        
        // Add destination as the last stop
        allStops.append(destination)
        
        // Get options if provided
        let optionsDict = call.getObject("options") ?? [:]
        let optimizeWaypoints = optionsDict["optimizeWaypoints"] as? Bool ?? true
        
        // Optimize waypoint order if requested and if we have waypoints
        if optimizeWaypoints && allStops.count > 3 {
            // Keep origin and destination fixed, optimize waypoints in between
            let optimizedStops = optimizeStopOrder(
                origin: allStops[0],
                intermediateStops: Array(allStops[1..<allStops.count-1]),
                destination: allStops[allStops.count-1],
                options: optionsDict
            )
            allStops = optimizedStops
        }
        
        // Process the route through segments
        self.calculateSegmentedRoute(
            coordinates: allStops,
            index: 0,
            legs: [],
            totalDistance: 0,
            totalDuration: 0,
            encodedPoints: "",
            options: optionsDict,
            call: call
        )
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
        let options = call.getObject("options") ?? [:]
        let optimizeWaypoints = options["optimizeWaypoints"] as? Bool ?? true
        
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
        
        // If optimization requested and we have enough stops
        if optimizeWaypoints && coordinates.count > 3 {
            // For multi-stop, optimize all except first and last if returnToOrigin is true
            if returnToOrigin {
                let optimizedStops = optimizeStopOrder(
                    origin: coordinates[0],
                    intermediateStops: Array(coordinates[1..<coordinates.count-1]),
                    destination: coordinates[coordinates.count-1],
                    options: options
                )
                coordinates = optimizedStops
            } else {
                // When not returning to origin, we optimize all except the first
                let optimizedStops = optimizeStopOrder(
                    origin: coordinates[0],
                    intermediateStops: Array(coordinates[1..<coordinates.count]),
                    destination: nil,
                    options: options
                )
                coordinates = optimizedStops
            }
        }
        
        // Calculate route through segments
        self.calculateSegmentedRoute(
            coordinates: coordinates,
            index: 0,
            legs: [],
            totalDistance: 0,
            totalDuration: 0,
            encodedPoints: "",
            options: options,
            call: call
        )
    }
    
    private func calculateSegmentedRoute(
        coordinates: [CLLocationCoordinate2D],
        index: Int,
        legs: [[String: Any]],
        totalDistance: Double,
        totalDuration: Double,
        encodedPoints: String,
        options: [String: Any],
        call: CAPPluginCall
    ) {
        // If we've processed all segments, return the result
        if index >= coordinates.count - 1 {
            // Format and return the complete route
            let waypoints = coordinates.map { coordinate -> [String: Any] in
                return [
                    "latitude": coordinate.latitude,
                    "longitude": coordinate.longitude
                ]
            }
            
            // Create indices array to show the order of waypoints
            var indices: [Int] = []
            for i in 0..<coordinates.count {
                indices.append(i)
            }
            
            let routeResponse: [String: Any] = [
                "route": [
                    "waypoints": waypoints,
                    "distance": totalDistance,
                    "duration": totalDuration,
                    "polyline": encodedPoints,
                    "legs": legs,
                    "optimizedOrder": indices
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
        
        // Set transport type based on options
        if let modeString = options["mode"] as? String {
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
        } else {
            request.transportType = .automobile
        }
        
        // Handle route options
        if #available(iOS 16.0, *) {
            if let avoidHighways = options["avoidHighways"] as? Bool, avoidHighways {
                request.highwayPreference = .avoid
            }
            if let avoidTolls = options["avoidTolls"] as? Bool, avoidTolls {
                request.tollPreference = .avoid
            }
        }
        
        // Make the request
        let directions = MKDirections(request: request)
        self.activeDirectionsRequest = directions
        
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
            
            // Create the leg for this segment
            var segmentLeg: [String: Any] = [
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
            
            // Add steps if available
            var steps: [[String: Any]] = []
            for step in route.steps {
                let stepDict: [String: Any] = [
                    "instructions": step.instructions,
                    "distance": step.distance,
                    "duration": step.expectedTravelTime,
                    "maneuver": step.notice ?? ""
                ]
                steps.append(stepDict)
            }
            
            if !steps.isEmpty {
                segmentLeg["steps"] = steps
            }
            
            // Add this leg to our collection
            var updatedLegs = legs
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
                encodedPoints: updatedEncodedPoints,
                options: options,
                call: call
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
    
    // Optimize the order of waypoints
    private func optimizeStopOrder(
        origin: CLLocationCoordinate2D,
        intermediateStops: [CLLocationCoordinate2D],
        destination: CLLocationCoordinate2D?,
        options: [String: Any]
    ) -> [CLLocationCoordinate2D] {
        // Start with origin
        var result = [origin]
        
        // No intermediate stops to optimize
        if intermediateStops.isEmpty {
            // Add destination if provided
            if let destination = destination {
                result.append(destination)
            }
            return result
        }
        
        // Choose optimization strategy
        let optimizationStrategy = options["stopOptimization"] as? String ?? "distance"
        var waypoints = intermediateStops
        
        // For complex routes, a proper TSP algorithm would go here
        // This is a simple greedy algorithm that finds the nearest unvisited waypoint
        var currentPoint = origin
        
        while !waypoints.isEmpty {
            // Find nearest point
            var nearestIndex = 0
            var shortestDistance = Double.greatestFiniteMagnitude
            
            for (index, waypoint) in waypoints.enumerated() {
                let distance: Double
                
                if optimizationStrategy == "duration" {
                    // In a real implementation, this would use estimated travel time
                    // For now, we approximate with straight-line distance
                    distance = calculateDistance(currentPoint, waypoint)
                } else {
                    // Default to distance-based optimization
                    distance = calculateDistance(currentPoint, waypoint)
                }
                
                if distance < shortestDistance {
                    shortestDistance = distance
                    nearestIndex = index
                }
            }
            
            // Add nearest point to result and remove from waypoints
            result.append(waypoints[nearestIndex])
            currentPoint = waypoints[nearestIndex]
            waypoints.remove(at: nearestIndex)
        }
        
        // Add destination if provided
        if let destination = destination {
            result.append(destination)
        }
        
        return result
    }
    
    // Helper to calculate straight-line distance between two coordinates
    private func calculateDistance(_ coord1: CLLocationCoordinate2D, _ coord2: CLLocationCoordinate2D) -> Double {
        let location1 = CLLocation(latitude: coord1.latitude, longitude: coord1.longitude)
        let location2 = CLLocation(latitude: coord2.latitude, longitude: coord2.longitude)
        return location1.distance(from: location2)
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
