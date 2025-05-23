
import CoreLocation

class LocationQualityManager {
    // Location filtering parameters
    private let minimumHorizontalAccuracy: CLLocationAccuracy = 100.0
    private let significantDistance: CLLocationDistance = 50.0 // 50 meters considered significant
    private let poorQualityThreshold: Int = 3 // Number of consecutive poor quality locations
    
    private var lastSignificantLocation: CLLocation?
    private var poorQualityLocationCount: Int = 0
    
    // New variables for warm-up handling
    private var isInWarmUpPeriod: Bool = true
    private var warmUpLocationCount: Int = 0
    private let warmUpThreshold: Int = 5 // Number of locations to consider before exiting warm-up
    private var initialAccuracyThreshold: CLLocationAccuracy = 1000.0 // More lenient during warm-up
    
    // Timestamps for tracking service operation
    private var serviceStartTime: Date?
    private var lastQualityLocationTime: Date?
    
    init() {
        serviceStartTime = Date()
        print("LocationQualityManager initialized, warm-up period active")
    }
    
    func isQualityLocation(_ location: CLLocation) -> Bool {
        // Special handling for warm-up period
        if isInWarmUpPeriod {
            handleWarmUpPeriod(location)
            
            // During warm-up, use a more lenient accuracy threshold
            if location.horizontalAccuracy > 0 && location.horizontalAccuracy < initialAccuracyThreshold {
                warmUpLocationCount += 1
                print("Warm-up: Acceptable location received (\(warmUpLocationCount)/\(warmUpThreshold)), accuracy: \(location.horizontalAccuracy)m")
                
                // Check if we've received enough decent locations to exit warm-up
                if warmUpLocationCount >= warmUpThreshold {
                    isInWarmUpPeriod = false
                    print("Warm-up period complete after \(Date().timeIntervalSince(serviceStartTime ?? Date())) seconds")
                }
                
                return true
            } else {
                print("Warm-up: Poor location rejected, accuracy: \(location.horizontalAccuracy)m")
                poorQualityLocationCount += 1
                return false
            }
        }
        
        // Standard quality checks after warm-up period
        // Check horizontal accuracy
        guard location.horizontalAccuracy > 0 && location.horizontalAccuracy < minimumHorizontalAccuracy else {
            poorQualityLocationCount += 1
            print("Poor quality location detected: accuracy \(location.horizontalAccuracy)m")
            return false
        }
        
        // Reset poor quality counter since we got a good location
        poorQualityLocationCount = 0
        lastQualityLocationTime = Date()
        
        // Check for significant movement if we have a previous location
        if let lastLocation = lastSignificantLocation {
            let distance = location.distance(from: lastLocation)
            if distance < significantDistance {
                // Not significant movement
                print("Movement not significant: \(distance)m")
                return false
            }
        }
        
        // This is a quality location
        lastSignificantLocation = location
        return true
    }
    
    private func handleWarmUpPeriod(_ location: CLLocation) {
        // Gradually decrease the initial accuracy threshold as we get more locations
        // This allows us to be more lenient at first, but gradually more strict
        let serviceRuntime = Date().timeIntervalSince(serviceStartTime ?? Date())
        
        // After 5 seconds, start tightening accuracy requirements
        if serviceRuntime > 5.0 {
            initialAccuracyThreshold = max(minimumHorizontalAccuracy * 2, initialAccuracyThreshold * 0.8)
            print("Warm-up: Adjusting accuracy threshold to \(initialAccuracyThreshold)m after \(serviceRuntime)s")
        }
        
        // Force exit warm-up period after 20 seconds regardless of location quality
        if serviceRuntime > 20.0 && isInWarmUpPeriod {
            isInWarmUpPeriod = false
            print("Warm-up: Force exiting warm-up period after \(serviceRuntime)s")
        }
    }
    
    func takePoorQualityAction(
        locationManager: CLLocationManager?,
        startHybridPositioningCallback: @escaping () -> Void
    ) {
        if poorQualityLocationCount >= poorQualityThreshold {
            print("Multiple poor quality locations detected. Adjusting strategy.")
            
            // Try different accuracy settings based on current state
            if isInWarmUpPeriod {
                // During warm-up, focus on getting any usable location
                locationManager?.desiredAccuracy = kCLLocationAccuracyHundredMeters
                print("Warm-up: Relaxing accuracy requirements temporarily")
            } else {
                // After warm-up, try to improve accuracy
                locationManager?.desiredAccuracy = kCLLocationAccuracyBest
                print("Post warm-up: Requesting highest accuracy")
                
                // Stop updates briefly and restart to reset internal filters
                locationManager?.stopUpdatingLocation()
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    locationManager?.startUpdatingLocation()
                }
            }
            
            // Reset inaccurate counter
            poorQualityLocationCount = 0
            
            // Try to activate hybrid positioning if we're past warm-up period
            if !isInWarmUpPeriod {
                startHybridPositioningCallback()
            }
        }
    }
    
    // Check if location service appears to be stuck
    func isLocationServiceStuck() -> Bool {
        guard let lastQualityTime = lastQualityLocationTime,
              let startTime = serviceStartTime else {
            return false
        }
        
        let timeSinceLastQuality = Date().timeIntervalSince(lastQualityTime)
        let totalRuntime = Date().timeIntervalSince(startTime)
        
        // Consider service stuck if:
        // 1. We've been running for at least 30 seconds
        // 2. Haven't had a quality location in over 60 seconds
        return totalRuntime > 30.0 && timeSinceLastQuality > 60.0
    }
    
    // Reset the manager state (useful when changing significant location modes)
    func reset() {
        isInWarmUpPeriod = true
        warmUpLocationCount = 0
        poorQualityLocationCount = 0
        serviceStartTime = Date()
        lastQualityLocationTime = nil
        print("LocationQualityManager reset, warm-up period reactivated")
    }
}

