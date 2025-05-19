
import UIKit
import UserNotifications

class NotificationManager {
    static let shared = NotificationManager()
    
    private init() {}
    
    func registerForPushNotifications(_ application: UIApplication) {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { granted, _ in
            guard granted else { return }
            
            DispatchQueue.main.async {
                application.registerForRemoteNotifications()
            }
        }
    }
}
