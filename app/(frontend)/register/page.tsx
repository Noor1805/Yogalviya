'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/customer/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
            } else {
                router.push('/login?registered=true');
            }
        } catch (err) {
            setError('Something went wrong.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900">
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-neutral-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-4">
                            Sign in here
                        </Link>
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <GoogleAuthButton label="Sign up with Google" />

                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-neutral-300">
                        <span className="h-px flex-1 bg-neutral-200" />
                        Or create with email
                        <span className="h-px flex-1 bg-neutral-200" />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="name" className="sr-only">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="relative block w-full rounded-t-md border-neutral-200 focus:z-10 focus:border-neutral-900 focus:ring-neutral-900 py-3"
                                placeholder="Full Name"
                            />
                        </div>
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
                                className="relative block w-full border-neutral-200 focus:z-10 focus:border-neutral-900 focus:ring-neutral-900 py-3"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="sr-only">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full rounded-b-md border-neutral-200 focus:z-10 focus:border-neutral-900 focus:ring-neutral-900 py-3"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
