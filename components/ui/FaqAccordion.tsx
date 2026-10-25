'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface FaqItemProps {
    question: string;
    answer: string;
}

export function FaqAccordion({ faqs }: { faqs: FaqItemProps[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="mx-auto w-full max-w-3xl space-y-4">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={index}
                        className={`overflow-hidden rounded-none border-b border-neutral-100 bg-white transition-all duration-300 ${isOpen ? 'shadow-sm' : ''
                            } border border-transparent`}
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="group flex w-full items-center justify-between px-0 py-6 text-left focus:outline-none"
                        >
                            <span className="font-serif text-lg text-black transition-colors group-hover:text-neutral-600 sm:text-xl">
                                {faq.question}
                            </span>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center transition-colors duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                                <Plus className="h-5 w-5 text-black" strokeWidth={1} />
                            </div>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                        >
                            <div className="overflow-hidden">
                                <div className="pb-8 pt-0">
                                    <p className="text-[15px] leading-[1.8] text-neutral-500 max-w-2xl">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
