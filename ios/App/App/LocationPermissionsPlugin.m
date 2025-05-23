
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN macro
CAP_PLUGIN(LocationPermissionsPlugin, "LocationPermissions",
           CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(checkPermissionStatus, CAPPluginReturnPromise);
)
