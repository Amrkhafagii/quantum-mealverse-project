
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Auth from "@/pages/Auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { DeliveryMapProvider } from "@/contexts/DeliveryMapContext";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import MainLayout from "@/components/layout/MainLayout";
import PlatformUIDemo from "@/pages/PlatformUIDemo";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ResponsiveProvider>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <GoogleMapsProvider>
              <DeliveryMapProvider>
                <NetworkStatusProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/platform-ui" element={<PlatformUIDemo />} />
                      <Route path="*" element={<MainLayout />} />
                    </Routes>
                    <Toaster />
                  </BrowserRouter>
                </NetworkStatusProvider>
              </DeliveryMapProvider>
            </GoogleMapsProvider>
          </AuthProvider>
        </ThemeProvider>
      </ResponsiveProvider>
    </QueryClientProvider>
  );
}

export default App;
