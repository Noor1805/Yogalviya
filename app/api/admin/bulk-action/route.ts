import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Media from '@/lib/models/Media';
import { getVerifiedAdminSession } from '@/lib/admin-session';

export async function POST(req: Request) {
    const session = await getVerifiedAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { ids, action, target } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No items selected' }, { status: 400 });
        }

        await dbConnect();
        
        let Model;
        if (target === 'Product') Model = Product;
        else if (target === 'Order') Model = Order;
        else if (target === 'Media') Model = Media;
        else return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });

        if (action === 'delete') {
            await Model.updateMany(
                { _id: { $in: ids } },
                { $set: { isDeleted: true, deletedAt: new Date() } }
            );
        } else if (action === 'restore') {
            await Model.updateMany(
                { _id: { $in: ids } },
                { $set: { isDeleted: false }, $unset: { deletedAt: "" } }
            );
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error: any) {
        console.error('Bulk action error:', error);
        return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
    }
}
