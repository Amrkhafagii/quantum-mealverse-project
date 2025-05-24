
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>
#import <CoreLocation/CoreLocation.h>

// Define the plugin using the CAP_PLUGIN macro
CAP_PLUGIN(LocationPermissionsPlugin, "LocationPermissions",
           CAP_PLUGIN_METHOD(checkPermissionStatus, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestLocationPermission, CAPPluginReturnPromise);
)

@interface LocationPermissionsPlugin : CAPPlugin <CLLocationManagerDelegate>
@property (nonatomic, strong) CLLocationManager *locationManager;
@end

@implementation LocationPermissionsPlugin

- (void)load {
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate = self;
}

- (void)checkPermissionStatus:(CAPPluginCall *)call {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    
    NSString *locationStatus = @"prompt";
    NSString *backgroundStatus = @"prompt";
    
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
            locationStatus = @"prompt";
            break;
        case kCLAuthorizationStatusDenied:
        case kCLAuthorizationStatusRestricted:
            locationStatus = @"denied";
            break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            locationStatus = @"granted";
            backgroundStatus = @"denied";
            break;
        case kCLAuthorizationStatusAuthorizedAlways:
            locationStatus = @"granted";
            backgroundStatus = @"granted";
            break;
    }
    
    [call resolve:@{
        @"location": locationStatus,
        @"backgroundLocation": backgroundStatus
    }];
}

- (void)requestPermissions:(CAPPluginCall *)call {
    BOOL includeBackground = [call getBool:@"includeBackground" defaultValue:NO];
    
    if (includeBackground) {
        [self.locationManager requestAlwaysAuthorization];
    } else {
        [self.locationManager requestWhenInUseAuthorization];
    }
    
    // Store the call to resolve it when permission is granted/denied
    [self setCachedCall:call];
}

- (void)requestLocationPermission:(CAPPluginCall *)call {
    // Forward to requestPermissions
    [self requestPermissions:call];
}

#pragma mark - CLLocationManagerDelegate

- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    CAPPluginCall *call = [self getCachedCall];
    if (call == nil) {
        return;
    }
    
    NSString *locationStatus = @"prompt";
    NSString *backgroundStatus = @"prompt";
    
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
            // Don't resolve yet, wait for user decision
            return;
        case kCLAuthorizationStatusDenied:
        case kCLAuthorizationStatusRestricted:
            locationStatus = @"denied";
            backgroundStatus = @"denied";
            break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            locationStatus = @"granted";
            backgroundStatus = @"denied";
            break;
        case kCLAuthorizationStatusAuthorizedAlways:
            locationStatus = @"granted";
            backgroundStatus = @"granted";
            break;
    }
    
    [call resolve:@{
        @"location": locationStatus,
        @"backgroundLocation": backgroundStatus
    }];
    
    [self setCachedCall:nil];
}

@end
