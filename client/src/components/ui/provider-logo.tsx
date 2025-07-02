import { useState, useEffect } from "react";
import { mockAttachments } from "@/lib/mockAttachments";

interface ProviderLogoProps {
  providerId: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  providerName?: string;
}

interface ProviderAttachment {
  id: number;
  filename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  url: string;
}

interface ProvidersMock {
  [key: number]: ProviderAttachment[];
}

export function ProviderLogo({ providerId, size = "md", className = "", providerName }: ProviderLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Load logo from localStorage on component mount
  useEffect(() => {
    const providers: ProvidersMock = mockAttachments.providers as ProvidersMock;
    const providerLogos = providers[providerId];
    if (providerLogos && providerLogos.length > 0) {
      setLogoUrl(providerLogos[0].url);
      return;
    }
    // Dacă nu există în mock, încearcă localStorage fallback
    const savedLogo = localStorage.getItem(`provider_logo_${providerId}`);
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, [providerId]);

  // Listen for logo updates from AttachmentButton
  useEffect(() => {
    const handleLogoUpdate = (event: CustomEvent) => {
      if (event.detail.providerId === providerId) {
        setLogoUrl(event.detail.logoUrl);
        setLogoError(false);
      }
    };

    window.addEventListener('providerLogoUpdate', handleLogoUpdate as EventListener);
    return () => {
      window.removeEventListener('providerLogoUpdate', handleLogoUpdate as EventListener);
    };
  }, [providerId]);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  // Get provider initials from name
  const getInitials = (name?: string) => {
    if (!name) return "P";
    return name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
  };

  if (logoUrl && !logoError) {
    return (
      <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-white/5 flex items-center justify-center ${className}`}>
        <img 
          src={logoUrl} 
          alt="Provider Logo"
          className="w-full h-full object-contain"
          onError={() => setLogoError(true)}
        />
      </div>
    );
  }

  // Fallback to provider initials
  return (
    <div className={`${sizeClasses[size]} rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}>
      <span className={`font-semibold text-white ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-base'}`}>
        {getInitials(providerName)}
      </span>
    </div>
  );
}