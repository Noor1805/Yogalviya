'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: token || '',
        },
    });

    const onSubmit = async (data: ResetPasswordData) => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/customer/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to reset password');
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login?reset=success');
            }, 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center">
                <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-600" />
                <h2 className="text-lg font-semibold text-red-700">Invalid reset link</h2>
                <p className="mt-2 text-sm text-red-600">
                    This reset link is missing or invalid. Please request a new one.
                </p>
                <Button
                    onClick={() => router.push('/forgot-password')}
                    className="mt-6 rounded-full bg-red-600 px-6 text-white hover:bg-red-700"
                >
                    Request new link
                </Button>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Password updated</h2>
                <p className="mt-2 text-sm text-neutral-500">
                    Your password has been changed successfully. Redirecting you to sign in...
                </p>
                <Button
                    variant="link"
                    onClick={() => router.push('/login')}
                    className="mt-4 text-neutral-700"
                >
                    Go to login now
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('token')} />

            {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    New password
                </Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        {...register('password')}
                        className="rounded-2xl border-neutral-200 py-6 pr-11"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    Confirm password
                </Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Type it again"
                        {...register('confirmPassword')}
                        className="rounded-2xl border-neutral-200 py-6 pr-11"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
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
                        Updating password
                    </>
                ) : (
                    'Reset password'
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                            <Lock className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-900">
                            Set a new password
                        </h1>
                        <p className="mt-2 text-sm text-neutral-500">
                            Choose a strong password you haven&apos;t used before.
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                            </div>
                        }
                    >
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
