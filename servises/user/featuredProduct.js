import mongoose from 'mongoose';
import { Products } from '../../models/products.js';

export const getFeaturedProducts = async (productId) => {
  try {
    const product = await Products.findById(productId).lean();

    if (!product || product.isBlocked || product.isDeleted) {
      throw new Error('Product not found or unavailable');
    }

    const currentProductId = new mongoose.Types.ObjectId(productId);

    let featuredProducts = await Products.find({
      brand: product.brand,
      _id: { $ne: currentProductId },
      isBlocked: false,
      isDeleted: false
    })
      .sort({ averageRating: -1, salesCount: -1 })
      .limit(4)
      .lean();

    const existingIds = new Set(featuredProducts.map(p => p._id.toString()));
    existingIds.add(productId);

    if (featuredProducts.length < 4) {
      const categoryProducts = await Products.find({
        category: { $in: product.category },
        _id: { $nin: Array.from(existingIds).map(id => new mongoose.Types.ObjectId(id)) },
        isBlocked: false,
        isDeleted: false
      })
        .sort({ averageRating: -1, salesCount: -1 })
        .limit(4 - featuredProducts.length)
        .lean();

      featuredProducts.push(...categoryProducts);
      categoryProducts.forEach(p => existingIds.add(p._id.toString()));
    }

    if (featuredProducts.length < 4) {
      const fallbackProducts = await Products.find({
        _id: { $nin: Array.from(existingIds).map(id => new mongoose.Types.ObjectId(id)) },
        isBlocked: false,
        isDeleted: false
      })
        .sort({ averageRating: -1, salesCount: -1 })
        .limit(4 - featuredProducts.length)
        .lean();

      featuredProducts.push(...fallbackProducts);
    }

    return featuredProducts;

  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    throw error;
  }
};
