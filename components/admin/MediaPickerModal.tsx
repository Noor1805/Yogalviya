'use client';

import { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaItem {
    _id: string;
    url: string;
    thumbnailUrl: string;
    type: 'image' | 'video';
    filename: string;
    folder: string;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    // Allow filtering by a specific product folder
    suggestedFolder?: string; 
}

export function MediaPickerModal({ isOpen, onClose, onSelect, suggestedFolder }: MediaPickerModalProps) {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [activeFolder, setActiveFolder] = useState<string>(suggestedFolder || 'all');
    const [loading, setLoading] = useState(true);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const url = activeFolder === 'all' 
                ? '/api/admin/media' 
                : `/api/admin/media?folder=${activeFolder}`;
            
            const res = await fetch(url);
            const data = await res.json();
            setMedia(data.items || []);
            setFolders(data.folders || []);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen, activeFolder]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 p-4">
                    <h2 className="text-lg font-bold text-neutral-900">Select Media</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">
                        <X className="h-5 w-5 text-neutral-500" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-neutral-100 bg-neutral-50 p-4 overflow-y-auto hidden sm:block">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Folders</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveFolder('all')}
                                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                                    activeFolder === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-200'
                                }`}
                            >
                                All Media
                            </button>
                            {folders.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFolder(f)}
                                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                                        activeFolder === f ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-4 bg-white">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
                            </div>
                        ) : media.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                                <ImageIcon className="mb-3 h-12 w-12 opacity-20" />
                                <p>No media found in this folder.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {media.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => {
                                            onSelect(item.url);
                                            onClose();
                                        }}
                                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-neutral-200 hover:border-neutral-900"
                                    >
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.filename}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        {item.type === 'video' && (
                                            <div className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white backdrop-blur-sm">
                                                <Video className="h-3 w-3" />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <p className="truncate text-[10px] text-white">{item.filename}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
