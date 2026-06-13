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
          background: '#1D1D1D',
          color: '#FFFFFF',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '14px 18px',
          fontSize: '14px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.32)',
        },
        success: {
          iconTheme: {
            primary: '#22C55E',
            secondary: '#1D1D1D',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#1D1D1D',
          },
        },
      }}
    />
  );
}
