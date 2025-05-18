
import Foundation
import Capacitor
import LocalAuthentication

@objc(BiometricAuthPlugin)
public class BiometricAuthPlugin: CAPPlugin {
    private let keychainService = "com.lovable.quantummealverse.biometric"
    
    @objc func isAvailable(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            var biometryType = "touchId" // Default
            
            if #available(iOS 11.0, *) {
                switch context.biometryType {
                case .faceID:
                    biometryType = "faceId"
                case .touchID:
                    biometryType = "touchId"
                case .none:
                    biometryType = "none"
                @unknown default:
                    biometryType = "unknown"
                }
            }
            
            call.resolve([
                "available": true,
                "biometryType": biometryType
            ])
        } else {
            call.resolve([
                "available": false,
                "biometryType": "none",
                "error": error?.localizedDescription ?? "Biometric authentication not available"
            ])
        }
    }
    
    @objc func authenticate(_ call: CAPPluginCall) {
        let reason = call.getString("reason") ?? "Authentication required"
        let title = call.getString("title") ?? "Authentication"
        
        let context = LAContext()
        context.localizedReason = reason
        
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
            DispatchQueue.main.async {
                if success {
                    call.resolve([
                        "authenticated": true
                    ])
                } else {
                    call.resolve([
                        "authenticated": false,
                        "error": error?.localizedDescription ?? "Authentication failed"
                    ])
                }
            }
        }
    }
    
    @objc func setupBiometricLogin(_ call: CAPPluginCall) {
        guard let userId = call.getString("userId"), let token = call.getString("token") else {
            call.reject("Missing parameters")
            return
        }
        
        // Store the user ID for future reference
        UserDefaults.standard.set(userId, forKey: "biometric_user_id")
        
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            // Create the query for saving to the keychain
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: keychainService,
                kSecAttrAccount as String: userId,
                kSecValueData as String: token.data(using: .utf8)!,
                kSecAttrAccessible as String: kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
            ]
            
            // Delete any existing item
            SecItemDelete(query as CFDictionary)
            
            // Add the new item
            let status = SecItemAdd(query as CFDictionary, nil)
            
            if status == errSecSuccess {
                call.resolve([
                    "success": true
                ])
            } else {
                call.resolve([
                    "success": false,
                    "error": "Keychain error: \(status)"
                ])
            }
        } else {
            call.resolve([
                "success": false,
                "error": error?.localizedDescription ?? "Biometric authentication not available"
            ])
        }
    }
}
