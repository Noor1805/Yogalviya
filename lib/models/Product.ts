import mongoose, { Schema, Document, Model, SchemaDefinitionProperty, SchemaDefinitionType } from 'mongoose';

// ─── Interfaces ──────────────────────────────────────────────
export interface ISpecification {
    label: string;
    value: string;
}

export interface IAttributeOption {
    name: string;
    values: string[];
    colorValues?: Record<string, string>;
}

export interface IVariation {
    id: string;
    attributes: Record<string, string>;
    price: number;
    compareAtPrice?: number;
    sku: string;
    stockCount: number;
    image?: string;
    gallery?: string[];
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    productType: 'simple' | 'variable';
    category: string;
    categorySlug: string;
    description: string;
    shortDescription?: string;
    productDetails?: string;
    commitment?: string;
    additionalInfo?: Array<{ label: string; value: string }>;
    // Simple product fields
    price: number;
    compareAtPrice?: number;
    sku: string;
    stockCount: number;
    // Variable product fields
    attributes: IAttributeOption[];
    variations: IVariation[];
    // Common fields
    specifications: ISpecification[];
    mainImage: string;
    gallery: string[];
    status: 'draft' | 'published';
    featured: boolean;
    badge?: string;
    isMostCoveted: boolean;
    availableBadges?: string[];
    // Legacy compat
    heroImage?: string;
    images?: string[];
    inStock?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Sub-schemas ─────────────────────────────────────────────
const SpecificationSchema = new Schema<ISpecification>(
    {
        label: { type: String, required: true },
        value: { type: String, required: true },
    },
    { _id: false }
);

const AttributeOptionSchema = new Schema<IAttributeOption>(
    {
        name: { type: String, required: true },
        values: [{ type: String }],
        colorValues: { type: Map, of: String, default: {} },
    },
    { _id: false }
);

const VariationSchema = new Schema<IVariation>(
    {
        id: { type: String, required: true },
        attributes: { type: Schema.Types.Mixed, default: {} },
        price: { type: Number, required: true, default: 0 },
        compareAtPrice: { type: Number },
        sku: { type: String, required: true },
        stockCount: { type: Number, default: 0 },
        image: { type: String, default: '' },
        gallery: [{ type: String }],
    },
    { _id: false }
);

// ─── Main Product Schema ────────────────────────────────────
const productSchemaDefinition = {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    productType: {
        type: String,
        enum: ['simple', 'variable'],
        default: 'simple',
    },
    category: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    productDetails: { type: String, default: '' },
    commitment: { type: String, default: '' },
    additionalInfo: [{
        label: { type: String, required: true },
        value: { type: String, required: true }
    }],

    // Simple product pricing
    price: { type: Number, default: 0 },
    compareAtPrice: { type: Number },
    sku: { type: String, default: '' },
    stockCount: { type: Number, default: 0 },

    // Variable product
    attributes: [AttributeOptionSchema],
    variations: [VariationSchema],

    // Media
    mainImage: { type: String, default: '' },
    gallery: [{ type: String }],

    // Meta
    specifications: [SpecificationSchema],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },
    isMostCoveted: { type: Boolean, default: false },
    badge: { type: String, default: '' },
    availableBadges: [{ type: String }],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },

    // Legacy schema field
    heroImage: { type: String },
    images: [{ type: String }],
    inStock: { type: Boolean, default: true },
};

const ProductSchema = new Schema<IProduct>(productSchemaDefinition as unknown as SchemaDefinitionType<IProduct>, {
    timestamps: true,
});

// Auto-generate slug from name if not provided
ProductSchema.pre('validate', function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

// In development, delete the model from mongoose.models so it can be re-compiled with the latest schema.
// This is necessary because Next.js HMR will re-run this file, but mongoose.models.Product would persist.
if (process.env.NODE_ENV === 'development' && mongoose.models.Product) {
    delete mongoose.models.Product;
}

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
