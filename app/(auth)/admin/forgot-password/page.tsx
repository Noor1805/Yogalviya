'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordData) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to process request');
            }

            setIsSubmitted(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-cream-50">
            <div className="w-full max-w-md px-4">
                <Link
                    href="/admin/login"
                    className="mb-8 flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                </Link>

                <div className="mb-8 text-center px-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 shadow-lg">
                        <Mail className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mt-5 text-2xl font-bold text-neutral-900">Recovery</h1>
                    <p className="mt-1 text-sm text-neutral-500">We will send a secure reset link to your email</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/30">
                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Check Your Inbox</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                If an account exists with that email, we've sent instructions to reset your password.
                            </p>
                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="mt-6 w-full rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                            >
                                Didn't receive it? Try again
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Admin Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        {...register('email')}
                                        className={`pl-10 rounded-xl ${errors.email ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-neutral-400 focus:ring-neutral-100'}`}
                                        autoFocus
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-neutral-800 py-6 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-neutral-900 rounded-xl shadow-sm transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-xs text-neutral-400">
                    Industrial standard encryption · Secured by NextAuth
                </p>
            </div>
        </div>
    );
}

