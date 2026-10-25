const messages = ['Mindful movement', 'Made for your practice', 'Thoughtful essentials', 'Live the Yogic Way'];

export default function MarqueeBanner() {
    return (
        <div
            aria-label="Mindful movement. Thoughtful yoga essentials. Live the Yogic Way."
            className="overflow-hidden border-y border-[#d7c5a7]/20 bg-[#26352b] py-4 text-[#f5f3ed] sm:py-5"
        >
            <div className="home-marquee-track flex w-max items-center" aria-hidden="true">
                {[0, 1].map((copy) => (
                    <div key={copy} className="flex shrink-0 items-center">
                        {[...messages, ...messages, ...messages].map((message, index) => (
                            <div key={`${index}-${message}`} className="flex shrink-0 items-center">
                                <span className="px-5 font-serif text-base tracking-wide sm:px-8 sm:text-lg">
                                    {message}
                                </span>
                                <span className="text-xs text-[#c8b58d]" aria-hidden="true">✦</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
