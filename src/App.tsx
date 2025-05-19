
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Auth from "@/pages/Auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { DeliveryMapProvider } from "@/contexts/DeliveryMapContext";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import { BackgroundSyncManager } from "@/components/sync/BackgroundSyncManager";
import { MapViewProvider } from "@/contexts/MapViewContext";
import MainLayout from "@/components/layout/MainLayout";
import PlatformUIDemo from "@/pages/PlatformUIDemo";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StorageDemoPage from './pages/StorageDemo';
import AdaptiveFormDemo from './pages/AdaptiveFormDemo';
import PlatformLayoutDemo from './pages/PlatformLayoutDemo';
import { PageTransition } from "./components/layout/PageTransition";
import { AnimatePresence } from "framer-motion";

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
                    <BackgroundSyncManager>
                      <BrowserRouter>
                        <AnimatePresence mode="wait">
                          <Routes>
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/platform-ui" element={<PlatformUIDemo />} />
                            <Route path="/storage-demo" element={<StorageDemoPage />} />
                            <Route path="/adaptive-forms" element={<AdaptiveFormDemo />} />
                            <Route path="/platform-layout" element={<PlatformLayoutDemo />} />
                            <Route path="*" element={<MainLayout />} />
                          </Routes>
                        </AnimatePresence>
                        <Toaster />
                      </BrowserRouter>
                    </BackgroundSyncManager>
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
