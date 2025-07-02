import { useState, useEffect } from "react";
import { attachmentManager } from "@/lib/mockAttachments";

interface ProviderLogoProps {
  providerId: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  providerName?: string;
}

export function ProviderLogo({ providerId, size = "md", className = "", providerName }: ProviderLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

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

  // Load logo and subscribe to updates
  useEffect(() => {
    const loadLogo = () => {
      const imageAttachment = attachmentManager.getFirstImage('providers', providerId);
      if (imageAttachment) {
        setLogoUrl(imageAttachment.url);
        setLogoError(false);
      } else {
        setLogoUrl(null);
        setLogoError(true);
      }
    };

    // Load initial logo
    loadLogo();

    // Subscribe to updates
    const unsubscribe = attachmentManager.subscribe('providers', providerId, loadLogo);

    // Cleanup subscription
    return unsubscribe;
  }, [providerId]);

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