'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductReviewsPanel from './ProductReviewsPanel';

interface Specification { label: string; value: string }

interface ProductTabsProps {
  productId: string;
  description?: string;
  shortDescription?: string;
  productDetails?: string;
  commitment?: string;
  additionalInfo?: Array<{ label: string; value: string }>;
  specifications: Specification[];
}

// ─── Desktop Tab Layout ──────────────────────────────────────────────────────
function DesktopTabs({
  productId,
  description,
  shortDescription,
  productDetails,
  commitment,
  additionalInfo,
  specifications,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'info' | 'reviews'>('description');
  const specs = specifications.filter((spec) => spec.label && spec.value);
  const infoRows = Array.isArray(additionalInfo)
    ? additionalInfo.filter((item) => item.label && item.value)
    : [];

  return (
    <section className="w-full border-t border-neutral-100 mt-20 pb-24">
      <div className="flex justify-center border-b border-neutral-100">
        {([
          { key: 'description' as const, label: 'Additional Description' },
          { key: 'info' as const, label: 'Additional Information' },
          { key: 'reviews' as const, label: 'Reviews' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors',
              activeTab === key
                ? 'text-[#26352b] border-b-2 border-[#26352b]'
                : 'text-neutral-400 hover:text-neutral-600'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {activeTab === 'description' && (
          <div className="text-center">
            {shortDescription ? (
              <p className="text-[13px] text-neutral-500 leading-loose max-w-xl mx-auto italic font-serif whitespace-pre-line">
                {shortDescription}
              </p>
            ) : (
              <p className="text-[13px] text-neutral-400 leading-loose max-w-xl mx-auto italic font-serif">
                Thoughtfully crafted for a more mindful everyday practice.
              </p>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-6">
            {infoRows.length > 0 && (
              <div className="w-full">
                {infoRows.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center py-4 border-b border-neutral-100 px-6',
                      i % 2 === 0 ? 'bg-neutral-50/40' : 'bg-white'
                    )}
                  >
                    <span className="text-[11px] font-bold text-neutral-900 w-48 shrink-0 uppercase tracking-tight">{item.label}</span>
                    <span className="text-[11px] text-neutral-500 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {specs.length > 0 ? (
              <div className="w-full mt-12 border-t border-neutral-100 pt-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 px-6 text-black">Specifications</h4>
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center py-4 border-b border-neutral-100 px-6',
                      i % 2 === 0 ? 'bg-neutral-50/40' : 'bg-white'
                    )}
                  >
                    <span className="text-[11px] font-bold text-neutral-900 w-48 shrink-0 uppercase tracking-tight">{spec.label}</span>
                    <span className="text-[11px] text-neutral-500 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-neutral-200 px-6 py-5 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                Additional information will appear here once it is added in admin.
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviewsPanel productId={productId} />
        )}
      </div>
    </section>
  );
}

// ─── Mobile Accordion Item ───────────────────────────────────────────────────
function MobileAccordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 min-h-[48px] touch-manipulation"
      >
        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-900">{title}</span>
        <ChevronDown
          className={cn('w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>
      <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-[2000px] pb-4' : 'max-h-0')}>
        <div className="px-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Mobile Accordion Layout ─────────────────────────────────────────────────
function MobileAccordions({
  productId,
  description,
  shortDescription,
  additionalInfo,
  specifications,
}: ProductTabsProps) {
  const specs = specifications.filter((spec) => spec.label && spec.value);
  const infoRows = Array.isArray(additionalInfo)
    ? additionalInfo.filter((item) => item.label && item.value)
    : [];

  return (
    <section className="border-t border-gray-100 mt-8 pb-6">
      {/* Additional Description */}
      <MobileAccordion title="Additional Description" defaultOpen>
        {shortDescription ? (
          <p className="text-[13px] text-gray-500 leading-relaxed font-serif italic whitespace-pre-line">
            {shortDescription}
          </p>
        ) : description ? (
          <p className="text-[13px] text-gray-500 leading-relaxed whitespace-pre-line">{description}</p>
        ) : (
          <p className="text-[12px] text-gray-400 italic">No description available.</p>
        )}
      </MobileAccordion>

      {/* Additional Information */}
      <MobileAccordion title="Additional Information">
        {infoRows.length > 0 ? (
          <div className="flex flex-col gap-0">
            {infoRows.map((item, i) => (
              <div key={i} className={cn('py-3 flex gap-3 border-b border-gray-50', i % 2 === 0 && 'bg-gray-50/50')}>
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-tight w-28 shrink-0">{item.label}</span>
                <span className="text-[11px] text-gray-500">{item.value}</span>
              </div>
            ))}
          </div>
        ) : specs.length > 0 ? (
          <div className="flex flex-col gap-0">
            {specs.map((spec, i) => (
              <div key={i} className={cn('py-3 flex gap-3 border-b border-gray-50', i % 2 === 0 && 'bg-gray-50/50')}>
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-tight w-28 shrink-0">{spec.label}</span>
                <span className="text-[11px] text-gray-500">{spec.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 italic">No additional information available.</p>
        )}
      </MobileAccordion>

      {/* Reviews */}
      <MobileAccordion title="Reviews">
        <ProductReviewsPanel productId={productId} />
      </MobileAccordion>
    </section>
  );
}

// ─── Main export — renders desktop tabs or mobile accordions ─────────────────
export default function ProductTabs(props: ProductTabsProps) {
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <MobileAccordions {...props} />
      </div>
      {/* Desktop */}
      <div className="hidden lg:block">
        <DesktopTabs {...props} />
      </div>
    </>
  );
}
