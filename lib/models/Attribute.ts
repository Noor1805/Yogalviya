import mongoose, { Schema, Document, Model, SchemaDefinitionProperty, SchemaDefinitionType } from 'mongoose';

export interface IAttribute extends Document {
    name: string;
    slug: string;
    type: 'color' | 'size' | 'text' | 'select';
    values: string[];
    colorValues?: Record<string, string>; // Store hex codes for color values
    description?: string;
    order: number;
    isActive: boolean;
    isDeleted?: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const attributeSchemaDefinition = {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
        type: String,
        enum: ['color', 'size', 'text', 'select'],
        default: 'text',
    },
    values: [{ type: String }],
    colorValues: { type: Object, default: {} },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
};

const AttributeSchema = new Schema<IAttribute>(attributeSchemaDefinition as unknown as SchemaDefinitionType<IAttribute>, {
    timestamps: true,
});

// Auto-generate slug from name if not provided
AttributeSchema.pre('validate', function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

// In development, delete the model from mongoose.models so it can be re-compiled with the latest schema.
if (process.env.NODE_ENV === 'development' && mongoose.models.Attribute) {
    delete mongoose.models.Attribute;
}

const Attribute: Model<IAttribute> = mongoose.models.Attribute || mongoose.model<IAttribute>('Attribute', AttributeSchema);

export default Attribute;
