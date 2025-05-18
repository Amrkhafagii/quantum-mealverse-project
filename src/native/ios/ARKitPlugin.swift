import Foundation
import Capacitor
import ARKit
import SceneKit

@objc(ARPreviewPlugin)
public class ARPreviewPlugin: CAPPlugin {
    private var arView: ARSCNView?
    private var modelNode: SCNNode?
    
    @objc func isSupported(_ call: CAPPluginCall) {
        let supported = ARWorldTrackingConfiguration.isSupported
        call.resolve([
            "supported": supported
        ])
    }
    
    @objc func startARSession(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard ARWorldTrackingConfiguration.isSupported else {
                call.reject("AR World Tracking is not supported on this device")
                return
            }
            
            // Create AR View if it doesn't exist
            if self.arView == nil {
                self.arView = ARSCNView(frame: self.bridge?.viewController?.view.bounds ?? CGRect.zero)
                
                // Configure AR View
                self.arView?.autoenablesDefaultLighting = true
                self.arView?.automaticallyUpdatesLighting = true
                
                // Add to view hierarchy
                self.bridge?.viewController?.view.addSubview(self.arView!)
            }
            
            // Configure AR Session
            let configuration = ARWorldTrackingConfiguration()
            configuration.planeDetection = .horizontal
            
            // Start AR Session
            self.arView?.session.run(configuration)
            
            call.resolve()
        }
    }
    
    @objc func loadModel(_ call: CAPPluginCall) {
        guard let modelURL = call.getString("modelUrl") else {
            call.reject("Model URL is required")
            return
        }
        
        let scale = call.getFloat("scale") ?? 1.0
        
        DispatchQueue.main.async {
            // In a real implementation, we would load the 3D model from the URL
            // For this stub, we'll create a simple 3D object
            let geometry = SCNBox(width: 0.1, height: 0.1, length: 0.1, chamferRadius: 0.01)
            geometry.firstMaterial?.diffuse.contents = UIColor.blue
            
            self.modelNode = SCNNode(geometry: geometry)
            self.modelNode?.scale = SCNVector3(scale, scale, scale)
            
            call.resolve([
                "success": true
            ])
        }
    }
    
    @objc func placeModel(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let arView = self.arView, let modelNode = self.modelNode else {
                call.reject("AR session not initialized or model not loaded")
                return
            }
            
            // If position is specified, place the model there
            if let position = call.getObject("position") {
                let x = position["x"] as? Float ?? 0
                let y = position["y"] as? Float ?? 0
                let z = position["z"] as? Float ?? -0.5
                
                modelNode.position = SCNVector3(x, y, z)
                arView.scene.rootNode.addChildNode(modelNode)
            } else {
                // Otherwise place it in front of the camera
                guard let camera = arView.session.currentFrame?.camera else {
                    call.reject("Could not get camera position")
                    return
                }
                
                var translation = matrix_identity_float4x4
                translation.columns.3.z = -0.5
                let transform = simd_mul(camera.transform, translation)
                
                modelNode.simdTransform = transform
                arView.scene.rootNode.addChildNode(modelNode)
            }
            
            call.resolve()
        }
    }
    
    @objc func stopARSession(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.arView?.session.pause()
            self.arView?.removeFromSuperview()
            self.arView = nil
            self.modelNode = nil
            
            call.resolve()
        }
    }
}
