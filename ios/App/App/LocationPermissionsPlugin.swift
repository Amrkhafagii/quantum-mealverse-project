
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
    
    // Batching support
    private var pendingLocationUpdates: [CLLocation] = []
    private var batchProcessingTimer: Timer?
    private let batchSize = 5
    private let batchProcessingInterval: TimeInterval = 3.0 // seconds
    
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
        
        // Listen for permission changes from other components
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handlePermissionChange(_:)),
            name: Notification.Name("locationPermissionChanged"),
            object: nil
        )
    }
    
    deinit {
        stopAccuracyTimer()
        stopBatchProcessingTimer()
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
            let formattedStatus = formatPermissionStatus(status)
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
        let formattedStatus = formatPermissionStatus(status)
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
    
    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        let backgroundMode = call.getBool("background") ?? false
        let callbackId = call.callbackId
        
        // Check for rapid repeat calls
        let now = Date()
        let timeSinceLastRequest = now.timeIntervalSince(lastRequestTime)
        
        if timeSinceLastRequest < 1.0 && requestAttempts > 0 {
            // Too frequent, use cached result if available
            if let cache = permissionStatusCache, permissionCacheIsValid() {
                call.resolve(cache)
                return
            }
        }
        
        lastRequestTime = now
        
        // Store the callback to resolve later
        if let id = callbackId {
            permissionCallbacks[id] = call
            
            // Request permission via LocationManager with exponential backoff
            requestLocationPermissionWithBackoff(background: backgroundMode) { [weak self] status in
                guard let self = self else { return }
                
                if let savedCall = self.permissionCallbacks[id] {
                    let formattedStatus = self.formatPermissionStatus(status)
                    savedCall.resolve([
                        "location": formattedStatus.foreground,
                        "backgroundLocation": formattedStatus.background
                    ])
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
    
    @objc public func checkPermissionStatus(_ call: CAPPluginCall) {
        // Check cache first to avoid bridge calls
        if let cache = permissionStatusCache, permissionCacheIsValid() {
            call.resolve(cache)
            return
        }
        
        let status = checkLocationPermission()
        let formattedStatus = formatPermissionStatus(status)
        let result = [
            "location": formattedStatus.foreground,
            "backgroundLocation": formattedStatus.background
        ]
        
        // Update cache
        permissionStatusCache = result
        permissionCacheExpiry = Date().addingTimeInterval(cacheTTL)
        
        call.resolve(result)
    }
    
    private func requestLocationPermissionWithBackoff(background: Bool, completion: @escaping (CLAuthorizationStatus) -> Void) {
        guard let locationManager = self.locationManager else {
            completion(.denied)
            return
        }
        
        // Check if we've reached the maximum attempts
        if requestAttempts >= maxRequestAttempts {
            print("Maximum location permission request attempts reached")
            let currentStatus = checkLocationPermission()
            completion(currentStatus)
            return
        }
        
        // Increment attempt count
        requestAttempts += 1
        
        // Calculate backoff delay if this isn't the first attempt
        let backoffDelay = requestAttempts > 1 ? calculateBackoffDelay(attempt: requestAttempts) : 0
        
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
                self?.addToBatch(location)
            }
            
            locationManager.delegate = delegate
            
            // Determine which permission to request
            if background && Bundle.main.hasBackgroundMode(for: "location") {
                locationManager.requestAlwaysAuthorization()
            } else {
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
                locationManager.requestLocation()
            }
        }
    }
    
    // Add location to batch for processing
    private func addToBatch(_ location: CLLocation) {
        pendingLocationUpdates.append(location)
        
        if batchProcessingTimer == nil {
            startBatchProcessingTimer()
        }
        
        // Process immediately if we reach batch size
        if pendingLocationUpdates.count >= batchSize {
            processBatchedLocations()
        }
    }
    
    private func startBatchProcessingTimer() {
        batchProcessingTimer = Timer.scheduledTimer(
            withTimeInterval: batchProcessingInterval,
            repeats: false
        ) { [weak self] _ in
            self?.processBatchedLocations()
        }
    }
    
    private func stopBatchProcessingTimer() {
        batchProcessingTimer?.invalidate()
        batchProcessingTimer = nil
    }
    
    private func processBatchedLocations() {
        guard !pendingLocationUpdates.isEmpty else { return }
        
        stopBatchProcessingTimer()
        
        // Find the best location in the batch
        let bestLocation = pendingLocationUpdates.reduce(pendingLocationUpdates[0]) { (best, current) in
            // Prefer newer locations
            if current.timestamp.timeIntervalSince(best.timestamp) > 5.0 {
                return current
            }
            
            // If timestamps are close, prefer more accurate
            return current.horizontalAccuracy < best.horizontalAccuracy ? current : best
        }
        
        // Update the best available location
        handleBestLocation(bestLocation)
        
        // Clear the batch
        pendingLocationUpdates.removeAll()
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
            if !self.pendingLocationUpdates.isEmpty {
                self.processBatchedLocations()
            }
            
            // Use the best available location or timeout
            if self.bestAvailableLocation != nil {
                print("Using best available location with accuracy: \(self.bestAvailableLocation!.horizontalAccuracy)m")
            } else {
                print("No location available after timeout")
            }
            
            // Complete with current permission status
            let currentStatus = self.checkLocationPermission()
            completion(currentStatus)
        }
    }
    
    private func stopAccuracyTimer() {
        accuracyTimer?.invalidate()
        accuracyTimer = nil
    }
    
    private func calculateBackoffDelay(attempt: Int) -> TimeInterval {
        // Exponential backoff: 2^attempt * 500ms with some jitter
        let baseDelay = pow(2.0, Double(attempt - 1)) * 0.5 // seconds
        let jitter = Double.random(in: 0...0.25) * baseDelay // Add up to 25% random jitter
        
        // Cap at 10 seconds maximum
        return min(baseDelay + jitter, 10.0)
    }
    
    private func checkLocationPermission() -> CLAuthorizationStatus {
        if #available(iOS 14.0, *) {
            return locationManager?.authorizationStatus ?? .notDetermined
        } else {
            return CLLocationManager.authorizationStatus()
        }
    }
    
    private func formatPermissionStatus(_ status: CLAuthorizationStatus) -> (foreground: String, background: String) {
        switch status {
        case .authorizedAlways:
            return ("granted", "granted")
        case .authorizedWhenInUse:
            return ("granted", "denied")
        case .denied, .restricted:
            return ("denied", "denied")
        case .notDetermined:
            return ("prompt", "prompt")
        @unknown default:
            return ("prompt", "prompt")
        }
    }
}

// Extension to check if app has background modes configured
extension Bundle {
    func hasBackgroundMode(for mode: String) -> Bool {
        guard let backgroundModes = object(forInfoDictionaryKey: "UIBackgroundModes") as? [String] else {
            return false
        }
        return backgroundModes.contains(mode)
    }
}
