
import Foundation
import Capacitor
import CoreLocation

@objc(LocationPermissionsPlugin)
public class LocationPermissionsPlugin: CAPPlugin, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    private var permissionCallbacks = [String: CAPPluginCall]()

    override public func load() {
        locationManager.delegate = self
        print("LocationPermissionsPlugin loaded")
    }
    
    @objc func checkPermissionStatus(_ call: CAPPluginCall) {
        print("Checking permission status")
        let status = CLLocationManager.authorizationStatus()
        let result = getPermissionStatusDict(status)
        call.resolve(result)
    }
    
    @objc func requestLocationPermission(_ call: CAPPluginCall) {
        print("Requesting location permission")
        let includeBackground = call.getBool("includeBackground") ?? false
        let callbackId = call.callbackId
        
        if let callbackId = callbackId {
            permissionCallbacks[callbackId] = call
        }
        
        let status = CLLocationManager.authorizationStatus()
        
        switch status {
        case .notDetermined:
            if includeBackground && Bundle.main.object(forInfoDictionaryKey: "NSLocationAlwaysUsageDescription") != nil {
                locationManager.requestAlwaysAuthorization()
            } else {
                locationManager.requestWhenInUseAuthorization()
            }
        default:
            let result = getPermissionStatusDict(status)
            call.resolve(result)
            
            if let callbackId = callbackId {
                permissionCallbacks.removeValue(forKey: callbackId)
            }
        }
    }
    
    public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        print("Location permission status changed to: \(status)")
        let result = getPermissionStatusDict(status)
        
        for (callbackId, call) in permissionCallbacks {
            call.resolve(result)
            permissionCallbacks.removeValue(forKey: callbackId)
        }
    }
    
    private func getPermissionStatusDict(_ status: CLAuthorizationStatus) -> [String: String] {
        var locationStatus: String
        var backgroundStatus: String
        
        switch status {
        case .authorizedWhenInUse:
            locationStatus = "granted"
            backgroundStatus = "denied"
        case .authorizedAlways:
            locationStatus = "granted"
            backgroundStatus = "granted"
        case .denied:
            locationStatus = "denied"
            backgroundStatus = "denied"
        case .restricted:
            locationStatus = "denied"
            backgroundStatus = "denied"
        case .notDetermined:
            locationStatus = "prompt"
            backgroundStatus = "prompt"
        @unknown default:
            locationStatus = "prompt"
            backgroundStatus = "prompt"
        }
        
        return [
            "location": locationStatus,
            "backgroundLocation": backgroundStatus
        ]
    }
}
