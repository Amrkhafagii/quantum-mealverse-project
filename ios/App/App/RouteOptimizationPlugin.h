
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

NS_ASSUME_NONNULL_BEGIN

@interface RouteOptimizationPlugin : CAPPlugin

- (void)calculateOptimalRoute:(CAPPluginCall*)call;
- (void)calculateMultiStopRoute:(CAPPluginCall*)call;
- (void)getEstimatedTime:(CAPPluginCall*)call;
- (void)cancelRouteCalculation:(CAPPluginCall*)call;

@end

NS_ASSUME_NONNULL_END
