
import UIKit
import ObjectiveC

extension UIView {
    /// Swizzle the autoresizingMask into constraints method to fix minimum width issues on iOS 15
    static func swizzleAutoresizingMaskIntoConstraintsIfNeeded() {
        // Check if we've already swizzled to avoid double-swizzling
        // This static variable persists for the life of the app
        var swizzled: Bool = false
        
        // Return early if already swizzled
        if swizzled {
            return
        }
        
        // Perform the swizzle
        swizzled = true
        
        // Get the original method and our replacement method
        let originalMethod = class_getInstanceMethod(UIView.self, #selector(getter: UIView.translatesAutoresizingMaskIntoConstraints))!
        let swizzledMethod = class_getInstanceMethod(UIView.self, #selector(UIView.swizzled_translatesAutoresizingMaskIntoConstraints))!
        
        // Perform the method swizzling
        method_exchangeImplementations(originalMethod, swizzledMethod)
        
        print("Successfully swizzled translatesAutoresizingMaskIntoConstraints")
    }
    
    /// Swizzled implementation of translatesAutoresizingMaskIntoConstraints
    @objc private func swizzled_translatesAutoresizingMaskIntoConstraints() -> Bool {
        // Add any custom behavior here if needed in the future
        return self.swizzled_translatesAutoresizingMaskIntoConstraints()
    }
}
