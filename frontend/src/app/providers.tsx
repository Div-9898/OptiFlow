'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(26, 26, 37, 0.95)',
            color: '#fff',
            border: '1px solid rgba(0, 245, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#39ff14',
              secondary: '#1a1a25',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff6b35',
              secondary: '#1a1a25',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
