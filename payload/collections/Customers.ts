import type { CollectionConfig } from 'payload';

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    description: 'Customers (read-only mirror of NextAuth users or linked profile data)',
  },
  access: {
    create: () => false, // Only created via NextAuth / frontend signup
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
};
