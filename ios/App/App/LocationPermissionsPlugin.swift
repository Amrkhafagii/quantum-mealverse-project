
import Foundation
import Capacitor
import CoreLocation

@objc(LocationPermissionsPlugin)
public class LocationPermissionsPlugin: CAPPlugin {
    private var permissionCallbacks: [String: CAPPluginCall] = [:]
    
    @objc override public func load() {
        // Plugin load method if needed
    }
    
    @objc public func requestPermissions(_ call: CAPPluginCall) {
        let backgroundMode = call.getBool("background") ?? false
        let callbackId = call.callbackId
        
        // Store the callback to resolve later
        if let id = callbackId {
            permissionCallbacks[id] = call
            
            // Use LocationManager from the LocationManagement folder
            let locationManager = LocationManager.shared
            locationManager.requestLocationPermission(background: backgroundMode) { granted in
                if let savedCall = self.permissionCallbacks[id] {
                    savedCall.resolve([
                        "granted": granted
                    ])
                    self.permissionCallbacks.removeValue(forKey: id)
                }
            }
        } else {
            call.reject("Failed to process permission request")
        }
    }
    
    @objc public func checkPermissionStatus(_ call: CAPPluginCall) {
        let status = LocationManager.shared.checkLocationPermission()
        
        var statusString: String
        switch status {
        case .authorizedAlways:
            statusString = "granted_background"
        case .authorizedWhenInUse:
            statusString = "granted_foreground"
        case .denied, .restricted:
            statusString = "denied"
        case .notDetermined:
            statusString = "prompt"
        @unknown default:
            statusString = "unknown"
        }
        
        call.resolve([
            "status": statusString
        ])
    }
}
