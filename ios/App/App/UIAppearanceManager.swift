
import UIKit

class UIAppearanceManager {
    
    /// Configure appearance settings for navigation bars and toolbars
    static func configureUIAppearance() {
        // Modern appearance configuration for iOS 15+
        if #available(iOS 15.0, *) {
            configureModernAppearance()
        } else {
            configureLegacyAppearance()
        }
        
        // Ensure minimum width for toolbars
        UIView.swizzleAutoresizingMaskIntoConstraintsIfNeeded()
    }
    
    @available(iOS 15.0, *)
    private static func configureModernAppearance() {
        // Navigation bar appearance
        let navigationBarAppearance = UINavigationBarAppearance()
        navigationBarAppearance.configureWithDefaultBackground()
        UINavigationBar.appearance().standardAppearance = navigationBarAppearance
        UINavigationBar.appearance().compactAppearance = navigationBarAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navigationBarAppearance
        
        // Toolbar appearance
        let toolbarAppearance = UIToolbarAppearance()
        toolbarAppearance.configureWithDefaultBackground()
        UIToolbar.appearance().standardAppearance = toolbarAppearance
        UIToolbar.appearance().compactAppearance = toolbarAppearance
        UIToolbar.appearance().scrollEdgeAppearance = toolbarAppearance
    }
    
    private static func configureLegacyAppearance() {
        // Legacy appearance configuration for iOS versions before 15
        UINavigationBar.appearance().isTranslucent = false
        UIToolbar.appearance().isTranslucent = false
    }
}
