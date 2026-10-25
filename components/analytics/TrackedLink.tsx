'use client';

import React from 'react';

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    eventName?: string;
}

export default function TrackedLink({ eventName = 'Contact', onClick, ...props }: TrackedLinkProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', eventName);
        }
        if (onClick) {
            onClick(e);
        }
    };

    return <a onClick={handleClick} {...props} />;
}
