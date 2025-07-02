import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

const pageConfig = {
  "/": { title: "Dashboard", subtitle: "Gaming Operations Overview" },
  "/companies": { title: "Companies", subtitle: "Manage gaming companies and organizations" },
  "/locations": { title: "Locations", subtitle: "Gaming venues and facilities" },
  "/providers": { title: "Providers", subtitle: "Equipment and service providers" },
  "/cabinets": { title: "Cabinets", subtitle: "Gaming cabinet inventory and management" },
  "/game-mixes": { title: "Game Mixes", subtitle: "Game configurations and arrangements" },
  "/slots": { title: "Slots", subtitle: "Slot machine management and tracking" },
  "/invoices": { title: "Invoices", subtitle: "Financial invoicing and billing" },
  "/rent-management": { title: "Rent Management", subtitle: "Rental agreements and payments" },
  "/users": { title: "Users", subtitle: "User accounts and access management" },
  "/legal": { title: "Legal", subtitle: "Legal compliance and documentation" },
  "/onjn": { title: "ONJN", subtitle: "Romanian gambling authority compliance" },
  "/settings": { title: "Settings", subtitle: "System configuration and preferences" },
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  const currentPage = pageConfig[location as keyof typeof pageConfig] || { 
    title: "Page Not Found", 
    subtitle: "The requested page could not be found" 
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      <Sidebar className={sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
      
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <Header 
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onMenuToggle={toggleSidebar}
        />
        
        <main className="flex-1 p-4 md:p-8 bg-background w-full max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
