'use client';

import { Toaster } from 'react-hot-toast';

export function ToastViewport() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0D1117',
          color: '#F8FAFC',
          border: '1px solid rgba(42, 48, 58, 0.6)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
        },
        success: {
          iconTheme: {
            primary: '#22C55E',
            secondary: '#0D1117',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#0D1117',
          },
        },
      }}
    />
  );
}
