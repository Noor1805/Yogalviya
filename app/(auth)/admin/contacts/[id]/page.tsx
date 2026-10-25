'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, Flag, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminNotifications } from '@/components/admin/AdminNotificationsProvider';

interface Contact {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    createdAt: string;
}

export default function ContactDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { refresh } = useAdminNotifications();

    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchContact = async () => {
        try {
            const res = await fetch(`/api/admin/contacts/${id}`);
            const data = await res.json();

            if (res.ok) {
                setContact(data);
                void refresh();
            } else {
                toast.error('Contact not found');
                router.push('/admin/contacts');
            }
        } catch {
            toast.error('Failed to load contact');
            router.push('/admin/contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContact();
    }, [id]);

    const updateStatus = async (status: string) => {
        setUpdating(true);

        try {
            const res = await fetch(`/api/admin/contacts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                setContact((prev) => (prev ? { ...prev, status: status as Contact['status'] } : null));
                toast.success('Status updated');
                void refresh();
            }
        } catch {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            const res = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });

            if (res.ok) {
                toast.success('Contact deleted');
                void refresh();
                router.push('/admin/contacts');
            }
        } catch {
            toast.error('Failed to delete contact');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center p-6">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
            </div>
        );
    }

    if (!contact) return null;

    const statusColors: Record<Contact['status'], string> = {
        new: 'bg-blue-100 text-blue-800',
        read: 'bg-gray-100 text-gray-800',
        replied: 'bg-green-100 text-green-800',
        archived: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <Link
                        href="/admin/contacts"
                        className="shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <div className="min-w-0">
                        <h1 className="break-words text-2xl font-bold text-gray-900">{contact.subject}</h1>
                        <p className="mt-1 break-words text-sm text-gray-500">
                            From {contact.name} <span className="mx-1">|</span> {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[contact.status]}`}>
                        {contact.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Contact Information</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">Email</p>
                            <a
                                href={`mailto:${contact.email}`}
                                className="break-all text-sm font-medium text-black hover:underline"
                            >
                                {contact.email}
                            </a>
                        </div>
                    </div>

                    {contact.phone && (
                        <div className="flex min-w-0 items-start gap-3">
                            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Phone</p>
                                <a
                                    href={`tel:${contact.phone}`}
                                    className="break-all text-sm font-medium text-black hover:underline"
                                >
                                    {contact.phone}
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="flex min-w-0 items-start gap-3">
                        <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">Received</p>
                            <p className="break-words text-sm font-medium text-black">
                                {new Date(contact.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Message</h2>

                <div className="overflow-hidden rounded-md bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700 [overflow-wrap:anywhere]">
                        {contact.message}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => updateStatus('read')}
                    disabled={updating || contact.status === 'read'}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Read
                </button>

                <button
                    onClick={() => updateStatus('replied')}
                    disabled={updating || contact.status === 'replied'}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Flag className="h-4 w-4" />
                    Mark as Replied
                </button>

                <button
                    onClick={() => updateStatus('archived')}
                    disabled={updating || contact.status === 'archived'}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Archive
                </button>

                <button
                    onClick={handleDelete}
                    disabled={updating}
                    className="ml-auto flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </button>
            </div>
        </div>
    );
}

