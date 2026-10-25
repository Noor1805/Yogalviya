import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isMostCoveted',
      type: 'checkbox',
      label: 'Show in Search Overlay (Most Coveted)',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText', // Lexical editor is configured globally
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
    },
    {
      name: 'variants',
      type: 'array',
      label: 'Product Variants (SKUs, Sizes, Colors)',
      labels: {
        singular: 'Variant',
        plural: 'Variants',
      },
      fields: [
        {
          name: 'sku',
          type: 'text',
          required: true,
        },
        {
          name: 'color',
          type: 'text',
        },
        {
          name: 'size',
          type: 'text',
        },
        {
          name: 'stockCount', // CRITICAL: This is where atomic $inc will happen
          type: 'number',
          defaultValue: 0,
          required: true,
          admin: {
            description: 'Inventory count. Do not manually adjust if orders are processing.',
          },
        },
        {
          name: 'priceMultiplier',
          type: 'number',
          defaultValue: 1,
        },
      ],
    },
  ],
};
