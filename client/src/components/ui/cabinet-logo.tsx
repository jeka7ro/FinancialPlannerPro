import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';

interface CabinetLogoProps {
  cabinetId: number;
  model?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface Attachment {
  id: number;
  filename: string;
}

export function CabinetLogo({ cabinetId, model = 'Unknown', size = 'md' }: CabinetLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const { data: attachments } = useQuery<Attachment[]>({
    queryKey: ['cabinets', cabinetId, 'attachments'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/cabinets/${cabinetId}/attachments`);
      return response.json();
    },
  });

  useEffect(() => {
    if (attachments && attachments.length > 0) {
      // Look for logo files
      const logoFile = Array.isArray(attachments) ? attachments.find(attachment => 
        attachment.filename.toLowerCase().includes('logo') ||
        /\.(png|jpg|jpeg|svg|gif)$/i.test(attachment.filename)
      ) : undefined;
      
      if (logoFile) {
        setLogoUrl(`/api/attachments/${logoFile.id}/download`);
      } else {
        setLogoUrl(null);
      }
    } else {
      setLogoUrl(null);
    }
  }, [attachments]);

  const sizeClasses = {
    sm: 'w-11 h-11',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  // Fallback to playing card symbols with gradient background
  const cards = ['♠️', '♥️', '♦️', '♣️'];
  const card = cards[cabinetId % 4];
  
  // Display logo if available, otherwise fallback to classic ace of hearts design
  if (logoUrl) {
    return (
      <>
        <div 
          className={`${sizeClasses[size]} rounded-md overflow-hidden bg-white/80 border border-white/20 flex items-center justify-center transition-all duration-500 ease-in-out hover:scale-150 hover:shadow-2xl hover:brightness-110 cursor-pointer`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: 'scale(1)',
            transition: 'transform 0.3s ease-in-out'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(2.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img 
            src={logoUrl} 
            alt={`${model} logo`}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {showPopup && (
          <div 
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`
            }}
          >
            <div className="bg-black/80 rounded-lg p-4 shadow-2xl" style={{ backdropFilter: 'blur(4px)' }}>
              <div className="w-80 h-80 bg-white rounded-lg overflow-hidden">
                <img 
                  src={logoUrl} 
                  alt={`${model} logo (enlarged)`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white text-center mt-2 font-medium">
                {model}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback to classic ace of hearts design
  return (
    <>
      <div 
        className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-white border-2 border-gray-300 flex flex-col items-center justify-center transition-all duration-500 ease-in-out hover:scale-150 hover:shadow-2xl hover:brightness-110 cursor-pointer relative shadow-md`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: 'scale(1)',
          transition: 'transform 0.3s ease-in-out',
          aspectRatio: '2.5/3.5' // Classic playing card proportions
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(2.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Top-left A */}
        <div className="absolute top-1 left-1 text-red-600 font-bold text-sm leading-none">
          A
        </div>
        
        {/* Central heart symbol */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600 text-3xl">♥</div>
        </div>
        
        {/* Bottom-right A (rotated) */}
        <div className="absolute bottom-1 right-1 text-red-600 font-bold text-sm leading-none transform rotate-180">
          A
        </div>
      </div>

      {showPopup && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`
          }}
        >
          <div className="bg-black/80 rounded-lg p-4 shadow-2xl" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="w-80 h-96 bg-white rounded-lg overflow-hidden flex flex-col items-center justify-center relative shadow-lg">
              {/* Top-left A - enlarged */}
              <div className="absolute top-4 left-4 text-red-600 font-bold text-2xl leading-none">
                A
              </div>
              
              {/* Central heart symbol - enlarged */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-red-600 text-8xl">♥</div>
              </div>
              
              {/* Bottom-right A (rotated) - enlarged */}
              <div className="absolute bottom-4 right-4 text-red-600 font-bold text-2xl leading-none transform rotate-180">
                A
              </div>
            </div>
            <div className="text-white text-center mt-2 font-medium">
              {model}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 