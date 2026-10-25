import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
    email: string;
    passwordHash: string;
    name: string;
    role: 'admin';
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        name: { type: String, default: 'Admin' },
        role: { type: String, default: 'admin', enum: ['admin'] },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
        lastLogin: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

const Admin: Model<IAdmin> =
    mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
