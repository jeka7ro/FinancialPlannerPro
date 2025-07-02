import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Mock logo data for providers - using better placeholder images
const mockProviderLogos: Record<number, string> = {
  1: "https://via.placeholder.com/100x100/2563eb/ffffff?text=Novomatic",
  2: "https://via.placeholder.com/100x100/7c3aed/ffffff?text=IGT",
  3: "https://via.placeholder.com/100x100/dc2626/ffffff?text=Aristocrat",
  4: "https://via.placeholder.com/100x100/059669/ffffff?text=NetEnt",
  5: "https://via.placeholder.com/100x100/ea580c/ffffff?text=Playtech",
  6: "https://via.placeholder.com/100x100/be185d/ffffff?text=Microgaming",
  7: "https://via.placeholder.com/100x100/0891b2/ffffff?text=Evolution",
  8: "https://via.placeholder.com/100x100/7c2d12/ffffff?text=Pragmatic"
};

interface ProviderLogoProps {
  providerId: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  providerName?: string;
}

export function ProviderLogo({ providerId, size = "md", className = "", providerName }: ProviderLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Use mock data instead of real API call
  const { data: attachments } = useQuery({
    queryKey: [`/api/provider/${providerId}/attachments`],
    queryFn: async () => {
      // Return mock attachments with logo data
      const mockAttachments = [
        {
          id: providerId,
          filename: `${providerName || 'provider'}_logo.png`,
          mimeType: "image/png",
          fileSize: 245760,
          createdAt: new Date().toISOString(),
          url: mockProviderLogos[providerId] || null
        }
      ];
      return mockAttachments;
    },
    enabled: !!providerId,
  });

  useEffect(() => {
    if (attachments && attachments.length > 0) {
      // Find the first logo/image attachment
      const logoAttachment = attachments.find((att: any) => 
        att.filename && (
          att.filename.toLowerCase().includes('logo') ||
          att.filename.toLowerCase().endsWith('.png') ||
          att.filename.toLowerCase().endsWith('.jpg') ||
          att.filename.toLowerCase().endsWith('.jpeg') ||
          att.filename.toLowerCase().endsWith('.svg')
        )
      );
      
      if (logoAttachment && logoAttachment.url) {
        setLogoUrl(logoAttachment.url);
      }
    }
  }, [attachments]);

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

  if (logoUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-white/5 flex items-center justify-center ${className}`}>
        <img 
          src={logoUrl} 
          alt="Provider Logo"
          className="w-full h-full object-contain"
          onError={() => setLogoUrl(null)}
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