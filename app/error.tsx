'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function StorefrontError({
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="w-full max-w-md animate-fade-in-up space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            We've logged the error and are looking into it.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20"
          >
            <RefreshCcw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
