import { z } from 'zod';

export const attributeSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    slug: z.string().optional(),
    type: z.enum(['color', 'size', 'text', 'select']).default('text'),
    values: z.array(z.string().min(1, 'Value cannot be empty')).min(1, 'At least one value is required'),
    colorValues: z.record(z.string(), z.string()).optional(), // Hex codes for color values
    description: z.string().optional(),
    order: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
});

export const attributeUpdateSchema = attributeSchema.partial();
