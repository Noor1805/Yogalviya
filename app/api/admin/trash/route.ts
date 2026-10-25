import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Media from '@/lib/models/Media';
import { cloudinaryService } from '@/lib/services/cloudinary.service';
import { getVerifiedAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const [trashedProducts, trashedOrders, trashedMedia] = await Promise.all([
            Product.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean(),
            Order.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean(),
            Media.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean(),
        ]);

        return NextResponse.json(
            {
                products: trashedProducts,
                orders: trashedOrders,
                media: trashedMedia,
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0',
                },
            }
        );
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch trash bin' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { action, ids, target } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No items selected' }, { status: 400 });
        }
        await dbConnect();

        let Model;
        if (target === 'Product') Model = Product;
        else if (target === 'Order') Model = Order;
        else if (target === 'Media') Model = Media;
        else return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });

        if (action === 'hard_delete') {
            // If media, actually wipe from cloudinary first
            if (target === 'Media') {
                const mediasToDelete = await Media.find({ _id: { $in: ids } });
                for (const m of mediasToDelete) {
                    await cloudinaryService.deleteFile(m.publicId, m.type).catch(() => null);
                }
            }
            await (Model as any).deleteMany({ _id: { $in: ids } });
            return NextResponse.json({ success: true, message: 'Permanently deleted' });
        }

        return NextResponse.json({ error: 'Invalid bin command' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Trash operations failed' }, { status: 500 });
    }
}
