import dbConnect from '@/lib/db';
import Attribute from '@/lib/models/Attribute';
import AttributesManagementClient from './AttributesManagementClient';

export default async function AttributesPage() {
    await dbConnect();

    const initialAttributes = await Attribute.find({ isDeleted: { $ne: true } })
        .sort({ order: 1, createdAt: -1 })
        .lean();

    return <AttributesManagementClient initialAttributes={JSON.parse(JSON.stringify(initialAttributes))} />;
}
