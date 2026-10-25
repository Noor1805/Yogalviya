import dbConnect from '@/lib/db';
import Attribute from '@/lib/models/Attribute';
import Category from '@/lib/models/Category';
import ProductEditor from '../ProductEditor';

export default async function NewProductPage() {
    await dbConnect();
    const [categories, attributes] = await Promise.all([
        Category.find().sort({ order: 1 }).lean(),
        Attribute.find({ isDeleted: { $ne: true }, isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    const categoryOptions = categories.map((c) => ({
        name: c.name,
        slug: c.slug,
    }));

    const globalAttributes = attributes.map((attribute) => ({
        id: String(attribute._id),
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        values: attribute.values || [],
        colorValues: attribute.colorValues || {},
        description: attribute.description || '',
    }));

    return <ProductEditor categories={categoryOptions} globalAttributes={globalAttributes} />;
}
