
import Foundation
import Capacitor
import CoreLocation

/**
 * Route Optimization Plugin for iOS using Google Maps Directions API
 */
@objc(RouteOptimizationPlugin)
public class RouteOptimizationPlugin: CAPPlugin {
    private var activeTask: URLSessionDataTask?
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
    
    private var googleMapsApiKey: String {
        let config = getConfig()
        return config.getString("plugins.GoogleMaps.apiKey") ?? ""
    }
    
    @objc func calculateOptimalRoute(_ call: CAPPluginCall) {
        guard isAuthorized else {
            call.reject("Location permission is required")
            return
        }
        
        if googleMapsApiKey.isEmpty {
            call.reject("Google Maps API key is not configured in capacitor.config.ts")
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
        
        // Get waypoints if provided
        var waypoints: [[String: Any]] = []
        if let waypointsArray = call.getArray("waypoints") as? [[String: Any]] {
            waypoints = waypointsArray
        }
        
        // Get options if provided
        let optionsDict = call.getObject("options") ?? [:]
        let optimizeWaypoints = optionsDict["optimizeWaypoints"] as? Bool ?? true
        
        calculateGoogleRoute(
            origin: "\(originLat),\(originLng)",
            destination: "\(destLat),\(destLng)",
            waypoints: waypoints,
            options: optionsDict,
            optimize: optimizeWaypoints,
            call: call
        )
    }
    
    @objc func calculateMultiStopRoute(_ call: CAPPluginCall) {
        guard isAuthorized else {
            call.reject("Location permission is required")
            return
        }
        
        if googleMapsApiKey.isEmpty {
            call.reject("Google Maps API key is not configured in capacitor.config.ts")
            return
        }
        
        activeRequest = call
        
        guard let stopsArray = call.getArray("stops") as? [[String: Any]], stopsArray.count >= 2 else {
            call.reject("At least 2 stops are required")
            return
        }
        
        let returnToOrigin = call.getBool("returnToOrigin") ?? false
        let options = call.getObject("options") ?? [:]
        
        // Create a list of stops
        var stops = stopsArray
        
        // If returning to origin, add the first stop to the end
        if returnToOrigin && !stops.isEmpty {
            stops.append(stops[0])
        }
        
        // For multi-stop routes, use the first stop as origin, last stop as destination,
        // and everything in between as waypoints
        if stops.count >= 2 {
            let origin = stops.first!
            let destination = stops.last!
            var waypoints = [String]()
            
            // Add intermediate stops as waypoints
            if stops.count > 2 {
                for i in 1..<stops.count-1 {
                    if let lat = stops[i]["latitude"] as? Double,
                       let lng = stops[i]["longitude"] as? Double {
                        waypoints.append("\(lat),\(lng)")
                    }
                }
            }
            
            // Call Google Directions API
            let originStr = "\(origin["latitude"] as! Double),\(origin["longitude"] as! Double)"
            let destinationStr = "\(destination["latitude"] as! Double),\(destination["longitude"] as! Double)"
            
            calculateGoogleRoute(
                origin: originStr,
                destination: destinationStr,
                waypoints: Array(stops[1..<stops.count-1]),
                options: options,
                optimize: options["optimizeWaypoints"] as? Bool ?? true,
                call: call
            )
        } else {
            call.reject("Invalid stops configuration")
        }
    }
    
    @objc func getEstimatedTime(_ call: CAPPluginCall) {
        guard isAuthorized else {
            call.reject("Location permission is required")
            return
        }
        
        if googleMapsApiKey.isEmpty {
            call.reject("Google Maps API key is not configured in capacitor.config.ts")
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
        
        // Create Google Maps Directions API request
        let origin = "\(originLat),\(originLng)"
        let destination = "\(destLat),\(destLng)"
        
        // Build the URL
        var urlComponents = URLComponents(string: "https://maps.googleapis.com/maps/api/directions/json")!
        urlComponents.queryItems = [
            URLQueryItem(name: "origin", value: origin),
            URLQueryItem(name: "destination", value: destination),
            URLQueryItem(name: "key", value: googleMapsApiKey),
            URLQueryItem(name: "mode", value: "driving")
        ]
        
        // Optional departure time
        if let departureTime = call.getObject("departureTime"), 
           let timestamp = departureTime["time"] as? Int {
            urlComponents.queryItems?.append(URLQueryItem(name: "departure_time", value: "\(timestamp)"))
        }
        
        // Make the request
        let task = URLSession.shared.dataTask(with: urlComponents.url!) { [weak self] data, response, error in
            guard let self = self else { return }
            
            if let error = error {
                DispatchQueue.main.async {
                    call.reject("Network error: \(error.localizedDescription)")
                }
                return
            }
            
            guard let data = data else {
                DispatchQueue.main.async {
                    call.reject("No data received")
                }
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                   let routes = json["routes"] as? [[String: Any]],
                   let firstRoute = routes.first,
                   let legs = firstRoute["legs"] as? [[String: Any]],
                   let firstLeg = legs.first {
                    
                    // Extract duration and distance
                    let duration = (firstLeg["duration"] as? [String: Any])?["value"] as? Int ?? 0
                    let distance = (firstLeg["distance"] as? [String: Any])?["value"] as? Int ?? 0
                    
                    DispatchQueue.main.async {
                        call.resolve([
                            "duration": duration,
                            "distance": distance
                        ])
                    }
                } else {
                    DispatchQueue.main.async {
                        call.reject("Invalid response format")
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Failed to parse response: \(error.localizedDescription)")
                }
            }
        }
        
        task.resume()
    }
    
    @objc func cancelRouteCalculation(_ call: CAPPluginCall) {
        self.activeTask?.cancel()
        self.activeTask = nil
        
        if let activeRequest = self.activeRequest {
            activeRequest.reject("Route calculation cancelled")
            self.activeRequest = nil
        }
        
        call.resolve()
    }
    
    // Main function to calculate routes using Google Maps Directions API
    private func calculateGoogleRoute(
        origin: String,
        destination: String,
        waypoints: [[String: Any]],
        options: [String: Any],
        optimize: Bool,
        call: CAPPluginCall
    ) {
        // Build the URL
        var urlComponents = URLComponents(string: "https://maps.googleapis.com/maps/api/directions/json")!
        
        // Add required parameters
        var queryItems = [
            URLQueryItem(name: "origin", value: origin),
            URLQueryItem(name: "destination", value: destination),
            URLQueryItem(name: "key", value: googleMapsApiKey)
        ]
        
        // Add waypoints
        if !waypoints.isEmpty {
            var waypointsValue = ""
            
            if optimize {
                waypointsValue += "optimize:true|"
            }
            
            for (index, waypoint) in waypoints.enumerated() {
                if let lat = waypoint["latitude"] as? Double,
                   let lng = waypoint["longitude"] as? Double {
                    waypointsValue += "\(lat),\(lng)"
                    if index < waypoints.count - 1 {
                        waypointsValue += "|"
                    }
                }
            }
            
            if !waypointsValue.isEmpty {
                queryItems.append(URLQueryItem(name: "waypoints", value: waypointsValue))
            }
        }
        
        // Add travel mode
        var travelMode = "driving"
        if let mode = options["mode"] as? String {
            switch mode {
            case "walking":
                travelMode = "walking"
            case "transit":
                travelMode = "transit"
            case "bicycling":
                travelMode = "bicycling"
            default:
                travelMode = "driving"
            }
        }
        queryItems.append(URLQueryItem(name: "mode", value: travelMode))
        
        // Add optional parameters
        if let avoidTolls = options["avoidTolls"] as? Bool, avoidTolls {
            queryItems.append(URLQueryItem(name: "avoid", value: "tolls"))
        }
        
        if let avoidHighways = options["avoidHighways"] as? Bool, avoidHighways {
            queryItems.append(URLQueryItem(name: "avoid", value: "highways"))
        }
        
        urlComponents.queryItems = queryItems
        
        // Make the request
        let task = URLSession.shared.dataTask(with: urlComponents.url!) { [weak self] data, response, error in
            guard let self = self else { return }
            
            if let error = error {
                DispatchQueue.main.async {
                    call.reject("Network error: \(error.localizedDescription)")
                }
                return
            }
            
            guard let data = data else {
                DispatchQueue.main.async {
                    call.reject("No data received")
                }
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    // Check for API error
                    if let status = json["status"] as? String, status != "OK" {
                        let errorMessage = json["error_message"] as? String ?? "Route calculation failed"
                        DispatchQueue.main.async {
                            call.reject("Google Maps API error: \(errorMessage)")
                        }
                        return
                    }
                    
                    // Process the response
                    self.processGoogleDirectionsResponse(json: json, call: call, optimize: optimize)
                } else {
                    DispatchQueue.main.async {
                        call.reject("Invalid JSON response")
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Failed to parse response: \(error.localizedDescription)")
                }
            }
        }
        
        self.activeTask = task
        task.resume()
    }
    
    // Process Google Maps Directions API response
    private func processGoogleDirectionsResponse(json: [String: Any], call: CAPPluginCall, optimize: Bool) {
        guard let routes = json["routes"] as? [[String: Any]], let firstRoute = routes.first else {
            DispatchQueue.main.async {
                call.reject("No routes found in response")
            }
            return
        }
        
        // Create the route object
        var routeObject: [String: Any] = [:]
        
        // Extract waypoints from route
        var waypointsArray: [[String: Any]] = []
        
        // If this was an optimized route, get the waypoint order
        var waypointOrder: [Int] = []
        if optimize, let waypointOrderArray = firstRoute["waypoint_order"] as? [Int] {
            waypointOrder = waypointOrderArray
            routeObject["optimizedOrder"] = waypointOrder
        }
        
        // Extract legs
        guard let legs = firstRoute["legs"] as? [[String: Any]] else {
            DispatchQueue.main.async {
                call.reject("No legs found in route")
            }
            return
        }
        
        // Process each leg to build our response
        var allLegs: [[String: Any]] = []
        var totalDistance = 0
        var totalDuration = 0
        var allWaypoints: [[String: Any]] = []
        
        // Add starting location to waypoints
        if let startLeg = legs.first,
           let startLocation = startLeg["start_location"] as? [String: Any],
           let lat = startLocation["lat"] as? Double,
           let lng = startLocation["lng"] as? Double {
            allWaypoints.append(["latitude": lat, "longitude": lng])
        }
        
        for (index, leg) in legs.enumerated() {
            var legObject: [String: Any] = [:]
            
            // Start location
            if let startLocation = leg["start_location"] as? [String: Any],
               let startLat = startLocation["lat"] as? Double,
               let startLng = startLocation["lng"] as? Double {
                legObject["startLocation"] = ["latitude": startLat, "longitude": startLng]
            }
            
            // End location
            if let endLocation = leg["end_location"] as? [String: Any],
               let endLat = endLocation["lat"] as? Double,
               let endLng = endLocation["lng"] as? Double {
                legObject["endLocation"] = ["latitude": endLat, "longitude": endLng]
                
                // Also add to our waypoints array if it's not the last leg
                // This prevents duplicate waypoints
                if index < legs.count - 1 {
                    allWaypoints.append(["latitude": endLat, "longitude": endLng])
                }
            }
            
            // Add the final destination
            if index == legs.count - 1,
               let endLocation = leg["end_location"] as? [String: Any],
               let endLat = endLocation["lat"] as? Double,
               let endLng = endLocation["lng"] as? Double {
                allWaypoints.append(["latitude": endLat, "longitude": endLng])
            }
            
            // Distance and duration
            if let distance = leg["distance"] as? [String: Any], let distanceValue = distance["value"] as? Int {
                legObject["distance"] = distanceValue
                totalDistance += distanceValue
            }
            
            if let duration = leg["duration"] as? [String: Any], let durationValue = duration["value"] as? Int {
                legObject["duration"] = durationValue
                totalDuration += durationValue
            }
            
            // Steps
            if let steps = leg["steps"] as? [[String: Any]] {
                var stepsArray: [[String: Any]] = []
                
                for step in steps {
                    var stepObject: [String: Any] = [:]
                    
                    if let instructions = step["html_instructions"] as? String {
                        stepObject["instructions"] = instructions
                    }
                    
                    if let distance = step["distance"] as? [String: Any], 
                       let distanceValue = distance["value"] as? Int {
                        stepObject["distance"] = distanceValue
                    }
                    
                    if let duration = step["duration"] as? [String: Any], 
                       let durationValue = duration["value"] as? Int {
                        stepObject["duration"] = durationValue
                    }
                    
                    if let maneuver = step["maneuver"] as? String {
                        stepObject["maneuver"] = maneuver
                    } else {
                        stepObject["maneuver"] = ""
                    }
                    
                    stepsArray.append(stepObject)
                }
                
                legObject["steps"] = stepsArray
            }
            
            allLegs.append(legObject)
        }
        
        // Add all waypoints to the route
        routeObject["waypoints"] = allWaypoints
        
        // Add distance and duration
        routeObject["distance"] = totalDistance
        routeObject["duration"] = totalDuration
        
        // Add legs
        routeObject["legs"] = allLegs
        
        // Add polyline
        if let overviewPolyline = firstRoute["overview_polyline"] as? [String: Any],
           let points = overviewPolyline["points"] as? String {
            routeObject["polyline"] = points
        }
        
        // Create response
        let response = ["route": routeObject]
        
        DispatchQueue.main.async {
            call.resolve(response)
        }
    }
}
