import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SearchSettings from '@/lib/models/SearchSettings';
import { getVerifiedAdminSession } from '@/lib/admin-session';

// GET - Fetch search overlay settings
export async function GET() {
    try {
        await dbConnect();

        let settings = await SearchSettings.findOne();

        // If no settings exist, create default
        if (!settings) {
            settings = await SearchSettings.create({
                categories: [],
                trendingSearches: [],
                featuredProductIds: [],
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching search settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PATCH - Update search overlay settings
export async function PATCH(request: NextRequest) {
    try {
        const session = await getVerifiedAdminSession();
        if (!session || (session.user as { role?: string })?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        let settings = await SearchSettings.findOne();

        if (!settings) {
            settings = await SearchSettings.create(body);
        } else {
            settings = await SearchSettings.findOneAndUpdate({}, body, { new: true });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating search settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
