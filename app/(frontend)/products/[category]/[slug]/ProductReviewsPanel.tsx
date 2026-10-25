'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Loader2, Star, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewPhoto {
  publicId?: string;
  url: string;
  thumbnailUrl?: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  comment: string;
  photos: ReviewPhoto[];
  customerName: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewResponse {
  reviews: ReviewItem[];
  summary: {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: Array<{ rating: number; count: number }>;
  };
  viewer: {
    isLoggedIn: boolean;
    hasPurchased: boolean;
    canReview: boolean;
    existingReview: ReviewItem | null;
  };
}

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

function ReviewStars({
  rating,
  onSelect,
  interactive = false,
}: {
  rating: number;
  onSelect?: (value: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => interactive && onSelect?.(value)}
          className={cn(interactive ? 'cursor-pointer' : 'cursor-default', 'transition-transform', interactive && 'hover:scale-110')}
        >
          <Star
            className={cn(
              'h-4 w-4',
              value <= rating ? 'fill-[#C5A55A] text-[#C5A55A]' : 'fill-transparent text-neutral-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviewsPanel({ productId }: { productId: string }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<ReviewPhoto[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);

  const loadReviews = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { cache: 'no-store' });
      const nextData = await res.json();

      if (!res.ok) {
        throw new Error(nextData.error || 'Failed to load reviews');
      }

      setData(nextData);

      if (nextData.viewer?.existingReview) {
        setRating(nextData.viewer.existingReview.rating);
        setTitle(nextData.viewer.existingReview.title || '');
        setComment(nextData.viewer.existingReview.comment || '');
        setExistingPhotos(nextData.viewer.existingReview.photos || []);
      } else {
        setRating(0);
        setTitle('');
        setComment('');
        setExistingPhotos([]);
      }

      setPendingPhotos((current) => {
        current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
        return [];
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, status]);

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const removePendingPhoto = (id: string) => {
    setPendingPhotos((current) => {
      const next = current.filter((photo) => {
        if (photo.id === id) {
          URL.revokeObjectURL(photo.previewUrl);
          return false;
        }

        return true;
      });

      return next;
    });
  };

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const usedSlots = existingPhotos.length + pendingPhotos.length;
    const remainingSlots = Math.max(0, 4 - usedSlots);

    if (remainingSlots === 0) {
      toast.error('You can upload up to 4 review photos.');
      event.target.value = '';
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith('image/')).slice(0, remainingSlots);

    if (validFiles.length === 0) {
      toast.error('Please choose image files only.');
      event.target.value = '';
      return;
    }

    const nextPhotos = validFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingPhotos((current) => [...current, ...nextPhotos]);
    event.target.value = '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating < 1) {
      toast.error('Please select a rating.');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review.');
      return;
    }

    setSubmitting(true);

    try {
      const uploadedPhotos = await Promise.all(
        pendingPhotos.map(async (photo) => {
          const formData = new FormData();
          formData.append('file', photo.file);

          const res = await fetch('/api/customer/reviews/upload', {
            method: 'POST',
            body: formData,
          });
          const payload = await res.json();

          if (!res.ok) {
            throw new Error(payload.error || 'Failed to upload a photo');
          }

          return {
            publicId: payload.publicId,
            url: payload.url,
            thumbnailUrl: payload.thumbnailUrl,
          } satisfies ReviewPhoto;
        })
      );

      const reviewPayload = {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        photos: [...existingPhotos, ...uploadedPhotos].slice(0, 4),
      };

      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || 'Failed to save review');
      }

      toast.success(data?.viewer.existingReview ? 'Review updated.' : 'Review submitted.');
      await loadReviews();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
      </div>
    );
  }

  const totalReviews = data?.summary.totalReviews ?? 0;
  const averageRating = data?.summary.averageRating ?? 0;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
        <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">Customer Rating</p>
          <p className="mt-4 text-5xl font-light text-neutral-900">{averageRating ? averageRating.toFixed(1) : '0.0'}</p>
          <div className="mt-3 flex justify-center">
            <ReviewStars rating={Math.round(averageRating)} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            {totalReviews} review{totalReviews === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-[24px] border border-neutral-200 bg-white px-6 py-8">
          <div className="space-y-4">
            {(data?.summary.ratingBreakdown || [5, 4, 3, 2, 1].map((value) => ({ rating: value, count: 0 }))).map((entry) => {
              const share = totalReviews > 0 ? (entry.count / totalReviews) * 100 : 0;

              return (
                <div key={entry.rating} className="grid grid-cols-[42px_1fr_36px] items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    {entry.rating} Star
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-neutral-900 transition-[width]" style={{ width: `${share}%` }} />
                  </div>
                  <span className="text-right text-[11px] font-medium text-neutral-500">{entry.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        {!session ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">Write A Review</p>
              <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-neutral-500">
                Sign in with the customer account that placed the order to leave a verified review and upload your product photos.
              </p>
            </div>
            <Link
              href={loginHref}
              className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-900 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
            >
              Sign In To Review
            </Link>
          </div>
        ) : !data?.viewer.canReview ? (
          <div className="flex items-start gap-4 rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-5 py-5">
            <Camera className="mt-0.5 h-5 w-5 shrink-0 text-neutral-300" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">Verified Purchase Required</p>
              <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
                Only customers with a delivered or completed order for this product can submit a review with photos.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                  {data.viewer.existingReview ? 'Update Your Review' : 'Write A Review'}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
                  Share your purchase experience and upload up to 4 photos of the product.
                </p>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Verified Purchase
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Your Rating</p>
              <div className="mt-3">
                <ReviewStars rating={rating} onSelect={setRating} interactive />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Headline for your review"
                className="border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                maxLength={120}
              />
              <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-200 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900">
                <Upload className="h-3.5 w-3.5" />
                Add Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>
            </div>

            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Tell other customers about the fit, quality, finish, and how the product looks in person."
              className="min-h-32 border-neutral-200 focus-visible:border-neutral-900 focus-visible:ring-neutral-900"
              maxLength={2000}
            />

            {(existingPhotos.length > 0 || pendingPhotos.length > 0) && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {existingPhotos.map((photo, index) => (
                  <div key={`${photo.url}-${index}`} className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                    <img src={photo.thumbnailUrl || photo.url} alt="" className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(index)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm transition-colors hover:bg-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {pendingPhotos.map((photo) => (
                  <div key={photo.id} className="relative overflow-hidden rounded-2xl border border-dashed border-neutral-200 bg-neutral-50">
                    <img src={photo.previewUrl} alt="" className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePendingPhoto(photo.id)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm transition-colors hover:bg-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                {comment.trim().length}/2000 characters
              </p>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-full bg-neutral-900 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-neutral-800"
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {data.viewer.existingReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {data?.reviews.length ? (
          data.reviews.map((review) => (
            <article key={review.id} className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <ReviewStars rating={review.rating} />
                  {review.title ? (
                    <h3 className="mt-4 text-lg font-semibold text-neutral-900">{review.title}</h3>
                  ) : null}
                  <p className="mt-4 text-[13px] leading-relaxed text-neutral-600 whitespace-pre-line">{review.comment}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[12px] font-semibold text-neutral-900">{review.customerName}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  {review.verifiedPurchase ? (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                      Verified Purchase
                    </p>
                  ) : null}
                </div>
              </div>

              {review.photos.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {review.photos.map((photo, index) => (
                    <div key={`${photo.url}-${index}`} className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                      <img src={photo.thumbnailUrl || photo.url} alt="" className="aspect-square w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-neutral-200 px-6 py-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">No Reviews Yet</p>
            <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
              The first verified customer review for this product will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
