'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/emails');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
            }
        } catch { } // fail silently for now
        setLoading(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div className="pb-24">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                    <Mail className="h-6 w-6 text-indigo-600" /> System Emails
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Manage the automated transactional emails sent to your customers.
                </p>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : (
                <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                    Trigger Event
                                </th>
                                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                    Subject Line
                                </th>
                                <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                    Status
                                </th>
                                <th className="px-5 py-4 w-20"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(tmpl => (
                                <tr key={tmpl._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-neutral-900 capitalize flex items-center gap-2">
                                            {tmpl.name}
                                        </p>
                                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{tmpl.type}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-neutral-600 border-l border-neutral-50">
                                        <div className="flex items-center gap-2 max-w-[400px]">
                                            <span className="truncate">{tmpl.subject}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 border-l border-neutral-50">
                                        {tmpl.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-green-700 uppercase">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-neutral-500 uppercase">
                                                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" /> Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50">
                                            <Link href={`/admin/emails/${tmpl._id}`}>
                                                <Edit3 className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
