import { NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/admin-session';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';

export async function GET() {
    const session = await getVerifiedAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // 1. Revenue & Orders
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const matchPaid = { status: { $in: ['paid', 'processing', 'shipped', 'delivered', 'completed'] } };

    const revenueStats = await Order.aggregate([
        { $match: matchPaid },
        { 
            $group: { 
                _id: null, 
                totalRevenue: { $sum: '$totalInCents' },
                totalOrders: { $sum: 1 },
                avgOrderValue: { $avg: '$totalInCents' }
            } 
        }
    ]);

    const thisMonth = await Order.aggregate([
        { $match: { ...matchPaid, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, revenue: { $sum: '$totalInCents' }, orders: { $sum: 1 } } }
    ]);
    
    const lastMonth = await Order.aggregate([
        { $match: { ...matchPaid, createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
        { $group: { _id: null, revenue: { $sum: '$totalInCents' }, orders: { $sum: 1 } } }
    ]);

    // 2. Inventory Health
    const products = await Product.find({}, 'stockCount status').lean();
    const totalStock = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
    const lowStock = products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 10).length;
    const outOfStock = products.filter(p => (p.stockCount || 0) === 0).length;

    // 3. Last 6 months revenue for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyData = await Order.aggregate([
        { $match: { ...matchPaid, createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                revenue: { $sum: "$totalInCents" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formatData = {
        totalRevenue: Math.round((revenueStats[0]?.totalRevenue || 0) / 100),
        totalOrders: revenueStats[0]?.totalOrders || 0,
        avgOrderValue: Math.round((revenueStats[0]?.avgOrderValue || 0) / 100),
        
        thisMonthRevenue: Math.round((thisMonth[0]?.revenue || 0) / 100),
        lastMonthRevenue: Math.round((lastMonth[0]?.revenue || 0) / 100),
        
        inventory: {
            totalItems: totalStock,
            lowStockWarnings: lowStock,
            outOfStock: outOfStock,
            activeProducts: products.filter(p => p.status === 'published').length
        },
        
        chartData: monthlyData.map(d => ({
            month: new Date(d._id.year, d._id.month - 1, 1).toLocaleString('default', { month: 'short' }),
            revenue: Math.round(d.revenue / 100)
        }))
    };

    // Pad chart data if empty
    if (formatData.chartData.length === 0) {
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            formatData.chartData.push({ month: d.toLocaleString('default', { month: 'short' }), revenue: 0 });
        }
    }

    return NextResponse.json(formatData);
}
