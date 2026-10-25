'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Trash2, Loader2, ChevronDown } from 'lucide-react';

interface Lead {
    _id: string;
    name: string;
    email: string;
    company: string;
    country: string;
    phone: string;
    quantity: number;
    product: string;
    message: string;
    type: 'enquiry' | 'contact' | 'callback';
    brandingType?: string;
    targetCountry?: string;
    createdAt: string;
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const deleteLead = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead? This cannot be undone.')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLeads((prev) => prev.filter((lead) => lead._id !== id));
                setTotal((prev) => prev - 1);
            } else {
                alert('Failed to delete lead');
            }
        } catch (error) {
            console.error('Failed to delete lead:', error);
            alert('An error occurred while deleting the lead.');
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetch('/api/admin/leads')
            .then((res) => res.json())
            .then((data) => {
                setLeads(data.leads || []);
                setTotal(data.total || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-2xl font-serif text-black italic">Leads & Enquiries</h1>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{total} Archive Records</p>
            </div>

            {leads.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-none border border-neutral-100 bg-neutral-50">
                    <MessageSquare className="mb-3 h-8 w-8 text-neutral-200" strokeWidth={1} />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Vault Empty</p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden overflow-hidden rounded-none border border-neutral-100 bg-white md:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Name</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Email</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Bespoke Piece</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Type</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Location</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Date</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <React.Fragment key={lead._id}>
                                        <tr
                                            onClick={() => toggleRow(lead._id)}
                                            className={`border-b border-neutral-50 transition-colors hover:bg-neutral-50 cursor-pointer ${expandedRows.has(lead._id) ? 'bg-neutral-50' : ''}`}
                                        >
                                            <td className="px-6 py-5">
                                                <p className="text-[14px] font-semibold text-black">{lead.name}</p>
                                                {lead.company && <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{lead.company}</p>}
                                            </td>
                                            <td className="px-6 py-5 text-[13px] text-neutral-600">{lead.email}</td>
                                            <td className="px-6 py-5 text-[13px] text-black font-serif italic">{lead.product || '—'}</td>
                                            <td className="px-6 py-5">
                                                <span className={`rounded-none px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${lead.type === 'enquiry' ? 'border-neutral-900 bg-black text-white' :
                                                    lead.type === 'callback' ? 'border-neutral-400 bg-white text-neutral-600' :
                                                        'border-neutral-200 bg-neutral-50 text-neutral-500'
                                                    }`}>
                                                    {lead.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-[13px] text-neutral-600 uppercase tracking-widest font-medium">{lead.country || '—'}</td>
                                            <td className="px-6 py-5 text-[11px] text-neutral-400 font-bold uppercase tracking-widest">
                                                {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteLead(lead._id);
                                                        }}
                                                        disabled={deletingId === lead._id}
                                                        className="text-neutral-300 transition-colors hover:text-black disabled:opacity-50"
                                                        title="Archive Record"
                                                    >
                                                        {deletingId === lead._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                        )}
                                                    </button>
                                                    <div className={`transition-transform duration-300 text-neutral-400 ${expandedRows.has(lead._id) ? 'rotate-180 text-black' : ''}`}>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Details Row */}
                                        {expandedRows.has(lead._id) && (
                                            <tr className="bg-neutral-50/50 border-b border-neutral-100">
                                                <td colSpan={7} className="p-0">
                                                    <div className="px-8 py-10 animate-in fade-in duration-500">
                                                        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">

                                                            {/* Contact Info */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2">
                                                                    Contact Profile
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    {lead.phone && (
                                                                        <div>
                                                                            <p className="text-[9px] uppercase font-bold text-neutral-300 tracking-widest mb-1">Private Line</p>
                                                                            <a href={`tel:${lead.phone}`} className="text-[15px] font-serif italic text-black hover:underline">{lead.phone}</a>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="text-[9px] uppercase font-bold text-neutral-300 tracking-widest mb-1">Email Dossier</p>
                                                                        <a href={`mailto:${lead.email}`} className="text-[15px] font-serif italic text-black hover:underline">{lead.email}</a>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Enquiry Details */}
                                                            {(lead.product || lead.quantity > 0) && (
                                                                <div className="space-y-4">
                                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2">
                                                                        Acquisition Request
                                                                    </h4>
                                                                    <div className="space-y-4">
                                                                        {lead.product && (
                                                                            <div>
                                                                                <p className="text-[9px] uppercase font-bold text-neutral-300 tracking-widest mb-1">Masterpiece Interest</p>
                                                                                <p className="text-[15px] font-serif italic text-black">{lead.product}</p>
                                                                            </div>
                                                                        )}
                                                                        {lead.quantity > 0 && (
                                                                            <div>
                                                                                <p className="text-[9px] uppercase font-bold text-neutral-300 tracking-widest mb-1">Desired Volume</p>
                                                                                <p className="text-[13px] font-bold text-black border border-black inline-block px-3 py-1 uppercase tracking-widest">{lead.quantity} Pieces</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Message */}
                                                            {lead.message && (
                                                                <div className="space-y-4 lg:col-span-1 md:col-span-2">
                                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2">
                                                                        Personal Note
                                                                    </h4>
                                                                    <div className="bg-white border border-neutral-100 p-6">
                                                                        <p className="text-[14px] text-neutral-600 font-light italic leading-loose">
                                                                            &quot;{lead.message}&quot;
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="space-y-4 md:hidden">
                        {leads.map((lead) => (
                            <div key={lead._id} className="flex flex-col border border-neutral-100 bg-white">
                                <div
                                    onClick={() => toggleRow(lead._id)}
                                    className={`flex items-center justify-between p-6 cursor-pointer ${expandedRows.has(lead._id) ? 'bg-neutral-50' : ''}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-[15px] font-bold text-black">{lead.name}</h3>
                                                <p className="mt-0.5 text-[12px] font-medium text-neutral-400">{lead.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest border ${lead.type === 'enquiry' ? 'bg-black text-white border-black' : 'bg-white text-neutral-400 border-neutral-200'}`}>
                                                {lead.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Mobile Content */}
                                {expandedRows.has(lead._id) && (
                                    <div className="border-t border-neutral-100 bg-neutral-50 p-6 space-y-6">
                                        {lead.phone && (
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-1">Phone</p>
                                                <p className="text-[15px] font-serif italic text-black">{lead.phone}</p>
                                            </div>
                                        )}
                                        {lead.product && (
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-1">Product</p>
                                                <p className="text-[15px] font-serif italic text-black">{lead.product}</p>
                                            </div>
                                        )}
                                        {lead.message && (
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-1">Message</p>
                                                <p className="text-[13px] font-light text-neutral-600 italic leading-relaxed">{lead.message}</p>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-neutral-100 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteLead(lead._id);
                                                }}
                                                className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]"
                                            >
                                                Delete Record
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

