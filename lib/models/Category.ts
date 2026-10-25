import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    description: string;
    image: string;
    order: number;
    showInSearchOverlay: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
        order: { type: Number, default: 0 },
        showInSearchOverlay: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from name if not provided
CategorySchema.pre('validate', function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

const Category: Model<ICategory> =
    mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
