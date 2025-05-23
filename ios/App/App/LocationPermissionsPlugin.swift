
import Foundation
import Capacitor
import CoreLocation

@objc(LocationPermissionsPlugin)
public class LocationPermissionsPlugin: CAPPlugin {
    private var permissionCallbacks: [String: CAPPluginCall] = [:]
    private var locationManager: CLLocationManager?
    
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
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc func handlePermissionChange(_ notification: Notification) {
        // When permissions change elsewhere in the app, update any pending callbacks
        if let status = notification.userInfo?["status"] as? CLAuthorizationStatus {
            resolveAllPendingCallbacks(with: status)
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
    }
    
    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        let backgroundMode = call.getBool("background") ?? false
        let callbackId = call.callbackId
        
        // Store the callback to resolve later
        if let id = callbackId {
            permissionCallbacks[id] = call
            
            // Request permission via LocationManager
            requestLocationPermission(background: backgroundMode) { [weak self] status in
                guard let self = self else { return }
                
                if let savedCall = self.permissionCallbacks[id] {
                    let formattedStatus = self.formatPermissionStatus(status)
                    savedCall.resolve([
                        "location": formattedStatus.foreground,
                        "backgroundLocation": formattedStatus.background
                    ])
                    self.permissionCallbacks.removeValue(forKey: id)
                }
            }
        } else {
            call.reject("Failed to process permission request")
        }
    }
    
    @objc public func checkPermissionStatus(_ call: CAPPluginCall) {
        let status = checkLocationPermission()
        let formattedStatus = formatPermissionStatus(status)
        
        call.resolve([
            "location": formattedStatus.foreground,
            "backgroundLocation": formattedStatus.background
        ])
    }
    
    private func requestLocationPermission(background: Bool, completion: @escaping (CLAuthorizationStatus) -> Void) {
        guard let locationManager = self.locationManager else {
            completion(.denied)
            return
        }
        
        // Set up a one-time authorization change listener
        let delegate = StandardLocationDelegate()
        delegate.onAuthorizationChange = { status in
            completion(status)
        }
        
        locationManager.delegate = delegate
        
        // Determine which permission to request
        if background && Bundle.main.hasBackgroundMode(for: "location") {
            locationManager.requestAlwaysAuthorization()
        } else {
            locationManager.requestWhenInUseAuthorization()
        }
        
        // Check if permission is already determined
        let currentStatus: CLAuthorizationStatus
        if #available(iOS 14.0, *) {
            currentStatus = locationManager.authorizationStatus
        } else {
            currentStatus = CLLocationManager.authorizationStatus()
        }
        
        if currentStatus != .notDetermined {
            // Permission already set, call completion immediately
            completion(currentStatus)
        }
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
