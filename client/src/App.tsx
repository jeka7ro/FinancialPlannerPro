import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Locations from "./pages/Locations";
import Companies from "./pages/Companies";
import Users from "./pages/Users";
import Providers from "./pages/Providers";
import GameMixes from "./pages/GameMixes";
import Cabinets from "./pages/Cabinets";
import Slots from "./pages/Slots";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import Legal from "./pages/Legal";
import LegalEnhanced from "./pages/LegalEnhanced";
import ONJN from "./pages/ONJN";
import ONJNClean from "./pages/ONJNClean";
import ONJNEnhanced from "./pages/ONJNEnhanced";
import ONJNFixed from "./pages/ONJNFixed";
import ONJNWorking from "./pages/ONJNWorking";
import RentManagement from "./pages/RentManagement";
import IconDemo from "./pages/IconDemo";
import NotFound from "./pages/not-found";
import { queryClient } from "./lib/queryClient";
import { mockAttachments } from "./lib/mockAttachments";
import "./App.css";

// Initialize provider logos in localStorage from mock data
const initializeProviderLogos = () => {
  const providerAttachments = mockAttachments.providers;
  Object.entries(providerAttachments).forEach(([providerId, attachments]) => {
    const logoAttachment = attachments.find((att: any) => 
      att.filename && (
        att.filename.toLowerCase().includes('logo') ||
        att.mimeType?.startsWith('image/')
      )
    );
    if (logoAttachment) {
      localStorage.setItem(`provider_logo_${providerId}`, logoAttachment.url);
    }
  });
};

// Initialize logos on app start
initializeProviderLogos();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Routes>
            <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
              <Route index element={<Dashboard />} />
              <Route path="locations" element={<Locations />} />
              <Route path="companies" element={<Companies />} />
              <Route path="users" element={<Users />} />
              <Route path="providers" element={<Providers />} />
              <Route path="game-mixes" element={<GameMixes />} />
              <Route path="cabinets" element={<Cabinets />} />
              <Route path="slots" element={<Slots />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="settings" element={<Settings />} />
              <Route path="legal" element={<Legal />} />
              <Route path="legal-enhanced" element={<LegalEnhanced />} />
              <Route path="onjn" element={<ONJN />} />
              <Route path="onjn-clean" element={<ONJNClean />} />
              <Route path="onjn-enhanced" element={<ONJNEnhanced />} />
              <Route path="onjn-fixed" element={<ONJNFixed />} />
              <Route path="onjn-working" element={<ONJNWorking />} />
              <Route path="rent-management" element={<RentManagement />} />
              <Route path="icon-demo" element={<IconDemo />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
