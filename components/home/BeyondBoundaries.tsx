"use client";

import Container from "@/components/layout/Container";

export default function BeyondBoundaries() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <Container className="max-w-[1440px]">
        
        {/* Helper small text at the edges */}
        <div className="flex justify-between items-center mb-8 px-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Social</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Responsibility</span>
        </div>

        {/* Massive Text */}
        <div className="flex flex-col items-center">
            <h2 
                className="font-black uppercase text-black leading-[0.85] text-center" 
                style={{ fontSize: 'clamp(60px, 12vw, 150px)', letterSpacing: '-0.04em' }}
            >
                BEYOND
                <br />
                BOUNDARIES
            </h2>
        </div>

        {/* Footer Branding Detail */}
        <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center">
             <div className="text-center">
                <h3 className="text-[18px] font-black uppercase tracking-[0.4em] text-black mb-1">YOGLIVYA</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Believe</p>
             </div>
        </div>

        {/* Horizontal Links Placeholder (Footer style) */}
        <div className="flex justify-between mt-24 px-4">
            <div className="flex gap-8">
                {['INSTAGRAM', 'PINTEREST', 'CONTACT', 'LEGACY'].map(item => (
                    <span key={item} className="text-[9px] font-bold text-gray-400 tracking-[0.1em] cursor-pointer hover:text-black transition-colors">{item}</span>
                ))}
            </div>
            <div className="flex gap-8">
                {['RETURNS', 'FREE'].map(item => (
                    <span key={item} className="text-[9px] font-bold text-gray-400 tracking-[0.1em] cursor-pointer hover:text-black transition-colors">{item}</span>
                ))}
            </div>
        </div>

      </Container>
    </section>
  );
}
