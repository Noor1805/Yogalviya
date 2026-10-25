"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";

export default function JewelrySection() {
  return (
    <section className="relative w-full bg-white py-32 overflow-hidden select-none min-h-[900px]">
      
      <Container className="max-w-[1440px] relative h-[700px]">
        
        {/* 1. Top Right Decorative Star (Thin 8-point luxury star) */}
        <div className="absolute top-[-100px] right-[-20px] z-[10] pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="black" className="opacity-100 scale-[0.8] lg:scale-100">
             <path d="M12 0l0.8 9.2L21 12l-8.2 2.8L12 24l-0.8-9.2L3 12l8.2-2.8z" />
             <path d="M12 4l0.5 7.5L20 12l-7.5 0.5L12 20l-0.5-7.5L4 12l7.5-0.5z" opacity="0.4" />
          </svg>
        </div>

        {/* 2. Left Model Image (Shrunk and Clipped) */}
        <div 
           className="absolute left-0 top-[12%] w-[280px] h-[380px] z-[20] overflow-hidden bg-[#f3f3f3]" 
           style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)" }}
        >
           <Image 
             src="/images/women.jpg" 
             alt="Almina Jewelry Model" 
             fill 
             className="object-cover object-top grayscale" 
             sizes="280px"
           />
           {/* Overlapping Star for Left Image */}
           <div className="absolute bottom-[-10px] left-[-10px] z-[30]">
             <svg width="80" height="80" viewBox="0 0 24 24" fill="black">
                <path d="M12 0l0.5 11.5L24 12l-11.5 0.5L12 24l-0.5-11.5L0 12l11.5-0.5z" />
             </svg>
           </div>
        </div>

        {/* 3. Main Headline (Refined Positioning & Blend) */}
        <div className="absolute left-[34%] top-[22%] flex flex-col items-start z-[40] pointer-events-none mix-blend-difference">
          <h2 
             className="font-black uppercase text-white leading-[0.7] select-none" 
             style={{ fontSize: 'clamp(80px, 9vw, 130px)', letterSpacing: '-0.04em' }}
          >
             ALMINA
          </h2>
          <h2 
             className="font-black uppercase text-white leading-[0.7] select-none ml-[1.8em]" 
             style={{ fontSize: 'clamp(80px, 9vw, 130px)', letterSpacing: '-0.04em' }}
          >
             JEWELRY
          </h2>
        </div>

        {/* 4. Center Menu (Coming Soon) */}
        <div className="absolute left-[44%] top-[54%] z-[50]">
           <div className="flex flex-col">
              <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                 COMING SOON 
                 <span className="text-black font-black text-[14px]">*</span>
              </h3>
              <ul className="space-y-3">
                {['Necklaces', 'Earrings', 'Anklets', 'Ring', 'Bracelets'].map(item => (
                  <li key={item} className="text-[12px] text-gray-500 font-bold uppercase tracking-[0.05em] cursor-pointer hover:text-black transition-colors">
                      {item}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        {/* 5. Right Image (Shrunk & Clipped) */}
        <div 
           className="absolute right-[4%] top-[45%] w-[330px] h-[440px] z-[15] overflow-hidden bg-[#f3f3f3]" 
           style={{ clipPath: "polygon(40px 0, 100% 0, 100% 100%, 0 100%, 0 40px)" }}
        >
           <Image 
              src="/images/product/perfect.jpg" 
              alt="Jewelry Details" 
              fill 
              className="object-cover object-top grayscale" 
              sizes="330px"
           />
        </div>

        {/* 6. Bottom Left Description & Button */}
        <div className="absolute left-[2%] bottom-[0%] z-[50] flex flex-col gap-8 max-w-[280px]">
           <p className="text-[11px] text-gray-400 font-medium leading-[1.8] italic" style={{ fontFamily: 'Georgia, serif' }}>
             Almina Jewelry! Discover a stunning collection of elegant and unique pieces that will capture your heart
           </p>
           <button 
             className="bg-black text-white text-[10px] font-black uppercase tracking-[0.25em] px-8 py-3.5 w-fit hover:bg-gray-800 transition-all active:scale-95"
             style={{ clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)" }}
           >
             PRE ORDER
           </button>
        </div>

        {/* 7. Bottom Right Navigation Arrows */}
        <div className="absolute right-[12%] bottom-[0%] z-[50] flex items-center gap-10">
           <button className="text-black hover:opacity-40 transition-opacity"><ArrowLeft className="w-5 h-5" strokeWidth={2.5}/></button>
           <button className="text-black hover:opacity-40 transition-opacity"><ArrowRight className="w-5 h-5" strokeWidth={2.5}/></button>
        </div>

      </Container>

    </section>
  );
}
