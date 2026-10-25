'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

interface ProductFAQProps {
    faqs: FAQ[];
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <div className="space-y-3">
            {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                    <div
                        key={faq.question}
                        className="overflow-hidden rounded-none border-b border-neutral-100 bg-white transition-all duration-300"
                    >
                        <button
                            onClick={() => toggle(i)}
                            className="flex w-full items-center justify-between px-0 py-6 text-left transition-colors duration-200 hover:text-neutral-500"
                        >
                            <h3 className="pr-4 text-[16px] font-serif italic text-black font-semibold">
                                {faq.question}
                            </h3>
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                                {isOpen ? (
                                    <Minus className="h-4 w-4 text-black" strokeWidth={1} />
                                ) : (
                                    <Plus className="h-4 w-4 text-black" strokeWidth={1} />
                                )}
                            </div>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                        >
                            <div className="overflow-hidden">
                                <p className="pb-6 text-sm leading-relaxed text-neutral-500 font-light">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
