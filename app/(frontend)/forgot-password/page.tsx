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
            const res = await fetch('/api/customer/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to process request');
            }

            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <Link
                    href="/login"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                </Link>

                <div className="rounded-[28px] border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/40">
                    <div className="mb-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900">
                            <Mail className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-900">
                            Forgot your password?
                        </h1>
                        <p className="mt-2 text-sm text-neutral-500">
                            Enter your email and we&apos;ll send you a secure reset link.
                        </p>
                    </div>

                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-900">Check your inbox</h2>
                            <p className="mt-2 text-sm text-neutral-500">
                                If an account exists for that email, we&apos;ve sent password reset instructions.
                            </p>
                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="mt-6 w-full rounded-full border-neutral-200"
                            >
                                Send another link
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    {...register('email')}
                                    className="rounded-2xl border-neutral-200 py-6"
                                />
                                {errors.email && (
                                    <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-full bg-neutral-900 py-6 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-neutral-800"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending link
                                    </>
                                ) : (
                                    'Send reset link'
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
