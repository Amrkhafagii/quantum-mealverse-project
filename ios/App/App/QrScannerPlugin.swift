
import Foundation
import Capacitor
import AVFoundation
import UIKit

@objc(QrScannerPlugin)
public class QrScannerPlugin: CAPPlugin {
    private var scanCompletion: ((String?) -> Void)?
    
    @objc func requestCameraPermission(_ call: CAPPluginCall) {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            call.resolve([
                "granted": granted
            ])
        }
    }
    
    @objc func checkCameraAvailability(_ call: CAPPluginCall) {
        let deviceDiscoverySession = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInWideAngleCamera],
            mediaType: .video,
            position: .back
        )
        
        let available = !deviceDiscoverySession.devices.isEmpty
        call.resolve([
            "available": available
        ])
    }
    
    @objc func scanQrCode(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let scannerViewController = QrScannerViewController()
            
            self.scanCompletion = { value in
                if let value = value {
                    call.resolve(["value": value])
                } else {
                    call.reject("Scanning cancelled or failed")
                }
            }
            
            scannerViewController.completionHandler = self.scanCompletion
            
            self.bridge?.viewController?.present(scannerViewController, animated: true)
        }
    }
}
