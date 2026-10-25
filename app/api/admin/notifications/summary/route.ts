import { NextResponse } from 'next/server';

import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Contact from '@/lib/models/Contact';
import Media from '@/lib/models/Media';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { buildAdminNotificationsSummary } from '@/lib/utils/admin-notifications';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getVerifiedAdminSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const [
      ordersNewCount,
      contactsNewCount,
      recycledProductsCount,
      recycledOrdersCount,
      recycledMediaCount,
    ] = await Promise.all([
      Order.countDocuments({
        orderStatus: 'placed',
        isDeleted: { $ne: true },
      }),
      Contact.countDocuments({ status: 'new' }),
      Product.countDocuments({ isDeleted: true }),
      Order.countDocuments({ isDeleted: true }),
      Media.countDocuments({ isDeleted: true }),
    ]);

    return NextResponse.json(
      buildAdminNotificationsSummary({
        ordersNewCount,
        contactsNewCount,
        recycledProductsCount,
        recycledOrdersCount,
        recycledMediaCount,
      }),
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('[Admin Notifications Summary]', error);
    return NextResponse.json(
      { error: 'Failed to load admin notifications summary' },
      { status: 500 }
    );
  }
}
