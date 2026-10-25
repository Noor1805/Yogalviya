import { NextRequest, NextResponse } from 'next/server';
import { enquirySchema, quoteSchema, contactSchema, callbackSchema } from '@/types/enquiry';
import { rateLimit } from '@/lib/utils/rate-limit';
import { sendMetaEvent } from '@/lib/meta-capi';

export async function POST(request: NextRequest) {
    try {
        // Rate limit check
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rateLimitResult = rateLimit(ip);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Honeypot check
        if (body.honeypot && body.honeypot.length > 0) {
            // Silently reject bot submissions
            return NextResponse.json({ success: true });
        }

        // Determine which schema to use based on the incoming data
        let result;
        if (body.type === 'contact') {
            result = contactSchema.safeParse(body);
        } else if (body.type === 'callback') {
            result = callbackSchema.safeParse(body);
        } else if (body.brandingType) {
            // If brandingType exists, it's a quote 
            result = quoteSchema.safeParse(body);
            if (result.success) {
                // Ensure type is 'enquiry' for DB consistency even if it's a quote
                body.type = 'enquiry';
            }
        } else {
            // Standard enquiry form
            result = enquirySchema.safeParse(body);
            body.type = 'enquiry';
        }

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid form data.', details: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        // Save to MongoDB (with graceful fallback)
        try {
            const dbConnect = (await import('@/lib/db')).default;
            const Enquiry = (await import('@/lib/models/Enquiry')).default;

            await dbConnect();

            // Ensure payload has the correct types for MongoDB
            const payload = { ...result.data, type: body.type } as any;
            if ('quantity' in payload && typeof payload.quantity === 'string') {
                payload.quantity = parseInt(payload.quantity, 10) || 0;
            }

            await Enquiry.create(payload);

            // Trigger Server-Side Conversion (CAPI) if an eventId was provided by client
            if (body.eventId) {
                // Background execution so we don't block the API response
                sendMetaEvent({
                    email: payload.email,
                    phone: payload.phone,
                    eventName: 'Lead',
                    eventId: body.eventId,
                    sourceUrl: request.headers.get('referer') || `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                });
            }
        } catch (dbError) {
            // Log the error but don't fail the request
            console.error('Database error (enquiry still logged):', dbError);
            console.log('Enquiry data (fallback log):', result.data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Enquiry API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error.' },
            { status: 500 }
        );
    }
}
