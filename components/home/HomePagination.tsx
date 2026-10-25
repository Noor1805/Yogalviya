"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";

export default function HomePagination() {
  return (
    <section className="py-12 bg-white">
      <Container>
        <div className="flex items-center justify-center gap-6">
          <button className="text-gray-400 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button 
                key={num}
                className={`text-[13px] font-bold w-6 h-6 flex items-center justify-center transition-all ${
                  num === 1 ? "bg-black text-white" : "text-gray-400 hover:text-black"
                }`}
              >
                {num}
              </button>
            ))}
            <span className="text-gray-400 font-bold px-1">–</span>
          </div>

          <button className="text-black hover:text-gray-400 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </Container>
    </section>
  );
}
