
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Auth from "@/pages/Auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { DeliveryMapProvider } from "@/contexts/DeliveryMapContext";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { BackgroundSyncManager } from "@/components/sync/BackgroundSyncManager";
import { MapViewProvider } from "@/contexts/MapViewContext";
import MainLayout from "@/components/layout/MainLayout";
import PlatformUIDemo from "@/pages/PlatformUIDemo";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StorageDemoPage from './pages/StorageDemo';
import AdaptiveFormDemo from './pages/AdaptiveFormDemo';
import PlatformLayoutDemo from './pages/PlatformLayoutDemo';
import NetworkAdaptationDemo from './pages/NetworkAdaptationDemo';
import ConnectionManagementDemo from './pages/ConnectionManagementDemo';
import { RequestQueueProvider } from "./components/network/RequestQueue";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ResponsiveProvider>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <GoogleMapsProvider>
              <MapViewProvider>
                <DeliveryMapProvider>
                  <NetworkStatusProvider>
                    <NetworkProvider>
                      <RequestQueueProvider>
                        <BackgroundSyncManager>
                          <BrowserRouter>
                            {/* No AnimatePresence wrapper to avoid conflict with PageTransition */}
                            <Routes>
                              {/* Auth routes with mode parameters */}
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/login" element={<Auth />} />
                              {/* Fix: Pass the signup mode directly to the Auth component */}
                              <Route path="/register" element={<Auth mode="signup" />} />
                              
                              {/* Demo routes handled at App level */}
                              <Route path="/platform-ui" element={<PlatformUIDemo />} />
                              <Route path="/storage-demo" element={<StorageDemoPage />} />
                              <Route path="/adaptive-forms" element={<AdaptiveFormDemo />} />
                              <Route path="/platform-layout" element={<PlatformLayoutDemo />} />
                              <Route path="/network-adaptation" element={<NetworkAdaptationDemo />} />
                              <Route path="/connection-management" element={<ConnectionManagementDemo />} />
                              
                              {/* All other routes handled by MainLayout */}
                              <Route path="/*" element={<MainLayout />} />
                            </Routes>
                            <Toaster />
                          </BrowserRouter>
                        </BackgroundSyncManager>
                      </RequestQueueProvider>
                    </NetworkProvider>
                  </NetworkStatusProvider>
                </DeliveryMapProvider>
              </MapViewProvider>
            </GoogleMapsProvider>
          </AuthProvider>
        </ThemeProvider>
      </ResponsiveProvider>
    </QueryClientProvider>
  );
}

export default App;
