'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
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
            const res = await fetch('/api/admin/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to reset password');
            }

            setIsSuccess(true);
            toast.success('Your password has been reset successfully!');
            setTimeout(() => {
                router.push('/admin/login');
            }, 3000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center rounded-2xl border border-red-200 bg-red-50 p-10">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-red-700">Invalid Link</h2>
                <p className="mt-2 text-sm text-red-600">
                    The reset link is missing or invalid. Please request a new one.
                </p>
                <Button
                    onClick={() => router.push('/admin/forgot-password')}
                    className="mt-6 bg-red-600 text-white hover:bg-red-700 rounded-xl"
                >
                    Request New Link
                </Button>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 mb-6 shadow-sm border border-green-100">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Successfully Reset</h2>
                <p className="mt-2 text-gray-600">
                    Redirecting you to the login screen in 3 seconds...
                </p>
                <Button
                    variant="link"
                    onClick={() => router.push('/admin/login')}
                    className="mt-6 text-neutral-600 font-bold uppercase tracking-widest text-[10px]"
                >
                    Go to Login Now
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('token')} />
            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPass ? 'text' : 'password'}
                            {...register('password')}
                            className={`rounded-xl pr-10 border-gray-200 focus:border-neutral-400 focus:ring-neutral-100 ${errors.password ? 'border-red-300 ring-red-100' : ''}`}
                            placeholder="At least 8 chars"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            {...register('confirmPassword')}
                            className={`rounded-xl pr-10 border-gray-200 focus:border-neutral-400 focus:ring-neutral-100 ${errors.confirmPassword ? 'border-red-300 ring-red-100' : ''}`}
                            placeholder="Confirm it"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-800 py-6 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-neutral-900 rounded-xl shadow-sm transition-all"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Security...
                    </>
                ) : (
                    'Reset Password'
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-cream-50">
            <div className="w-full max-w-md px-4">
                <div className="mb-8 text-center px-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 shadow-lg">
                        <Lock className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mt-5 text-2xl font-bold text-neutral-900">Set New Password</h1>
                    <p className="mt-1 text-sm text-neutral-500">Pick a strong password you haven't used before</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/30">
                    <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-neutral-500" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>

                <p className="mt-8 text-center text-xs text-neutral-400">
                    Industrial standard encryption · Secured by NextAuth
                </p>
            </div>
        </div>
    );
}

