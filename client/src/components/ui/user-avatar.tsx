import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";

interface UserAvatarProps {
  user: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    [key: string]: any;
  } | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const { data: attachments = [] } = useQuery({
    queryKey: [`/api/users/${user?.id}/attachments`],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await apiRequest('GET', `/api/users/${user.id}/attachments`);
      return response.json();
    },
    enabled: !!user?.id,
  });
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  };

  const getInitials = () => {
    if (!user) return "??";
    if (user.firstName && user.lastName && user.firstName.length > 0 && user.lastName.length > 0) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username && user.username.length > 0) {
      return user.username[0].toUpperCase();
    }
    return "??";
  };

  // Update image URL when attachments change
  useEffect(() => {
    if (!user || !attachments.length) {
      setImageUrl(null);
      setHasError(false);
      return;
    }

    const imageAttachment = Array.isArray(attachments) ? attachments.find(att => att.mimeType.startsWith('image/')) : undefined;
    if (imageAttachment) {
      setImageUrl(imageAttachment.url);
      setHasError(false);
    } else {
      setImageUrl(null);
      setHasError(false);
    }
  }, [attachments, user]);

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">??</span>
      </div>
    );
  }

  if (imageUrl && !hasError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 ${className}`}>
        <img 
          src={imageUrl}
          alt={`${user.firstName || user.username} avatar`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${className}`}
    >
      {getInitials()}
    </div>
  );
}

interface UserAvatarWithInfoProps {
  user: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    email?: string | null;
    telephone?: string | null;
    [key: string]: any;
  } | null;
  showEmail?: boolean;
  showTelephone?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatarWithInfo({ 
  user, 
  showEmail = false, 
  showTelephone = false, 
  size = "md", 
  className = "" 
}: UserAvatarWithInfoProps) {
  if (!user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <UserAvatar user={null} size={size} />
        <div>
          <p className="text-sm text-gray-500">No user data</p>
        </div>
      </div>
    );
  }

  const getDisplayName = (user: { firstName?: string | null; lastName?: string | null; username: string }) => {
    if (user.firstName && user.lastName && user.firstName.length > 0 && user.lastName.length > 0) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.username && user.username.length > 0) {
      return user.username;
    }
    return "Unknown User";
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <UserAvatar user={user} size={size} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getDisplayName(user)}
        </p>
        {showEmail && user.email && (
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        )}
        {showTelephone && user.telephone && (
          <p className="text-sm text-gray-500 truncate">{user.telephone}</p>
        )}
      </div>
    </div>
  );
}