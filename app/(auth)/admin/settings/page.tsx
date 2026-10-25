'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePasswordSchema } from '@/lib/validations/auth';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (data: ChangePasswordData) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to change password');
            }

            toast.success('Your password has been updated securely');
            reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Account Settings</h1>
                <p className="text-gray-500">Manage your administrative security and preferences.</p>
            </div>

            <Card className="border-neutral-200 shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white shadow-sm">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Change Password</CardTitle>
                            <CardDescription>Update your login credentials regularly for better security.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showCurrent ? 'text' : 'password'}
                                    {...register('currentPassword')}
                                    className={`rounded-xl pr-10 ${errors.currentPassword ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-neutral-400 focus:ring-neutral-100'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-xs font-medium text-red-500">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNew ? 'text' : 'password'}
                                        {...register('newPassword')}
                                        className={`rounded-xl pr-10 ${errors.newPassword ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-neutral-400 focus:ring-neutral-100'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="text-xs font-medium text-red-500">{errors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        {...register('confirmPassword')}
                                        className={`rounded-xl pr-10 ${errors.confirmPassword ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-neutral-400 focus:ring-neutral-100'}`}
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
                            className="w-full h-11 bg-neutral-800 text-white hover:bg-neutral-900 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Security...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-gray-100 bg-gray-50/50">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-900">Industrial Security Standards</h4>
                            <p className="max-w-md text-sm text-gray-500">
                                Your login status is valid for 24 hours. After a password change, we recommend signing out and back in to refresh your secure session token.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

