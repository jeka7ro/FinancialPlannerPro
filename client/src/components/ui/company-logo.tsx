import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface CompanyLogoProps {
  companyId?: number;
  companyName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-2xl",
};

export function CompanyLogo({ companyId, companyName, size = "md", className = "" }: CompanyLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const getInitials = () => {
    if (!companyName) return "??";
    const parts = companyName.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  useEffect(() => {
    if (!companyId) return;
    const loadLogo = async () => {
      try {
        const response = await apiRequest('GET', `/api/companies/${companyId}/attachments`);
        const attachments = await response.json();
        const imageAttachment = attachments.find((att: any) => att.mimeType && att.mimeType.startsWith('image/'));
        if (imageAttachment) {
          setLogoUrl(`/api/attachments/${imageAttachment.id}/download`);
          return;
        }
        setHasError(true);
      } catch {
        setHasError(true);
      }
    };
    loadLogo();
  }, [companyId]);

  if (logoUrl && !hasError) {
    return (
      <div className={`rounded-full overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <img
          src={logoUrl}
          alt={companyName || "Company Logo"}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${sizeClasses[size]} ${className}`}>
      {getInitials()}
    </div>
  );
} 