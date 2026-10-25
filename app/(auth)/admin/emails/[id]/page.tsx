'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Code, FileText, Variable } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EmailEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Editor State
    const [subject, setSubject] = useState('');
    const [bodyHtml, setBodyHtml] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const fetchTemplate = async () => {
            setLoading(true);
            try {
                // We cheat slightly and fetch all, then find ours by ID to reuse the API
                const res = await fetch('/api/admin/emails');
                if (res.ok) {
                    const data = await res.json();
                    const target = data.templates.find((t: any) => t._id === id);
                    if (target) {
                        setTemplate(target);
                        setSubject(target.subject);
                        setBodyHtml(target.bodyHtml);
                        setIsActive(target.isActive);
                    }
                }
            } catch { }
            setLoading(false);
        };
        fetchTemplate();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/emails/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, bodyHtml, isActive })
            });
            if (res.ok) {
                alert('Template saved successfully!');
                router.push('/admin/emails');
            } else {
                alert('Save failed');
            }
        } catch {
            alert('Save failed');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
            </div>
        );
    }

    if (!template) {
        return <div className="p-8 text-neutral-500">Template not found.</div>;
    }

    return (
        <div className="pb-24 max-w-5xl">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-neutral-100 hover:bg-neutral-200">
                        <Link href="/admin/emails"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                            {template.name}
                        </h1>
                        <p className="text-[11px] text-indigo-600 font-mono font-bold mt-1 uppercase tracking-wider bg-indigo-50 inline-block px-1.5 py-0.5 rounded">
                            {template.type}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-600"
                        />
                        Target Active
                    </label>
                    <Button onClick={handleSave} disabled={saving} className="bg-neutral-900 text-white hover:bg-neutral-800">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Template
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Subject Line */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <label className="block text-sm font-semibold text-neutral-900 mb-2">Subject Line</label>
                        <Input 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="font-mono text-sm border-neutral-200 focus:ring-indigo-600 focus:border-indigo-600"
                        />
                    </div>

                    {/* Email Body HTML */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-0 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-2">
                                <Code className="h-4 w-4 text-indigo-600" /> HTML Editor
                            </label>
                            <span className="text-[10px] text-neutral-400 font-medium">Auto-saves disabled</span>
                        </div>
                        <textarea 
                            value={bodyHtml}
                            onChange={(e) => setBodyHtml(e.target.value)}
                            className="flex-1 w-full resize-none p-5 font-mono text-[13px] text-neutral-800 focus:outline-none focus:ring-0 whitespace-pre scrollbar-thin"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Sidebar Rules & Variables */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                        <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
                            <Variable className="h-4 w-4" /> Available Variables
                        </h3>
                        <p className="text-xs text-indigo-700/80 mb-4 leading-relaxed">
                            Copy and paste these tags into your subject or body. They will automatically be replaced with real customer data when the email is sent.
                        </p>
                        
                        <div className="space-y-2">
                            {template.description.replace('Variables: ', '').split(', ').map((v: string) => (
                                <div key={v} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-indigo-100/50 shadow-sm">
                                    <code className="text-xs font-bold text-indigo-600">{`{{${v}}}`}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" /> Formatting Tips
                        </h3>
                        <ul className="text-xs text-amber-800/80 space-y-2 list-disc pl-4 leading-relaxed">
                            <li>Write modern HTML using inline styles (`style="color:red;"`). Email clients strip out standard CSS files.</li>
                            <li>Use `&lt;strong&gt;` for bold text.</li>
                            <li>If the code looks messy, you can paste the template from an editor like Mailchimp directly here.</li>
                            <li>Keep images hosted via Cloudinary absolute URLs.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
