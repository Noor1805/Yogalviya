'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 font-sans antialiased text-neutral-900">
          <div className="max-w-md text-center">
            <h1 className="text-[120px] font-bold leading-none tracking-tighter text-neutral-100">500</h1>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">System Interruption</h2>
            <p className="mt-2 text-sm text-neutral-500">
              A critical failure has been logged and our engineers have been notified. Please try refreshing.
            </p>
            <button
              onClick={() => reset()}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" /> Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
