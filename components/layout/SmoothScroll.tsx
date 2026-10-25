'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const destroyLenis = () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
        };

        const setupLenis = () => {
            destroyLenis();

            // Real touch devices behave more reliably with native scrolling.
            if (coarsePointerQuery.matches || reducedMotionQuery.matches) {
                return;
            }

            const lenis = new Lenis({
                duration: 1.2,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });

            lenisRef.current = lenis;

            const raf = (time: number) => {
                lenis.raf(time);
                rafRef.current = requestAnimationFrame(raf);
            };

            rafRef.current = requestAnimationFrame(raf);
        };

        const handlePreferenceChange = () => {
            setupLenis();
        };

        setupLenis();

        if (coarsePointerQuery.addEventListener) {
            coarsePointerQuery.addEventListener('change', handlePreferenceChange);
            reducedMotionQuery.addEventListener('change', handlePreferenceChange);
        } else {
            coarsePointerQuery.addListener(handlePreferenceChange);
            reducedMotionQuery.addListener(handlePreferenceChange);
        }

        return () => {
            if (coarsePointerQuery.removeEventListener) {
                coarsePointerQuery.removeEventListener('change', handlePreferenceChange);
                reducedMotionQuery.removeEventListener('change', handlePreferenceChange);
            } else {
                coarsePointerQuery.removeListener(handlePreferenceChange);
                reducedMotionQuery.removeListener(handlePreferenceChange);
            }

            destroyLenis();
        };
    }, []);

    return <>{children}</>;
}
