'use client';

export default function CertBanner() {
  const items = Array(10).fill('REFLECT FASHION');

  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 22s linear infinite;
        }
      `}</style>

      <div className="relative overflow-hidden bg-black py-5 hidden sm:block">
        <div className="marquee-track flex w-max items-center">
          {items.map((text, i) => (
            <div key={i} className="flex shrink-0 items-center">
              <span className="text-[22px] font-black uppercase tracking-[0.25em] text-white whitespace-nowrap px-8">
                {text}
              </span>
              <span className="text-white text-[18px] shrink-0 px-2">✦</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
