
package com.lovable.quantummealverse

import android.os.Handler
import android.os.Looper
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.places.api.Places
import com.google.maps.DirectionsApi
import com.google.maps.GeoApiContext
import com.google.maps.android.PolyUtil
import com.google.maps.model.DirectionsResult
import com.google.maps.model.TravelMode
import com.google.maps.model.Unit
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Route Optimization Plugin for Android using Google Maps Routes API
 */
@CapacitorPlugin(name = "RouteOptimization")
class RouteOptimizationPlugin : Plugin() {
    private var executor: ExecutorService? = null
    private var geoApiContext: GeoApiContext? = null
    private var isCalculating = false
    private val handler = Handler(Looper.getMainLooper())
    
    override fun load() {
        super.load()
        executor = Executors.newSingleThreadExecutor()
        
        // Initialize the Google Maps API context
        val apiKey = getConfig().getString("googleMapsApiKey", "") ?: ""
        if (apiKey.isNotEmpty()) {
            geoApiContext = GeoApiContext.Builder()
                .apiKey(apiKey)
                .build()
        }
        
        // Initialize Places API if needed
        if (!Places.isInitialized()) {
            Places.initialize(context, apiKey)
        }
    }
    
    @PluginMethod
    fun calculateOptimalRoute(call: PluginCall) {
        if (geoApiContext == null) {
            call.reject("Google Maps API context is not initialized")
            return
        }
        
        if (isCalculating) {
            call.reject("Route calculation already in progress")
            return
        }
        
        // Extract origin and destination
        val origin = call.getObject("origin") ?: run {
            call.reject("Origin is required")
            return
        }
        
        val destination = call.getObject("destination") ?: run {
            call.reject("Destination is required")
            return
        }
        
        val originLat = origin.getDouble("latitude")
        val originLng = origin.getDouble("longitude")
        val destLat = destination.getDouble("latitude")
        val destLng = destination.getDouble("longitude")
        
        // Extract waypoints if available
        val waypoints = call.getArray("waypoints")
        val waypointCoordinates = mutableListOf<String>()
        if (waypoints != null) {
            for (i in 0 until waypoints.length()) {
                val waypoint = waypoints.getJSObject(i)
                val lat = waypoint.getDouble("latitude")
                val lng = waypoint.getDouble("longitude")
                waypointCoordinates.add("$lat,$lng")
            }
        }
        
        // Extract options
        val options = call.getObject("options") ?: JSObject()
        val optimizeWaypoints = options.getBool("optimizeWaypoints", true)
        val avoidTolls = options.getBool("avoidTolls", false)
        val avoidHighways = options.getBool("avoidHighways", false)
        val modeString = options.getString("mode", "driving")
        
        // Convert mode string to TravelMode
        val travelMode = when (modeString) {
            "walking" -> TravelMode.WALKING
            "bicycling" -> TravelMode.BICYCLING
            "transit" -> TravelMode.TRANSIT
            else -> TravelMode.DRIVING
        }
        
        // Start the route calculation in a background thread
        isCalculating = true
        executor?.execute {
            try {
                // Build the request
                var requestBuilder = DirectionsApi.newRequest(geoApiContext)
                    .origin("$originLat,$originLng")
                    .destination("$destLat,$destLng")
                    .mode(travelMode)
                    .units(Unit.METRIC)
                
                // Add waypoints if available
                if (waypointCoordinates.isNotEmpty()) {
                    requestBuilder = requestBuilder.waypoints(*waypointCoordinates.toTypedArray())
                    
                    // Optimize waypoints if requested
                    if (optimizeWaypoints) {
                        requestBuilder = requestBuilder.optimizeWaypoints(true)
                    }
                }
                
                // Add avoid options
                if (avoidTolls) {
                    requestBuilder = requestBuilder.avoidTolls(true)
                }
                
                if (avoidHighways) {
                    requestBuilder = requestBuilder.avoidHighways(true)
                }
                
                // Make the request
                val result = requestBuilder.await()
                
                // Handle the result on the main thread
                handler.post {
                    handleDirectionsResult(result, call)
                    isCalculating = false
                }
            } catch (e: Exception) {
                handler.post {
                    call.reject("Failed to calculate route: ${e.message}")
                    isCalculating = false
                }
            }
        }
    }
    
    @PluginMethod
    fun calculateMultiStopRoute(call: PluginCall) {
        if (geoApiContext == null) {
            call.reject("Google Maps API context is not initialized")
            return
        }
        
        if (isCalculating) {
            call.reject("Route calculation already in progress")
            return
        }
        
        // Extract stops array
        val stops = call.getArray("stops") ?: run {
            call.reject("Stops array is required")
            return
        }
        
        if (stops.length() < 2) {
            call.reject("At least 2 stops are required")
            return
        }
        
        val returnToOrigin = call.getBool("returnToOrigin", false) ?: false
        val options = call.getObject("options") ?: JSObject()
        
        // Convert stops to list of coordinates
        val stopCoordinates = mutableListOf<LatLng>()
        for (i in 0 until stops.length()) {
            val stop = stops.getJSObject(i)
            val lat = stop.getDouble("latitude")
            val lng = stop.getDouble("longitude")
            stopCoordinates.add(LatLng(lat, lng))
        }
        
        // Add first stop to the end if returning to origin
        if (returnToOrigin && stopCoordinates.isNotEmpty()) {
            stopCoordinates.add(stopCoordinates.first())
        }
        
        // For multi-stop routes, we'll solve this as a TSP problem
        isCalculating = true
        executor?.execute {
            try {
                // For now, we'll just create a simple route between consecutive points
                // In a real implementation, you might use a TSP solver or the Directions API with waypoints
                val optimizedRoute = calculateOptimizedRoute(stopCoordinates, options)
                
                handler.post {
                    // Create the response
                    val response = JSObject()
                    response.put("route", optimizedRoute)
                    call.resolve(response)
                    isCalculating = false
                }
            } catch (e: Exception) {
                handler.post {
                    call.reject("Failed to calculate multi-stop route: ${e.message}")
                    isCalculating = false
                }
            }
        }
    }
    
    @PluginMethod
    fun getEstimatedTime(call: PluginCall) {
        if (geoApiContext == null) {
            call.reject("Google Maps API context is not initialized")
            return
        }
        
        // Extract origin and destination
        val origin = call.getObject("origin") ?: run {
            call.reject("Origin is required")
            return
        }
        
        val destination = call.getObject("destination") ?: run {
            call.reject("Destination is required")
            return
        }
        
        val originLat = origin.getDouble("latitude")
        val originLng = origin.getDouble("longitude")
        val destLat = destination.getDouble("latitude")
        val destLng = destination.getDouble("longitude")
        
        // Create a departure time if specified
        val departureTimeMillis = call.getObject("departureTime")?.getLong("time")
        
        executor?.execute {
            try {
                // Build the request
                var requestBuilder = DirectionsApi.newRequest(geoApiContext)
                    .origin("$originLat,$originLng")
                    .destination("$destLat,$destLng")
                    .mode(TravelMode.DRIVING)
                
                // Apply departure time if available
                if (departureTimeMillis != null) {
                    val departureTime = com.google.maps.model.DateTime(departureTimeMillis)
                    requestBuilder = requestBuilder.departureTime(departureTime)
                }
                
                // Make the request
                val result = requestBuilder.await()
                
                // Handle the result on the main thread
                handler.post {
                    if (result.routes.isNotEmpty() && result.routes[0].legs.isNotEmpty()) {
                        val leg = result.routes[0].legs[0]
                        val response = JSObject()
                        response.put("duration", leg.duration.inSeconds)
                        response.put("distance", leg.distance.inMeters)
                        call.resolve(response)
                    } else {
                        call.reject("Could not calculate ETA")
                    }
                }
            } catch (e: Exception) {
                handler.post {
                    call.reject("Failed to get estimated time: ${e.message}")
                }
            }
        }
    }
    
    @PluginMethod
    fun cancelRouteCalculation(call: PluginCall) {
        isCalculating = false
        call.resolve()
    }
    
    private fun handleDirectionsResult(result: DirectionsResult, call: PluginCall) {
        if (result.routes.isEmpty()) {
            call.reject("No routes found")
            return
        }
        
        val route = result.routes[0]
        
        // Create the route object
        val routeObject = JSObject()
        
        // Add waypoints array
        val waypointsArray = JSArray()
        for (leg in route.legs) {
            // Add start location of each leg
            val startLocationObj = JSObject()
            startLocationObj.put("latitude", leg.startLocation.lat)
            startLocationObj.put("longitude", leg.startLocation.lng)
            waypointsArray.put(startLocationObj)
            
            // Add end location of final leg
            if (leg == route.legs.last()) {
                val endLocationObj = JSObject()
                endLocationObj.put("latitude", leg.endLocation.lat)
                endLocationObj.put("longitude", leg.endLocation.lng)
                waypointsArray.put(endLocationObj)
            }
        }
        routeObject.put("waypoints", waypointsArray)
        
        // Add distance and duration
        var totalDistance = 0
        var totalDuration = 0
        for (leg in route.legs) {
            totalDistance += leg.distance.inMeters
            totalDuration += leg.duration.inSeconds.toInt()
        }
        routeObject.put("distance", totalDistance)
        routeObject.put("duration", totalDuration)
        
        // Encode polyline
        routeObject.put("polyline", route.overviewPolyline.encodedPath)
        
        // Add legs
        val legsArray = JSArray()
        for (leg in route.legs) {
            val legObject = JSObject()
            
            // Add start and end locations
            val startLocationObj = JSObject()
            startLocationObj.put("latitude", leg.startLocation.lat)
            startLocationObj.put("longitude", leg.startLocation.lng)
            legObject.put("startLocation", startLocationObj)
            
            val endLocationObj = JSObject()
            endLocationObj.put("latitude", leg.endLocation.lat)
            endLocationObj.put("longitude", leg.endLocation.lng)
            legObject.put("endLocation", endLocationObj)
            
            // Add distance and duration
            legObject.put("distance", leg.distance.inMeters)
            legObject.put("duration", leg.duration.inSeconds)
            
            // Add steps
            val stepsArray = JSArray()
            for (step in leg.steps) {
                val stepObject = JSObject()
                stepObject.put("instructions", step.htmlInstructions)
                stepObject.put("distance", step.distance.inMeters)
                stepObject.put("duration", step.duration.inSeconds)
                stepObject.put("maneuver", step.maneuver ?: "")
                stepsArray.put(stepObject)
            }
            legObject.put("steps", stepsArray)
            
            legsArray.put(legObject)
        }
        routeObject.put("legs", legsArray)
        
        // Create response
        val response = JSObject()
        response.put("route", routeObject)
        call.resolve(response)
    }
    
    private fun calculateOptimizedRoute(stops: List<LatLng>, options: JSObject): JSObject {
        // In a real implementation, you would use a TSP solver here
        // For now, we'll just create a simple route between consecutive points
        
        val routeObject = JSObject()
        
        // Add waypoints
        val waypointsArray = JSArray()
        for (stop in stops) {
            val locationObj = JSObject()
            locationObj.put("latitude", stop.latitude)
            locationObj.put("longitude", stop.longitude)
            waypointsArray.put(locationObj)
        }
        routeObject.put("waypoints", waypointsArray)
        
        // Calculate simple distance and duration based on straight-line distance
        var totalDistance = 0.0
        var totalDuration = 0
        val legsArray = JSArray()
        
        for (i in 0 until stops.size - 1) {
            val startPoint = stops[i]
            val endPoint = stops[i + 1]
            
            // Calculate straight-line distance
            val distance = calculateDistance(startPoint, endPoint)
            totalDistance += distance
            
            // Estimate duration (assuming 50 km/h average speed)
            val durationSeconds = (distance / 1000.0 / 50.0 * 3600.0).toInt()
            totalDuration += durationSeconds
            
            // Create leg object
            val legObject = JSObject()
            
            val startLocationObj = JSObject()
            startLocationObj.put("latitude", startPoint.latitude)
            startLocationObj.put("longitude", startPoint.longitude)
            legObject.put("startLocation", startLocationObj)
            
            val endLocationObj = JSObject()
            endLocationObj.put("latitude", endPoint.latitude)
            endLocationObj.put("longitude", endPoint.longitude)
            legObject.put("endLocation", endLocationObj)
            
            legObject.put("distance", distance)
            legObject.put("duration", durationSeconds)
            
            legsArray.put(legObject)
        }
        
        routeObject.put("distance", totalDistance)
        routeObject.put("duration", totalDuration)
        routeObject.put("legs", legsArray)
        
        // Generate a simple polyline for visualization
        val encodedPolyline = encodePolyline(stops)
        routeObject.put("polyline", encodedPolyline)
        
        return routeObject
    }
    
    private fun calculateDistance(point1: LatLng, point2: LatLng): Double {
        val lat1 = Math.toRadians(point1.latitude)
        val lon1 = Math.toRadians(point1.longitude)
        val lat2 = Math.toRadians(point2.latitude)
        val lon2 = Math.toRadians(point2.longitude)
        
        val earthRadius = 6371000.0 // meters
        
        val dLat = lat2 - lat1
        val dLon = lon2 - lon1
        
        val a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        
        return earthRadius * c
    }
    
    private fun encodePolyline(points: List<LatLng>): String {
        return PolyUtil.encode(points)
    }
    
    override fun handleOnDestroy() {
        super.handleOnDestroy()
        geoApiContext?.shutdown()
        executor?.shutdown()
    }
}
