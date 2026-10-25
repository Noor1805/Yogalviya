'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function MetaPixel() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track PageView on route change (Next.js app router doesn't auto-track this on client-side navigation)
        // We delay slightly to ensure fbq is fully loaded
        const handleRouteChange = () => {
            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'PageView');
            }
        };
        
        // Execute tracking
        handleRouteChange();
    }, [pathname, searchParams]);

    return (
        <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];
                t=b.createElement(e);t.async=!0;
                t.src=v;
                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
                }(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                
                /* Initialize both pixels */
                fbq('init', '26140052635646014');
                fbq('init', '1582394072865167');
                
                /* Default page view */
                fbq('track', 'PageView');
                `,
            }}
        />
    );
}
