
import CoreMotion

class ActivityManager {
    static let shared = ActivityManager()
    
    private var motionManager: CMMotionActivityManager?
    
    private init() {
        if CMMotionActivityManager.isActivityAvailable() {
            motionManager = CMMotionActivityManager()
        }
    }
    
    func startActivityMonitoring() {
        guard let motionManager = motionManager, 
              CMMotionActivityManager.isActivityAvailable() else {
            return
        }
        
        // Begin monitoring motion activity
        let queue = OperationQueue()
        motionManager.startActivityUpdates(to: queue) { activity in
            guard let activity = activity else { return }
            
            // Check if the device is stationary
            let isNowStationary = activity.stationary
            
            // If movement state changed
            if LocationManager.shared.isMoving == isNowStationary {
                DispatchQueue.main.async {
                    LocationManager.shared.setIsMoving(!isNowStationary)
                }
            }
        }
    }
    
    func stopActivityMonitoring() {
        motionManager?.stopActivityUpdates()
    }
}
