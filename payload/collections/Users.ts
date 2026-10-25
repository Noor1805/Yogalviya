import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    description: 'Admin users who have access to the Payload dashboard',
  },
  auth: true, // This enables Payload authentication for this collection ONLY
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
      ],
      defaultValue: 'admin',
      required: true,
    },
  ],
};
