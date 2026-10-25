'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

function AdminLoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const callbackUrl = searchParams.get('callbackUrl') || '/admin';

            const result = await signIn('admin-login', {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error || !result?.ok) {
                setError('Invalid email or password');
                setLoading(false);
            } else {
                router.replace(result.url || callbackUrl);
                router.refresh();
            }
        } catch {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="w-full max-w-[400px] px-4">
                {/* Logo */}
                <div className="mb-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center bg-neutral-900">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="mt-6 text-[15px] font-semibold uppercase tracking-[0.2em] text-neutral-900">
                        Admin Panel
                    </h1>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-neutral-400">
                        Sign in to continue
                    </p>
                </div>

                {/* Login Card */}
                <div className="rounded-xl border border-neutral-200/60 bg-white p-7">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <Label
                                htmlFor="email"
                                className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300"
                            >
                                Email Address
                            </Label>
                            <div className="relative mt-2">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@store.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 border-neutral-200 text-[13px] focus:border-neutral-900 focus:ring-neutral-900"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300"
                                >
                                    Password
                                </Label>
                                <Link
                                    href="/admin/forgot-password"
                                    className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-700 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative mt-2">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 border-neutral-200 text-[13px] focus:border-neutral-900 focus:ring-neutral-900"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neutral-900 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                    Admin · Protected Area
                </p>
            </div>
        </div>
    );
}

function AdminLoginFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="w-full max-w-[400px] px-4">
                <div className="rounded-xl border border-neutral-200/60 bg-white p-7">
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<AdminLoginFallback />}>
            <AdminLoginPageContent />
        </Suspense>
    );
}
