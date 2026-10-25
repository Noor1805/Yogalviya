import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnquiry extends Document {
    name: string;
    company: string;
    email: string;
    country: string;
    phone?: string;
    quantity: number;
    product: string;
    targetCountry?: string;
    message?: string;
    type: 'enquiry' | 'contact' | 'callback';
    brandingType?: 'Plain' | 'Almina Couture Branded' | 'Custom Branding';
    createdAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
    {
        name: { type: String, required: true },
        company: { type: String, default: '' },
        email: { type: String, required: true },
        country: { type: String, default: '' },
        phone: { type: String, default: '' },
        quantity: { type: Number, default: 0 },
        product: { type: String, default: '' },
        targetCountry: { type: String, default: '' },
        message: { type: String, default: '' },
        type: { type: String, enum: ['enquiry', 'contact', 'callback'], default: 'enquiry' },
        brandingType: {
            type: String,
            enum: ['Plain', 'Almina Couture Branded', 'Custom Branding', 'White Label'],
            required: false
        }
    },
    {
        timestamps: true,
    }
);

const Enquiry: Model<IEnquiry> =
    mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;
