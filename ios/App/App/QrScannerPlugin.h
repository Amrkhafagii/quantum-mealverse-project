
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

NS_ASSUME_NONNULL_BEGIN

@interface QrScannerPlugin : CAPPlugin

- (void)requestCameraPermission:(CAPPluginCall*)call;
- (void)checkCameraAvailability:(CAPPluginCall*)call;
- (void)scanQrCode:(CAPPluginCall*)call;

@end

NS_ASSUME_NONNULL_END
