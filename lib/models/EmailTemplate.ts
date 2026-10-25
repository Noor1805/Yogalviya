import mongoose, { Schema, Document } from 'mongoose';

export type EmailType = 
    | 'account_created'
    | 'password_reset'
    | 'password_changed'
    | 'order_received'
    | 'order_confirmed'
    | 'order_shipped'
    | 'order_delivered'
    | 'order_cancelled'
    | 'order_refunded'
    | 'return_requested'
    | 'replace_requested'
    | 'cancel_request_received'
    | 'cancel_request_approved'
    | 'cancel_request_rejected'
    | 'return_request_received'
    | 'return_request_approved'
    | 'return_request_rejected'
    | 'replacement_request_received'
    | 'replacement_request_approved'
    | 'replacement_request_rejected'
    | 'refund_processed'
    | 'contact_auto_reply'
    | 'contact_admin_notification';

export interface IEmailTemplate extends Document {
    type: EmailType;
    name: string;      // Human readable name (e.g. "Order Confirmation")
    subject: string;   // e.g. "Your Order {{orderNumber}} is Confirmed!"
    bodyHtml: string;  // HTML content with {{tags}}
    description: string; // What variables are available
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true,
            unique: true,
            enum: [
                'account_created', 'order_received', 'order_confirmed', 'order_shipped', 
                'order_delivered', 'order_cancelled', 'order_refunded', 
                'password_reset', 'password_changed',
                'return_requested', 'replace_requested',
                'cancel_request_received', 'cancel_request_approved',
                'cancel_request_rejected', 'refund_processed',
                'return_request_received', 'return_request_approved',
                'return_request_rejected', 'replacement_request_received',
                'replacement_request_approved', 'replacement_request_rejected',
                'contact_auto_reply', 'contact_admin_notification'
            ],
            index: true
        },
        name: { type: String, required: true },
        subject: { type: String, required: true },
        bodyHtml: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
