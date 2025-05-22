
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor-Swift.h>
#import "LocationPermissionsPlugin.h"

@implementation LocationPermissionsPlugin

CAP_PLUGIN(LocationPermissionsPlugin, "LocationPermissions",
    CAP_PLUGIN_METHOD(checkPermissionStatus, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestLocationPermission, CAPPluginReturnPromise);
)

@end
