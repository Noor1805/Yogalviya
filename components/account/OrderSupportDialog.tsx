'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, X, AlertCircle, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SUPPORTED_VIDEO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS, getAllowedFormatsMessage } from '@/lib/utils/video-mime-types';

interface EvidenceItem {
    publicId: string;
    url: string;
    thumbnailUrl: string;
    type: 'image' | 'video';
}

interface OrderSupportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: 'return' | 'replace';
    orderId: string;
    onSuccess: (message: string, nextStatus: string) => void;
}

export default function OrderSupportDialog({
    open,
    onOpenChange,
    action,
    orderId,
    onSuccess,
}: OrderSupportDialogProps) {
    const [reason, setReason] = useState('');
    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState('');

    // Industry-standard approach: Upload directly to Cloudinary using signed uploads
    const uploadToCloudinary = useCallback(async (file: File) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const isSupportedImage = SUPPORTED_IMAGE_EXTENSIONS.includes(fileExtension);
        const isSupportedVideo = SUPPORTED_VIDEO_EXTENSIONS.includes(fileExtension);

        if (!isSupportedImage && !isSupportedVideo) {
            throw new Error(`Unsupported file format: ${fileExtension}. ${getAllowedFormatsMessage('all')}`);
        }

        // Validate file size
        const maxSize = isSupportedVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            const sizeMB = Math.round(file.size / 1024 / 1024);
            const maxMB = maxSize / 1024 / 1024;
            throw new Error(`File too large: ${sizeMB}MB (max ${maxMB}MB)`);
        }

        // Get signed upload parameters from our API
        const signatureRes = await fetch('/api/customer/cloudinary-signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileType: file.type,
                fileName: file.name,
            }),
        });

        if (!signatureRes.ok) {
            const errorData = await signatureRes.json();
            throw new Error(errorData.error || 'Failed to get upload signature');
        }

        const signatureData = await signatureRes.json();

        // Create FormData for direct Cloudinary upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp.toString());
        formData.append('signature', signatureData.signature);
        formData.append('folder', signatureData.folder);
        formData.append('resource_type', isSupportedVideo ? 'video' : 'image');

        if (signatureData.eager) {
            formData.append('eager', signatureData.eager);
            formData.append('eager_async', 'true');
        }

        // Upload directly to Cloudinary
        const uploadRes = await fetch(signatureData.uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadRes.ok) {
            const cloudinaryError = await uploadRes.json();
            console.error('Cloudinary upload error:', cloudinaryError);
            throw new Error(cloudinaryError.error?.message || 'Upload to Cloudinary failed');
        }

        const result = await uploadRes.json();

        return {
            publicId: result.public_id,
            url: result.secure_url,
            thumbnailUrl: isSupportedVideo
                ? (result.eager?.[0]?.secure_url || result.secure_url)
                : result.secure_url,
            type: (isSupportedVideo ? 'video' : 'image') as 'image' | 'video',
        };
    }, []);

    const uploadFiles = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);
        setError('');
        setErrorDetails('');

        try {
            const uploads: EvidenceItem[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadProgress(Math.round((i / files.length) * 100));

                try {
                    const uploaded = await uploadToCloudinary(file);
                    uploads.push(uploaded);
                } catch (err) {
                    console.error(`Failed to upload ${file.name}:`, err);
                    throw err;
                }
            }

            setUploadProgress(100);
            setEvidence((current) => [...current, ...uploads].slice(0, 6));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload files';
            setError(errorMessage);
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [uploadToCloudinary]);

    // React Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: uploadFiles,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/avif': ['.avif'],
            'video/mp4': ['.mp4'],
            'video/quicktime': ['.mov'],
            'video/webm': ['.webm'],
        },
        maxSize: 200 * 1024 * 1024, // 200MB
        maxFiles: 6,
        disabled: uploading || evidence.length >= 6,
    });

    const handleSubmit = async () => {
        if (imageCount === 0 || videoCount === 0) {
            const missingParts = [
                imageCount === 0 ? 'one image' : null,
                videoCount === 0 ? 'one video' : null,
            ].filter(Boolean);
            setError(`Please upload ${missingParts.join(' and ')} before submitting your ${action} request.`);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/customer/orders/${orderId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    reason,
                    evidence,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Request failed');
            }

            onSuccess(data.message, `${action}_requested`);
            setReason('');
            setEvidence([]);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setSubmitting(false);
        }
    };

    const imageCount = evidence.filter((item) => item.type === 'image').length;
    const videoCount = evidence.filter((item) => item.type === 'video').length;
    const missingEvidenceMessage =
        imageCount === 0 && videoCount === 0
            ? 'Upload at least one image and one video to continue.'
            : imageCount === 0
              ? 'Add at least one image to continue.'
              : videoCount === 0
                ? 'Add at least one video to continue.'
                : '';

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                setError('');
                setErrorDetails('');
            }
            onOpenChange(newOpen);
        }}>
            <DialogContent className="max-w-2xl border-neutral-200 bg-white p-0 sm:max-w-2xl">
                <DialogHeader className="border-b border-neutral-100 px-6 py-5">
                    <DialogTitle className="text-xl font-semibold text-neutral-900">
                        {action === 'return' ? 'Request a Return' : 'Request a Replacement'}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-neutral-500">
                        Please share the issue clearly and upload at least one image and one video so the support team can review it quickly.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 px-6 py-6">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium">{error}</p>
                                    {errorDetails && (
                                        <p className="mt-1 text-xs text-red-600">{errorDetails}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Images</p>
                            <p className="mt-2 text-2xl font-semibold text-neutral-900">{imageCount}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Videos</p>
                            <p className="mt-2 text-2xl font-semibold text-neutral-900">{videoCount}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Uploads</p>
                            <p className="mt-2 text-2xl font-semibold text-neutral-900">{evidence.length}/6</p>
                        </div>
                    </div>

                    {missingEvidenceMessage && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            {missingEvidenceMessage}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="support-reason" className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                            Tell us what happened
                        </Label>
                        <Textarea
                            id="support-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Describe the issue with the item, packaging, fit, or damage."
                            className="min-h-[140px] border-neutral-200 bg-white"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                                Evidence Uploads
                            </Label>
                            <span className="text-xs text-neutral-400">JPEG, PNG, WebP, AVIF up to 10MB / MP4, MOV, WEBM up to 200MB</span>
                        </div>

                        {/* React Dropzone - Industry Standard File Upload */}
                        <div
                            {...getRootProps()}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all ${
                                isDragActive
                                    ? 'border-neutral-500 bg-neutral-100'
                                    : 'border-neutral-200 bg-neutral-50 hover:border-neutral-400'
                            }`}
                        >
                            <input {...getInputProps()} />
                            {uploading ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                                    <p className="mt-3 text-sm font-medium text-neutral-700">Uploading... {uploadProgress}%</p>
                                    <div className="mt-2 h-1 w-full max-w-[200px] rounded-full bg-neutral-200">
                                        <div
                                            className="h-1 rounded-full bg-neutral-900 transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-6 w-6 text-neutral-400" />
                                    <p className="mt-3 text-sm font-medium text-neutral-700">
                                        {isDragActive ? 'Drop files here...' : 'Upload images and videos'}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        Drag & drop or click to select. At least one image and one video required.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {evidence.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {evidence.map((item, index) => (
                                <div key={`${item.url}-${index}`} className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setEvidence((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                                        className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-1 text-white"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="aspect-[4/3] bg-neutral-100">
                                        {item.type === 'video' ? (
                                            <video src={item.url} controls className="h-full w-full object-cover" />
                                        ) : (
                                            <img src={item.url} alt="Uploaded evidence" className="h-full w-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-500">
                                        {item.type === 'video' ? (
                                            <Video className="h-3.5 w-3.5" />
                                        ) : (
                                            <ImageIcon className="h-3.5 w-3.5" />
                                        )}
                                        <span className="uppercase tracking-[0.14em]">{item.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-neutral-100 px-6 py-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-neutral-200 text-neutral-700">
                        Close
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || uploading}
                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Submit {action === 'return' ? 'Return' : 'Replacement'} Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
