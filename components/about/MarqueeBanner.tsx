'use client';

export default function MarqueeBanner() {
    return (
        <div className="relative overflow-hidden bg-[#2E4737] py-6 sm:py-8">
            <div className="marquee-track flex whitespace-nowrap">
                {/* First set */}
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    YOGLIVYA
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    MINDFUL WELLNESS
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    YOGLIVYA
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    SUSTAINABLE YOGA
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>

                {/* Duplicate set for seamless loop */}
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    YOGLIVYA
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    MINDFUL WELLNESS
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    YOGLIVYA
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>
                <span className="mx-4 sm:mx-8 text-white text-lg sm:text-2xl font-bold uppercase tracking-[0.3em]">
                    SUSTAINABLE YOGA
                </span>
                <span className="mx-2 sm:mx-4 text-[#C69F68] text-xl sm:text-3xl">✦</span>
            </div>
        </div>
    );
}
