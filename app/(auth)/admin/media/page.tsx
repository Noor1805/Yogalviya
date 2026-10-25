'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, UploadCloud, Folder, Image as ImageIcon, Video, Trash2, Link as LinkIcon, Check, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminNotifications } from '@/components/admin/AdminNotificationsProvider';
import { useHotkeys } from '@/hooks/useHotkeys';
import BulkActionBar from '@/components/admin/BulkActionBar';

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<any[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [activeFolder, setActiveFolder] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Modal state
    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
    const [copied, setCopied] = useState(false);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const { refresh } = useAdminNotifications();

    useHotkeys('a', () => {
        if (selectedIds.size === media.length && media.length > 0) setSelectedIds(new Set());
        else setSelectedIds(new Set(media.map(m => m._id)));
    }, true);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const url = activeFolder === 'all' 
                ? '/api/admin/media' 
                : `/api/admin/media?folder=${activeFolder}`;
            
            const res = await fetch(url, { cache: 'no-store' });
            const data = await res.json();
            setMedia(data.items || []);
            setFolders(data.folders || []);
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMedia();
    }, [activeFolder]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result as string;
                const folderName = activeFolder === 'all' ? 'general' : activeFolder;
                const isVideo = file.type.startsWith('video/');

                const res = await fetch('/api/admin/media', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        base64Data,
                        filename: file.name,
                        folder: folderName,
                        isVideo
                    })
                });

                if (res.ok) {
                    await fetchMedia();
                } else {
                    alert('Upload failed');
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Move this file to the recycle bin? You can restore it later.')) return;
        try {
            const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMedia(prev => prev.filter(m => m._id !== id));
                setSelectedMedia(null);
                void refresh();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulkAction = async (action: 'delete' | 'restore' | 'hard_delete') => {
        if (!confirm(`Are you sure you want to move ${selectedIds.size} files to trash?`)) return;
        setBulkLoading(true);
        try {
            const res = await fetch('/api/admin/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds), action, target: 'Media' })
            });
            if (res.ok) {
                setSelectedIds(new Set());
                fetchMedia();
                void refresh();
            } else {
                alert('Bulk action failed');
            }
        } catch {
            alert('Bulk action failed');
        }
        setBulkLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 relative pb-24">
            <BulkActionBar 
                selectedIds={Array.from(selectedIds)} 
                onClear={() => setSelectedIds(new Set())} 
                onAction={handleBulkAction} 
                loading={bulkLoading} 
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Media Library</h1>
                    <p className="mt-1 text-sm text-neutral-500">Manage all product images and videos in one place.</p>
                </div>
                
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*,video/*"
                />
                <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={uploading}
                    className="bg-neutral-900 text-white font-semibold py-2 px-5 hover:bg-neutral-800 rounded-lg shadow-sm"
                >
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Upload File
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
                {/* Folders Sidebar */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4 h-fit">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 px-2">Folders</h3>
                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveFolder('all')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeFolder === 'all' 
                                ? 'bg-neutral-100 text-neutral-900' 
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                        >
                            <ImageIcon className="h-4 w-4" /> All Media
                        </button>
                        {folders.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFolder(f)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeFolder === f 
                                    ? 'bg-neutral-100 text-neutral-900' 
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                            >
                                <Folder className="h-4 w-4" /> {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media Grid */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 min-h-[500px]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
                        </div>
                    ) : media.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                            <UploadCloud className="h-12 w-12 mb-3 opacity-20" />
                            <p>No media files found in this folder.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {media.map((item) => (
                                <div 
                                    key={item._id} 
                                    onClick={() => setSelectedMedia(item)}
                                    className="group relative aspect-square rounded-lg border border-neutral-200 overflow-hidden cursor-pointer hover:border-neutral-900 transition-colors"
                                >
                                    <img 
                                        src={item.thumbnailUrl} 
                                        alt={item.filename}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />

                                    {/* Selection Checkbox overlay */}
                                    <div 
                                        onClick={(e) => toggleSelect(item._id, e)}
                                        className={`absolute top-2 left-2 z-10 w-6 h-6 rounded border flex items-center justify-center transition-colors shadow-sm ${
                                            selectedIds.has(item._id) 
                                                ? 'bg-neutral-900 border-neutral-900 text-white' 
                                                : 'bg-white/80 border-neutral-300 text-transparent hover:bg-white opacity-0 group-hover:opacity-100 backdrop-blur-sm'
                                        }`}
                                    >
                                        <Check className="h-3.5 w-3.5 opacity-100" />
                                    </div>
                                    
                                    {item.type === 'video' && (
                                        <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-md backdrop-blur-sm">
                                            <Video className="h-3 w-3" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-[10px] truncate">{item.filename}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        <div className="flex-1 bg-neutral-100 flex items-center justify-center min-h-[400px] relative">
                            <button 
                                onClick={() => setSelectedMedia(null)}
                                className="absolute top-4 left-4 bg-white/80 p-2 rounded-full hover:bg-white z-10 md:hidden"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            {selectedMedia.type === 'video' ? (
                                <video src={selectedMedia.url} controls className="max-h-[600px] w-full" />
                            ) : (
                                <img src={selectedMedia.url} alt={selectedMedia.filename} className="max-h-[600px] object-contain" />
                            )}
                        </div>
                        <div className="w-full md:w-80 p-6 flex flex-col justify-between border-l border-neutral-200">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-bold text-neutral-900 text-lg truncate pr-4">{selectedMedia.filename}</h3>
                                    <button onClick={() => setSelectedMedia(null)} className="text-neutral-400 hover:text-neutral-900 hidden md:block">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                
                                <div className="space-y-4 text-sm text-neutral-600">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Type</p>
                                        <p className="capitalize">{selectedMedia.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Folder</p>
                                        <p>{selectedMedia.folder}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Dimensions</p>
                                        <p>{selectedMedia.width} × {selectedMedia.height}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Size</p>
                                        <p>{(selectedMedia.bytes / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Uploaded</p>
                                        <p>{new Date(selectedMedia.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    <div className="pt-2 border-t border-neutral-200">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">URL</p>
                                        <div className="flex gap-2">
                                            <input 
                                                readOnly 
                                                value={selectedMedia.url} 
                                                className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded"
                                            />
                                            <Button 
                                                onClick={() => copyToClipboard(selectedMedia.url)}
                                                variant="outline" 
                                                className="px-2 border-neutral-200"
                                            >
                                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <Button 
                                variant="destructive" 
                                onClick={() => handleDelete(selectedMedia._id)}
                                className="w-full mt-8"
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Move to Trash
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
