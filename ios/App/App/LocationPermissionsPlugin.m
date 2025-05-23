
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN macro with methods in the same order as the header file
CAP_PLUGIN(LocationPermissionsPlugin, "LocationPermissions",
           CAP_PLUGIN_METHOD(checkPermissionStatus, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestLocationPermission, CAPPluginReturnPromise);
)
