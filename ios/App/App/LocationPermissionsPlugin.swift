
import Foundation
import Capacitor
import CoreLocation

@objc(LocationPermissionsPlugin)
public class LocationPermissionsPlugin: CAPPlugin {
    private var permissionCallbacks: [String: CAPPluginCall] = [:]
    private var locationManager: CLLocationManager?
    private var bestAvailableLocation: CLLocation?
    private var accuracyTimer: Timer?
    private var requestAttempts: Int = 0
    private var lastRequestTime: Date = Date.distantPast
    private let maxRequestAttempts: Int = 3
    
    // Location batch processor
    private var batchProcessor: LocationBatchProcessor!
    
    // Cache for permission status
    private var permissionStatusCache: [String: Any]?
    private var permissionCacheExpiry: Date = Date.distantPast
    private let cacheTTL: TimeInterval = 60.0 // Cache permission status for 60 seconds
    
    // Accuracy and timeout settings
    private let desiredAccuracy: CLLocationAccuracy = 100 // 100 meters
    private let accuracyTimeout: TimeInterval = 15 // 15 seconds timeout for accuracy improvements
    
    @objc override public func load() {
        // Initialize location manager
        locationManager = CLLocationManager()
        
        // Initialize batch processor
        batchProcessor = LocationBatchProcessor()
        batchProcessor.setBestLocationHandler { [weak self] location in
            self?.handleBestLocation(location)
        }
        
        // Listen for permission changes from other components
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handlePermissionChange(_:)),
            name: Notification.Name("locationPermissionChanged"),
            object: nil
        )
        
        print("LocationPermissionsPlugin loaded")
    }
    
    deinit {
        stopAccuracyTimer()
        batchProcessor.stopBatchProcessingTimer()
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc func handlePermissionChange(_ notification: Notification) {
        // When permissions change elsewhere in the app, update any pending callbacks
        if let status = notification.userInfo?["status"] as? CLAuthorizationStatus {
            resolveAllPendingCallbacks(with: status)
            
            // Invalidate permission cache when permissions change
            invalidatePermissionCache()
        }
    }
    
    private func resolveAllPendingCallbacks(with status: CLAuthorizationStatus) {
        // Update all pending callbacks with the new status
        for (id, call) in permissionCallbacks {
            let formattedStatus = LocationPermissionHelper.formatPermissionStatus(status)
            call.resolve([
                "location": formattedStatus.foreground,
                "backgroundLocation": formattedStatus.background
            ])
            permissionCallbacks.removeValue(forKey: id)
        }
        
        // Update permission cache with new status
        updatePermissionCache(status: status)
        
        // Reset request attempts when permissions change
        requestAttempts = 0
    }
    
    // Cache permission status to reduce redundant checks
    private func updatePermissionCache(status: CLAuthorizationStatus) {
        let formattedStatus = LocationPermissionHelper.formatPermissionStatus(status)
        permissionStatusCache = [
            "location": formattedStatus.foreground,
            "backgroundLocation": formattedStatus.background
        ]
        permissionCacheExpiry = Date().addingTimeInterval(cacheTTL)
    }
    
    private func invalidatePermissionCache() {
        permissionStatusCache = nil
        permissionCacheExpiry = Date.distantPast
    }
    
    private func permissionCacheIsValid() -> Bool {
        guard let _ = permissionStatusCache else { return false }
        return Date() < permissionCacheExpiry
    }
    
    // MARK: - Capacitor Plugin Methods
    
    // Main method to request permissions - this is called from JS via `requestPermissions`
    @objc func requestPermissions(_ call: CAPPluginCall) {
        print("requestPermissions called")
        let includeBackground = call.getBool("includeBackground") ?? false
        requestLocationPermissionInternal(call: call, background: includeBackground)
    }
    
    // Alternative method - this is called from JS via `requestLocationPermission`
    @objc func requestLocationPermission(_ call: CAPPluginCall) {
        print("requestLocationPermission called")
        let includeBackground = call.getBool("includeBackground") ?? false
        requestLocationPermissionInternal(call: call, background: includeBackground)
    }
    
    // Method to check current permission status
    @objc func checkPermissionStatus(_ call: CAPPluginCall) {
        print("checkPermissionStatus called")
        // Check cache first to avoid bridge calls
        if let cache = permissionStatusCache, permissionCacheIsValid() {
            print("Using cached permission status")
            call.resolve(cache)
            return
        }
        
        let status = LocationPermissionHelper.checkLocationPermission(locationManager: locationManager)
        let formattedStatus = LocationPermissionHelper.formatPermissionStatus(status)
        let result = [
            "location": formattedStatus.foreground,
            "backgroundLocation": formattedStatus.background
        ]
        
        print("Permission status: \(result)")
        
        // Update cache
        permissionStatusCache = result
        permissionCacheExpiry = Date().addingTimeInterval(cacheTTL)
        
        call.resolve(result)
    }
    
    // Shared implementation for both requestPermission methods to avoid duplication
    private func requestLocationPermissionInternal(call: CAPPluginCall, background: Bool) {
        let callbackId = call.callbackId
        
        // Check for rapid repeat calls
        let now = Date()
        let timeSinceLastRequest = now.timeIntervalSince(lastRequestTime)
        
        if timeSinceLastRequest < 1.0 && requestAttempts > 0 {
            // Too frequent, use cached result if available
            if let cache = permissionStatusCache, permissionCacheIsValid() {
                print("Using cached permission result")
                call.resolve(cache)
                return
            }
        }
        
        lastRequestTime = now
        
        // Store the callback to resolve later
        if let id = callbackId {
            permissionCallbacks[id] = call
            
            // Request permission via LocationManager with exponential backoff
            requestLocationPermissionWithBackoff(background: background) { [weak self] status in
                guard let self = self else { return }
                
                if let savedCall = self.permissionCallbacks[id] {
                    let formattedStatus = LocationPermissionHelper.formatPermissionStatus(status)
                    let result = [
                        "location": formattedStatus.foreground,
                        "backgroundLocation": formattedStatus.background
                    ]
                    print("Resolving permission request with status: \(result)")
                    savedCall.resolve(result)
                    self.permissionCallbacks.removeValue(forKey: id)
                }
                
                // Update cache
                self.updatePermissionCache(status: status)
                
                // Reset attempts after successful resolution
                self.requestAttempts = 0
            }
        } else {
            call.reject("Failed to process permission request")
        }
    }
    
    private func requestLocationPermissionWithBackoff(background: Bool, completion: @escaping (CLAuthorizationStatus) -> Void) {
        guard let locationManager = self.locationManager else {
            completion(.denied)
            return
        }
        
        // Check if we've reached the maximum attempts
        if requestAttempts >= maxRequestAttempts {
            print("Maximum location permission request attempts reached")
            let currentStatus = LocationPermissionHelper.checkLocationPermission(locationManager: locationManager)
            completion(currentStatus)
            return
        }
        
        // Increment attempt count
        requestAttempts += 1
        
        // Calculate backoff delay if this isn't the first attempt
        let backoffDelay = requestAttempts > 1 ? LocationPermissionHelper.calculateBackoffDelay(attempt: requestAttempts) : 0
        
        DispatchQueue.main.asyncAfter(deadline: .now() + backoffDelay) { [weak self] in
            guard let self = self else { return }
            
            // Set up a one-time authorization change listener
            let delegate = StandardLocationDelegate()
            delegate.onAuthorizationChange = { status in
                completion(status)
                // Reset the delegate after completion
                self.locationManager?.delegate = nil
            }
            
            // Set up location update handler to check for accuracy
            delegate.onLocationUpdate = { [weak self] location in
                self?.handleLocationForAccuracy(location)
                self?.batchProcessor.addToBatch(location)
            }
            
            // Set up the delegate with the location manager
            delegate.setup(with: locationManager)
            locationManager.delegate = delegate
            
            // Determine which permission to request
            if background && Bundle.main.hasBackgroundMode(for: "location") {
                print("Requesting always authorization")
                locationManager.requestAlwaysAuthorization()
            } else {
                print("Requesting when in use authorization")
                locationManager.requestWhenInUseAuthorization()
            }
            
            // Start the accuracy timer
            self.startAccuracyTimer(completion: completion)
            
            // Check if permission is already determined
            let currentStatus: CLAuthorizationStatus
            if #available(iOS 14.0, *) {
                currentStatus = locationManager.authorizationStatus
            } else {
                currentStatus = CLLocationManager.authorizationStatus()
            }
            
            if currentStatus != .notDetermined {
                // Permission already set, request location to check accuracy
                print("Permission already determined: \(currentStatus), requesting location")
                locationManager.requestLocation()
            }
        }
    }
    
    private func handleBestLocation(_ location: CLLocation) {
        bestAvailableLocation = location
        print("Best batched location: \(location.coordinate), accuracy: \(location.horizontalAccuracy)m")
    }
    
    private func handleLocationForAccuracy(_ location: CLLocation) {
        // Cache this location if it's better than what we have
        if bestAvailableLocation == nil || 
           location.horizontalAccuracy < bestAvailableLocation!.horizontalAccuracy {
            bestAvailableLocation = location
            print("Updated best location: \(location.coordinate), accuracy: \(location.horizontalAccuracy)m")
            
            // If accuracy meets our threshold, stop the timer
            if location.horizontalAccuracy <= desiredAccuracy {
                stopAccuracyTimer()
            }
        }
    }
    
    private func startAccuracyTimer(completion: @escaping (CLAuthorizationStatus) -> Void) {
        // Cancel any existing timer
        stopAccuracyTimer()
        
        // Start a new timer
        accuracyTimer = Timer.scheduledTimer(withTimeInterval: accuracyTimeout, repeats: false) { [weak self] _ in
            guard let self = self else { return }
            
            print("Accuracy timeout reached, using best available location")
            self.stopAccuracyTimer()
            
            // Process any pending batched locations
            self.batchProcessor.processBatchedLocations()
            
            // Use the best available location or timeout
            if self.bestAvailableLocation != nil {
                print("Using best available location with accuracy: \(self.bestAvailableLocation!.horizontalAccuracy)m")
            } else {
                print("No location available after timeout")
            }
            
            // Complete with current permission status
            let currentStatus = LocationPermissionHelper.checkLocationPermission(locationManager: self.locationManager)
            completion(currentStatus)
        }
    }
    
    private func stopAccuracyTimer() {
        accuracyTimer?.invalidate()
        accuracyTimer = nil
    }
}

// Extension to check for background modes
extension Bundle {
    func hasBackgroundMode(for mode: String) -> Bool {
        guard let backgroundModes = object(forInfoDictionaryKey: "UIBackgroundModes") as? [String] else {
            return false
        }
        return backgroundModes.contains(mode)
    }
}
