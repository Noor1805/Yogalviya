'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

export default function GoogleAuthButton({
    label,
    callbackUrl = '/account',
}: {
    label: string;
    callbackUrl?: string;
}) {
    const [loading, setLoading] = React.useState(false);

    if (!googleEnabled) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={() => {
                setLoading(true);
                void signIn('google', { callbackUrl });
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                        d="M21.35 11.1H12v2.98h5.37c-.23 1.5-1.13 2.78-2.4 3.64v2.99h3.88c2.27-2.09 3.58-5.16 3.58-8.81 0-.6-.05-1.2-.18-1.8Z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.88-2.99c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.92H.01v3.09A10 10 0 0 0 12 22Z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.31 13.82A6.05 6.05 0 0 1 4.94 12c0-.63.11-1.25.31-1.82V7.09H1.01A9.98 9.98 0 0 0 0 12c0 1.61.39 3.13 1.01 4.91l4.3-3.09Z"
                        fill="#FBBC04"
                    />
                    <path
                        d="M12 4.25c1.47 0 2.79.51 3.84 1.52l2.87-2.87C16.97 1.3 14.7.25 12 .25A10 10 0 0 0 1.01 7.09l4.24 3.09C6.2 6.35 8.86 4.25 12 4.25Z"
                        fill="#EA4335"
                    />
                </svg>
            )}
            {label}
        </button>
    );
}
