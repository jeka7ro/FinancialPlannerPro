import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockAttachments } from "../../lib/mockAttachments";

interface ProviderLogoProps {
  providerId: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  providerName?: string;
}

export function ProviderLogo({ providerId, size = "md", className = "", providerName }: ProviderLogoProps) {
  const [logoError, setLogoError] = useState(false);
  
  // Get attachments for this provider - use the same data source as AttachmentButton
  const { data: attachments } = useQuery({
    queryKey: [`/api/provider/${providerId}/attachments`],
    queryFn: async () => {
      // Return mock attachments for this provider
      return mockAttachments.providers[providerId as keyof typeof mockAttachments.providers] || [];
    },
    enabled: !!providerId,
    // Refresh more frequently to catch new uploads
    refetchInterval: 2000,
  });

  // Find logo attachment (first image file or file with 'logo' in name)
  const logoAttachment = attachments?.find((att: any) => 
    att.filename && (
      att.filename.toLowerCase().includes('logo') ||
      att.mimeType?.startsWith('image/')
    )
  );

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

  if (logoAttachment && !logoError) {
    return (
      <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-white/5 flex items-center justify-center ${className}`}>
        <img 
          src={logoAttachment.url} 
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