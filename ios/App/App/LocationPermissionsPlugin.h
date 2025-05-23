
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(LocationPermissionsPlugin, "LocationPermissions",
           CAP_PLUGIN_METHOD(checkPermissionStatus, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestLocationPermission, CAPPluginReturnPromise);
)
