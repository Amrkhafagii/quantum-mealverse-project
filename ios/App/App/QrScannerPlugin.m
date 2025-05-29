
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN macro.
CAP_PLUGIN(QrScannerPlugin, "QrScanner",
           CAP_PLUGIN_METHOD(requestCameraPermission, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(checkCameraAvailability, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(scanQrCode, CAPPluginReturnPromise);
)
