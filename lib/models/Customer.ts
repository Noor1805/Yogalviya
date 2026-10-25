import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
    _id?: string;
    label?: string;
    type: 'billing' | 'shipping';
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export interface ISavedPaymentMethod {
    id: string;
    provider: 'stripe' | 'razorpay' | 'manual';
    brand: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    holderName: string;
    isDefault: boolean;
}

export interface ICustomer extends Document {
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    addresses: IAddress[];
    wishlist: string[]; // array of product IDs
    savedPaymentMethods: ISavedPaymentMethod[];
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
    label: { type: String, default: 'Home' },
    type: { type: String, enum: ['billing', 'shipping'], required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const SavedPaymentMethodSchema = new Schema<ISavedPaymentMethod>(
    {
        id: { type: String, required: true },
        provider: { type: String, enum: ['stripe', 'razorpay', 'manual'], default: 'manual' },
        brand: { type: String, required: true },
        last4: { type: String, required: true },
        expiryMonth: { type: String, required: true },
        expiryYear: { type: String, required: true },
        holderName: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        addresses: { type: [AddressSchema], default: [] },
        wishlist: { type: [String], default: [] },
        savedPaymentMethods: { type: [SavedPaymentMethodSchema], default: [] },
        lastLogin: { type: Date }
    },
    { timestamps: true }
);

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
