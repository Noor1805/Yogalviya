'use client';

import { Trash2, ArchiveRestore, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionBarProps {
    selectedIds: string[];
    onClear: () => void;
    onAction: (action: 'delete' | 'restore' | 'hard_delete') => Promise<void>;
    loading?: boolean;
    mode?: 'active' | 'trash';
}

export default function BulkActionBar({ selectedIds, onClear, onAction, loading, mode = 'active' }: BulkActionBarProps) {
    if (selectedIds.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-neutral-200/60 bg-white px-6 py-3 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <span className="flex h-6 items-center justify-center rounded-full bg-neutral-900 px-2.5 text-xs font-bold text-white">
                {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-neutral-900">Items selected</span>
            <div className="h-4 w-px bg-neutral-200" />
            
            <div className="flex gap-2">
                {mode === 'active' ? (
                    <Button 
                        disabled={loading}
                        onClick={() => onAction('delete')}
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                    </Button>
                ) : (
                    <>
                        <Button 
                            disabled={loading}
                            onClick={() => onAction('restore')}
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:bg-green-50 hover:text-green-700 font-semibold"
                        >
                            <ArchiveRestore className="mr-2 h-4 w-4" /> Restore Items
                        </Button>
                        <Button 
                            disabled={loading}
                            onClick={() => onAction('hard_delete')}
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Forever
                        </Button>
                    </>
                )}
            </div>

            <button 
                onClick={onClear}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                title="Clear Selection"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
