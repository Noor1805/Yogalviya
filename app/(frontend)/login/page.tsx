'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const isRegistered = searchParams.get('registered') === 'true';
    const isResetSuccess = searchParams.get('reset') === 'success';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('customer-login', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push('/account');
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-neutral-600">
                        Or{' '}
                        <Link href="/register" className="font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-4">
                            create a new account
                        </Link>
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <GoogleAuthButton label="Continue with Google" />

                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-neutral-300">
                        <span className="h-px flex-1 bg-neutral-200" />
                        Or continue with email
                        <span className="h-px flex-1 bg-neutral-200" />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {isRegistered && (
                        <div className="rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-700">Account created successfully. Please sign in.</p>
                        </div>
                    )}

                    {isResetSuccess && (
                        <div className="rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-700">Password reset successful. Please sign in with your new password.</p>
                        </div>
                    )}
                    
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="email" className="sr-only">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full rounded-t-md border-neutral-200 focus:z-10 focus:border-neutral-900 focus:ring-neutral-900 py-3"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="sr-only">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full rounded-b-md border-neutral-200 focus:z-10 focus:border-neutral-900 focus:ring-neutral-900 py-3"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-semibold text-neutral-900 hover:text-neutral-700">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
