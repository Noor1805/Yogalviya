import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import { OrderService } from '@/lib/services/order.service';

/**
 * GET /api/admin/orders â€” List all orders with filters, search, pagination
 */
export async function GET(request: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const { orders, total } = await OrderService.getAll({ status, search, page, limit });

  return NextResponse.json({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
