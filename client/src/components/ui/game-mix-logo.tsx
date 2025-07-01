import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface GameMixLogoProps {
  gameMixId: number | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-6",
  md: "w-12 h-8", 
  lg: "w-16 h-10",
  xl: "w-20 h-12"
};

const iconSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl"
};

export function GameMixLogo({ gameMixId, size = "md", className }: GameMixLogoProps) {
  const { data: attachments } = useQuery({
    queryKey: [`/api/game-mixes/${gameMixId}/attachments`],
    queryFn: async () => {
      if (!gameMixId) return [];
      const response = await fetch(`/api/game-mixes/${gameMixId}/attachments`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!gameMixId,
  });

  // Find the first image attachment to use as logo
  const logoAttachment = attachments?.find((att: any) => 
    att.mimeType?.startsWith('image/')
  );

  return (
    <div className={cn(
      "rounded-lg flex items-center justify-center bg-orange-500/20",
      sizeClasses[size],
      className
    )}>
      {logoAttachment ? (
        <img 
          src={`/api/attachments/${logoAttachment.id}/download?t=${Date.now()}`}
          alt="Game Mix Logo"
          className={cn("object-cover rounded-lg", sizeClasses[size])}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <span className={cn(
        "text-orange-400",
        iconSizes[size],
        logoAttachment ? "hidden" : ""
      )}>
        🎯
      </span>
    </div>
  );
} 