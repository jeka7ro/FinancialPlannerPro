import React from 'react';

interface Windows11ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Windows11Button: React.FC<Windows11ButtonProps> = ({ children, style, ...props }) => (
  <button
    {...props}
    style={{
      background: '#E8F4FD',
      border: '1px solid #E1E1E1',
      borderRadius: 8,
      boxShadow:
        '0 4px 16px rgba(0, 95, 184, 0.08), 0 2px 8px rgba(16, 124, 16, 0.06)',
      color: '#1A1A1A',
      padding: '10px 24px',
      fontWeight: 600,
      fontSize: 16,
      cursor: 'pointer',
      transition: 'transform 0.1s, box-shadow 0.1s',
      outline: 'none',
      ...style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 95, 184, 0.12), 0 4px 12px rgba(16, 124, 16, 0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 95, 184, 0.08), 0 2px 8px rgba(16, 124, 16, 0.06)';
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 95, 184, 0.06), 0 1px 4px rgba(16, 124, 16, 0.04)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 95, 184, 0.12), 0 4px 12px rgba(16, 124, 16, 0.08)';
    }}
  >
    {children}
  </button>
);

export default Windows11Button; 