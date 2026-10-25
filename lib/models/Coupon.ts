import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses?: number | null;
    usedCount: number;
    maxUsesPerCustomer?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number | null;
    applicableCategories?: string[];
    applicableProducts?: string[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage',
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        maxUses: {
            type: Number,
            default: null,
            min: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxUsesPerCustomer: {
            type: Number,
            default: 1,
            min: 1,
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxDiscountAmount: {
            type: Number,
            default: null,
            min: 0,
        },
        applicableCategories: [{
            type: String,
            trim: true,
        }],
        applicableProducts: [{
            type: String,
            trim: true,
        }],
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Pre-save hook to auto-generate code if not provided
CouponSchema.pre('validate', function () {
    if (this.code && !this.isModified('code')) {
        this.code = this.code.toUpperCase();
    }
});

// Index for efficient querying
CouponSchema.index({ startDate: 1, endDate: 1 });
CouponSchema.index({ isActive: 1 });

const Coupon: Model<ICoupon> =
    mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
