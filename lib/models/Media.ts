import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
    publicId: string;
    url: string;
    thumbnailUrl: string;
    type: 'image' | 'video';
    folder: string; // e.g., "products/louis-vuitton-bag"
    filename: string;
    bytes: number;
    width: number;
    height: number;
    isDeleted?: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema: Schema = new Schema(
    {
        publicId: { type: String, required: true, unique: true },
        url: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        folder: { type: String, default: 'general', index: true },
        filename: { type: String, required: true },
        bytes: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
