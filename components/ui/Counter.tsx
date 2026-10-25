'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
    end: number;
    suffix?: string;
    duration?: number;
    replayOnView?: boolean;
}

export default function Counter({
    end,
    suffix = '',
    duration = 2000,
    replayOnView = false,
}: CounterProps) {
    const [count, setCount] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const wasInViewRef = useRef(false);
    const hasPlayedRef = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!wasInViewRef.current) {
                        wasInViewRef.current = true;

                        if (replayOnView || !hasPlayedRef.current) {
                            hasPlayedRef.current = true;
                            setCount(0);
                            setAnimationKey((current) => current + 1);
                        }
                    }
                    return;
                }

                wasInViewRef.current = false;
                if (replayOnView) {
                    setCount(0);
                }
            },
            { threshold: 0.35 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [replayOnView]);

    useEffect(() => {
        if (animationKey === 0) return;

        let startTime: number | null = null;
        let animationFrame = 0;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [animationKey, end, duration]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    );
}
