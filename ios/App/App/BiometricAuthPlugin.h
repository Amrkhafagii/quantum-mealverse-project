
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

NS_ASSUME_NONNULL_BEGIN

@interface BiometricAuthPlugin : CAPPlugin

- (void)isAvailable:(CAPPluginCall*)call;
- (void)authenticate:(CAPPluginCall*)call;
- (void)setupBiometricLogin:(CAPPluginCall*)call;

@end

NS_ASSUME_NONNULL_END
