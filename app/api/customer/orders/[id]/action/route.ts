import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { z } from 'zod';
import { EmailService } from '@/lib/services/email.service';
import { buildCustomerOrderOwnershipQuery } from '@/lib/utils/customer-order-access';

const actionSchema = z.object({
    action: z.enum(['cancel', 'return', 'replace']),
    reason: z.string().max(500).optional(),
    evidence: z.array(z.object({
        publicId: z.string().optional(),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        type: z.enum(['image', 'video']),
    })).max(6).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const user = session?.user as { id?: string; email?: string | null; role?: string } | undefined;
    const userRole = user?.role;
    if (!session || !session.user || userRole !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        
        const validated = actionSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
        }
        
        const { action, reason, evidence = [] } = validated.data;
        
        const order = await Order.findOne({
            _id: id,
            ...buildCustomerOrderOwnershipQuery(user || {}),
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (action === 'cancel') {
            if (['shipped', 'out_for_delivery', 'delivered', 'completed', 'cancelled', 'refunded', 'return_requested', 'replace_requested', 'returned', 'replaced'].includes(order.status)) {
                return NextResponse.json({ error: 'Order cannot be cancelled at this stage. Please request a return if eligible.' }, { status: 400 });
            }

            if (order.cancellation?.status === 'requested') {
                return NextResponse.json({ error: 'Cancellation request is already under review.' }, { status: 400 });
            }

            const now = new Date();
            const requestedFromStatus = order.status;
            order.status = 'cancel_requested';
            order.cancellation = {
                ...(order.cancellation || {}),
                status: 'requested',
                reason: reason || '',
                requestedAt: now,
                requestedFromStatus,
            };
            order.notes.push({
                author: 'system',
                message: `Customer requested cancellation. Reason: ${reason || 'None provided'}`,
                createdAt: now
            });
            order.statusHistory.push({
                type: 'cancellation',
                from: requestedFromStatus,
                to: 'requested',
                message: 'Customer submitted a cancellation request for admin review.',
                actorType: 'customer',
                createdAt: now,
            });
            await order.save();
            EmailService.sendTemplatedEmail(order.customerEmail, 'cancel_request_received', {
                ...EmailService.getOrderEmailVariables(order),
                cancellationReason: reason || 'No reason provided',
            }).catch((err) => console.error('[Email Trigger Failed] Cancellation request:', err));
            return NextResponse.json({ success: true, message: 'Cancellation request submitted. Our team will review it shortly.' });
        }

        if (action === 'return' || action === 'replace') {
            if (order.status !== 'delivered' && order.status !== 'completed') {
                return NextResponse.json({ error: `Cannot ${action} unless order is delivered.` }, { status: 400 });
            }

            // Optional Security: Verify 7-day rule server-side
            const deliveredDate = order.deliveredAt; 
            if (deliveredDate) {
                const diffTime = Math.abs(new Date().getTime() - deliveredDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    return NextResponse.json({ error: 'Return/Replace window of 7 days has expired.' }, { status: 400 });
                }
            } else {
                return NextResponse.json({ error: 'Order delivery date is missing; cannot process window locally.' }, { status: 400 });
            }

            const imageCount = evidence.filter((item) => item.type === 'image').length;
            const videoCount = evidence.filter((item) => item.type === 'video').length;

            if (imageCount === 0 || videoCount === 0) {
                return NextResponse.json(
                    { error: 'Please provide at least one image and one video for return or replacement review.' },
                    { status: 400 }
                );
            }

            if (action === 'return') {
                order.status = 'return_requested';
                order.returnReason = reason || '';
                order.returnRequestedAt = new Date();
                order.returnEvidence = evidence;
                order.returnRequest = {
                    ...(order.returnRequest || {}),
                    status: 'requested',
                    reason: reason || '',
                    requestedAt: new Date(),
                    evidence,
                    qcStatus: 'pending',
                };
            } else {
                order.status = 'replace_requested';
                order.replaceReason = reason || '';
                order.replaceRequestedAt = new Date();
                order.replaceEvidence = evidence;
                order.replacement = {
                    ...(order.replacement || {}),
                    status: 'requested',
                    reason: reason || '',
                    requestedAt: new Date(),
                    evidence,
                };
            }

            order.notes.push({
                author: 'system',
                message: `Customer requested a ${action}. Reason: ${reason || 'None provided'}`,
                createdAt: new Date()
            });
            order.statusHistory.push({
                type: action === 'return' ? 'return' : 'replacement',
                from: 'delivered',
                to: 'requested',
                message: `Customer submitted a ${action} request with evidence.`,
                actorType: 'customer',
                createdAt: new Date(),
            });

            await order.save();
            EmailService.sendTemplatedEmail(
                order.customerEmail,
                action === 'return' ? 'return_request_received' : 'replacement_request_received',
                {
                    ...EmailService.getOrderEmailVariables(order),
                    requestReason: reason || 'No reason provided',
                }
            ).catch((err) => console.error(`[Email Trigger Failed] ${action} request:`, err));
            return NextResponse.json({ success: true, message: `${action.toUpperCase()} request submitted successfully.` });
        }

        return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });

    } catch (error: unknown) {
        console.error('Order Action Error:', error);
        return NextResponse.json({ error: 'Action failed. Please try again.' }, { status: 500 });
    }
}
