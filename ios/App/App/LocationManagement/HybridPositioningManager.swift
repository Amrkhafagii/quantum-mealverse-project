
import CoreLocation
import NetworkExtension

class HybridPositioningManager {
    // Hybrid positioning properties
    private var wifiPositioningEnabled: Bool = true
    private var cellTowerPositioningEnabled: Bool = true
    private var hybridLocationsBuffer: [CLLocation] = []
    private var lastPositioningAttemptTimestamp: Date?
    var lastSignificantLocation: CLLocation?
    
    private let hybridLocationsBufferMaxSize = 5
    
    func startHybridPositioning(
        locationManager: CLLocationManager?,
        significantLocationManager: CLLocationManager?
    ) {
        guard let locationManager = locationManager,
              let significantLocationManager = significantLocationManager else { return }
        
        // 1. GPS/Core Location - Standard updates
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.startUpdatingLocation()
        
        // 2. Significant Location Changes - Battery efficient background updates
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            significantLocationManager.startMonitoringSignificantLocationChanges()
        }
        
        // 3. Enable WiFi positioning if allowed and available
        if wifiPositioningEnabled {
            // WiFi positioning happens automatically when using CoreLocation
            // But we can ensure WiFi is enabled when possible
            if #available(iOS 13.0, *) {
                activateWifiIfNeeded()
            }
        }
        
        // Clear and initialize the location buffer
        hybridLocationsBuffer.removeAll()
        
        print("Hybrid positioning system started")
    }
    
    @available(iOS 13.0, *)
    private func activateWifiIfNeeded() {
        // Request WiFi information access - this improves location accuracy when WiFi is used
        NEHotspotHelper.register(options: [:], queue: .main) { _ in }
    }
    
    // Add a location to the hybrid buffer and process when we have enough data
    func addToHybridLocationsBuffer(_ location: CLLocation) {
        // Only add quality locations to buffer
        guard location.horizontalAccuracy > 0 && location.horizontalAccuracy < 100 else {
            return
        }
        
        // Add to buffer
        hybridLocationsBuffer.append(location)
        
        // Maintain max buffer size
        if hybridLocationsBuffer.count > hybridLocationsBufferMaxSize {
            hybridLocationsBuffer.removeFirst()
        }
        
        // If we have enough locations, process them
        if hybridLocationsBuffer.count >= 3 {
            processHybridLocations()
        }
        
        // Store as significant location for recovery purposes
        lastSignificantLocation = location
    }
    
    // Process the buffered locations to get a more accurate position
    private func processHybridLocations() {
        // Skip if buffer is empty
        guard !hybridLocationsBuffer.isEmpty else { return }
        
        // Simple approach: use the location with best accuracy
        var bestLocation = hybridLocationsBuffer[0]
        
        for location in hybridLocationsBuffer {
            if location.horizontalAccuracy < bestLocation.horizontalAccuracy {
                bestLocation = location
            }
        }
        
        // Use the best location for external reporting
        NotificationCenter.default.post(
            name: Notification.Name("hybridLocationAvailable"),
            object: nil,
            userInfo: ["location": bestLocation]
        )
    }
}
