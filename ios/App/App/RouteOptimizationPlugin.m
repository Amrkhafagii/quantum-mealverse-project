
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>
#import "RouteOptimizationPlugin.h"

CAP_PLUGIN(RouteOptimizationPlugin, "RouteOptimization",
           CAP_PLUGIN_METHOD(calculateOptimalRoute, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(calculateMultiStopRoute, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getEstimatedTime, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cancelRouteCalculation, CAPPluginReturnPromise);
)
