'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PersonalInfoPage() {
    const { data: session, update } = useSession();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/customer/profile');
                const data = await res.json();
                if (data.success) {
                    setName(data.data.name || '');
                    setPhone(data.data.phone || '');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        const payload: any = { name, phone };
        if (newPassword) {
            if (!currentPassword) {
                setError('Current password is required to set a new password.');
                setSaving(false);
                return;
            }
            payload.currentPassword = currentPassword;
            payload.newPassword = newPassword;
        }

        try {
            const res = await fetch('/api/customer/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Profile updated successfully.');
                update({ name }); // refresh next-auth session data
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setError(data.error || 'Failed to update profile.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex py-20 justify-center"><Loader2 className="h-8 w-8 animate-spin text-neutral-300" /></div>;
    }

    return (
        <div className="animate-fade-in-up max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Login & Security</h1>
            <p className="mt-1 text-sm text-neutral-500">
                Update your personal details and secure your account.
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-8">
                {message && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                        <CheckCircle2 className="h-5 w-5" />
                        {message}
                    </div>
                )}
                {error && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <div className="space-y-4 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4" /> Personal Details
                    </h3>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            disabled 
                            value={session?.user?.email || ''} 
                            className="bg-neutral-100 text-neutral-500" 
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">Email cannot be changed.</p>
                    </div>
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                            className="focus-visible:ring-neutral-900" 
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                            id="phone" 
                            type="tel" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            className="focus-visible:ring-neutral-900" 
                        />
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-2">
                        Change Password
                    </h3>
                    <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                            id="currentPassword" 
                            type="password" 
                            value={currentPassword} 
                            onChange={e => setCurrentPassword(e.target.value)} 
                            className="focus-visible:ring-neutral-900" 
                        />
                    </div>
                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                            id="newPassword" 
                            type="password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            className="focus-visible:ring-neutral-900" 
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">Leave blank to keep your current password.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
