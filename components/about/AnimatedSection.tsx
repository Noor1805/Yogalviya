'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
}

export default function AnimatedSection({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    duration = 0.6,
}: AnimatedSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const getInitialPosition = () => {
        switch (direction) {
            case 'up':
                return { y: 50 };
            case 'down':
                return { y: -50 };
            case 'left':
                return { x: -50 };
            case 'right':
                return { x: 50 };
            case 'none':
                return {};
            default:
                return { y: 50 };
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...getInitialPosition() }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
