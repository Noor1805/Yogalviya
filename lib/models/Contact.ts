import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['new', 'read', 'replied', 'archived'],
            default: 'new',
        },
    },
    { timestamps: true }
);

// Index for faster queries
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

// In development, delete the model from mongoose.models so it can be re-compiled
if (process.env.NODE_ENV === 'development' && mongoose.models.Contact) {
    delete mongoose.models.Contact;
}

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema);

export default Contact;
