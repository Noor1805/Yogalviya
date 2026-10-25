'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

export default function AdminError({
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
    <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center animate-fade-in-up">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100">
        <ShieldAlert className="h-8 w-8 text-neutral-900" />
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
        Dashboard Component Failed
      </h2>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm">
        An error occurred in this section of the admin panel. The system has automatically logged the stack trace.
      </p>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <RefreshCcw className="h-4 w-4" /> Reload Component
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 shadow-sm transition-colors"
        >
          Return to Overview
        </Link>
      </div>
    </div>
  );
}
