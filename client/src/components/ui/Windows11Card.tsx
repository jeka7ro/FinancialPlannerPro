import React from 'react';

interface Windows11CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Windows11Card: React.FC<Windows11CardProps> = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background: '#E8F4FD',
      border: '1px solid #E1E1E1',
      borderRadius: 16,
      boxShadow:
        '0 8px 32px rgba(0, 95, 184, 0.08), 0 4px 16px rgba(16, 124, 16, 0.06), 0 2px 8px rgba(255, 185, 0, 0.04)',
      padding: 24,
      color: '#1A1A1A',
      ...style,
    }}
  >
    {children}
  </div>
);

export default Windows11Card; 