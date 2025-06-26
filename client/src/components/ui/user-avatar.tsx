import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get user photo from attachments
  const { data: attachments } = useQuery({
    queryKey: [`/api/users/${user?.id}/attachments`],
    enabled: !!user?.id,
    refetchOnMount: true,
    staleTime: 0,
  });

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-14 h-14 text-base",
    lg: "w-16 h-16 text-lg"
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}>
        <span className="text-gray-400">👤</span>
      </div>
    );
  }

  // Find the first image attachment as user photo
  const photoAttachment = Array.isArray(attachments) ? attachments.find((att: any) => {
    const fileName = att.filename; // Use 'filename' property from server response
    return fileName && fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);
  }) : null;

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
      {photoAttachment && !imageError ? (
        <img 
          src={`/api/attachments/${photoAttachment.id}/download`}
          alt={`${getDisplayName(user)} avatar`}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-blue-500/20 rounded-full flex items-center justify-center">
          <span className="text-blue-400 font-medium">
            {getInitials(user)}
          </span>
        </div>
      )}
    </div>
  );
}

interface UserAvatarWithInfoProps {
  user: User | null;
  showEmail?: boolean;
  showTelephone?: boolean;
  className?: string;
}

export function UserAvatarWithInfo({ 
  user, 
  showEmail = false, 
  showTelephone = false, 
  className = "" 
}: UserAvatarWithInfoProps) {
  if (!user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <UserAvatar user={null} />
        <div>
          <p className="text-sm font-medium text-white">Guest User</p>
          <p className="text-xs text-slate-400">Not logged in</p>
        </div>
      </div>
    );
  }

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <UserAvatar user={user} />
      <div>
        <p className="text-sm font-medium text-white">
          {getDisplayName(user)}
        </p>
        <p className="text-xs text-slate-400">@{user.username}</p>
        {showEmail && user.email && (
          <p className="text-xs text-slate-400">{user.email}</p>
        )}
        {showTelephone && user.telephone && (
          <p className="text-xs text-slate-400">{user.telephone}</p>
        )}
      </div>
    </div>
  );
}