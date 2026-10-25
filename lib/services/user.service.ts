import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

// Lightweight Customer model for the e-commerce side
// (Separate from Payload CMS admin users)
const CustomerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    phone: { type: String },
    stripeCustomerId: { type: String },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Customer =
  mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

export class UserService {
  /**
   * Find or create a customer profile by email.
   */
  static async findOrCreate(data: {
    email: string;
    name?: string;
    phone?: string;
  }) {
    await dbConnect();

    let customer = await Customer.findOne({ email: data.email });
    if (!customer) {
      customer = await Customer.create({
        email: data.email,
        name: data.name || '',
        phone: data.phone || '',
      });
    }
    return customer;
  }

  /**
   * Get customer by email.
   */
  static async getByEmail(email: string) {
    await dbConnect();
    return Customer.findOne({ email }).lean();
  }

  /**
   * Save a shipping address to the customer profile.
   */
  static async addAddress(
    email: string,
    address: {
      label?: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }
  ) {
    await dbConnect();
    return Customer.findOneAndUpdate(
      { email },
      { $push: { addresses: address } },
      { new: true }
    );
  }
}
