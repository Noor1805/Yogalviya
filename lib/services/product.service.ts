import dbConnect from '@/lib/db';
import Product, { type IProduct } from '@/lib/models/Product';

export class ProductService {
  /**
   * Get all products, optionally filtered by category.
   */
  static async getAll(filters?: { category?: string; featured?: boolean }): Promise<IProduct[]> {
    await dbConnect();
    const query: Record<string, unknown> = {};
    if (filters?.category) query.categorySlug = filters.category;
    if (filters?.featured !== undefined) query.featured = filters.featured;
    return Product.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get a single product by slug.
   */
  static async getBySlug(slug: string): Promise<IProduct | null> {
    await dbConnect();
    return Product.findOne({ slug }).lean();
  }

  /**
   * Get a single product by ID.
   */
  static async getById(id: string): Promise<IProduct | null> {
    await dbConnect();
    return Product.findById(id).lean();
  }

  /**
   * ATOMIC inventory decrement.
   * Uses MongoDB $inc with a condition check to prevent overselling.
   * Returns true if stock was successfully decremented, false if insufficient stock.
   */
  static async decrementStock(productId: string, sku: string, quantity: number): Promise<boolean> {
    await dbConnect();

    const product = await Product.findById(productId).select('productType sku stockCount variations');
    if (!product) {
      return false;
    }

    let result;
    if (product.productType === 'variable') {
      result = await Product.updateOne(
        {
          _id: productId,
          variations: {
            $elemMatch: {
              sku,
              stockCount: { $gte: quantity },
            },
          },
        },
        {
          $inc: { 'variations.$.stockCount': -quantity },
        }
      );
    } else {
      result = await Product.updateOne(
        {
          _id: productId,
          sku,
          stockCount: { $gte: quantity },
        },
        {
          $inc: { stockCount: -quantity },
        }
      );
    }

    if (result.modifiedCount !== 1) {
      return false;
    }

    const latest = await Product.findById(productId).select('productType stockCount variations');
    if (latest) {
      const hasStock =
        latest.productType === 'variable'
          ? (latest.variations || []).some((variation) => variation.stockCount > 0)
          : latest.stockCount > 0;

      if (latest.inStock !== hasStock) {
        latest.inStock = hasStock;
        await latest.save();
      }
    }

    return true;
  }

  /**
   * Restore inventory on cancellation/refund (atomic increment).
   */
  static async incrementStock(productId: string, sku: string, quantity: number): Promise<void> {
    await dbConnect();

    const product = await Product.findById(productId).select('productType');
    if (!product) {
      return;
    }

    if (product.productType === 'variable') {
      await Product.updateOne(
        { _id: productId, 'variations.sku': sku },
        { $inc: { 'variations.$.stockCount': quantity }, $set: { inStock: true } }
      );
      return;
    }

    await Product.updateOne(
      { _id: productId, sku },
      { $inc: { stockCount: quantity }, $set: { inStock: true } }
    );
  }
}
