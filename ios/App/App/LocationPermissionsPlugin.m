
#import <Foundation/Foundation.h>
#import "LocationPermissionsPlugin.h"
#import <Capacitor/Capacitor.h>

// This is a proper bridge implementation that forwards to Swift
// instead of providing a duplicate implementation
@implementation LocationPermissionsPlugin

CAP_PLUGIN_METHOD(checkPermissionStatus, CAPPluginReturnPromise);
CAP_PLUGIN_METHOD(requestLocationPermission, CAPPluginReturnPromise);

@end
