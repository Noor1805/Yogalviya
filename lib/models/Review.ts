import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewPhoto {
    publicId?: string;
    url: string;
    thumbnailUrl?: string;
}

export interface IReview extends Document {
    productId: string;
    productSlug: string;
    productName: string;
    customerId?: string;
    customerName: string;
    customerEmail: string;
    orderId: string;
    orderNumber: string;
    rating: number;
    title?: string;
    comment: string;
    photos: IReviewPhoto[];
    verifiedPurchase: boolean;
    status: 'published' | 'hidden';
    createdAt: Date;
    updatedAt: Date;
}

const ReviewPhotoSchema = new Schema<IReviewPhoto>(
    {
        publicId: { type: String },
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
    },
    { _id: false }
);

const ReviewSchema = new Schema<IReview>(
    {
        productId: { type: String, required: true, index: true },
        productSlug: { type: String, required: true, trim: true },
        productName: { type: String, required: true, trim: true },
        customerId: { type: String },
        customerName: { type: String, required: true, trim: true },
        customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
        orderId: { type: String, required: true },
        orderNumber: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, trim: true, default: '' },
        comment: { type: String, required: true, trim: true },
        photos: { type: [ReviewPhotoSchema], default: [] },
        verifiedPurchase: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ['published', 'hidden'],
            default: 'published',
            index: true,
        },
    },
    { timestamps: true }
);

ReviewSchema.index({ productId: 1, customerEmail: 1 }, { unique: true });

const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
