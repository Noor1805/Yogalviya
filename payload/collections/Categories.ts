import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        allowCreate: true,
      },
      maxDepth: 1,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'showInSearchOverlay',
      type: 'checkbox',
      label: 'Show in Search Overlay',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
