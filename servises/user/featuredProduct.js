import mongoose from 'mongoose';
import { Products } from '../../models/products.js';

export const getFeaturedProducts = async (productId) => {
  try {
    const product = await Products.findById(productId).lean();

    if (!product || product.isBlocked || product.isDeleted) {
      throw new Error('Product not found or unavailable');
    }

    const excludedIds = new Set([productId]);

    const objectId = (id) => new mongoose.Types.ObjectId(id);

    let featuredProducts = await Products.aggregate([
      {
        $match: {
          brand: product.brand,
          _id: { $ne: objectId(productId) },
          isBlocked: false,
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $addFields: {
          validCategories: {
            $filter: {
              input: '$categoryDetails',
              as: 'cat',
              cond: {
                $and: [
                  { $eq: ['$$cat.isBlocked', false] },
                  { $eq: ['$$cat.isDeleted', false] }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          $expr: {
            $eq: [{ $size: '$category' }, { $size: '$validCategories' }]
          }
        }
      },
      { $sort: { averageRating: -1, salesCount: -1 } },
      { $limit: 4 }
    ]);

    featuredProducts.forEach(p => excludedIds.add(p._id.toString()));

    if (featuredProducts.length < 4) {
      const remaining = 4 - featuredProducts.length;
      const categoryProducts = await Products.aggregate([
        {
          $match: {
            category: { $in: product.category },
            _id: { $nin: Array.from(excludedIds).map(objectId) },
            isBlocked: false,
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        },
        {
          $addFields: {
            validCategories: {
              $filter: {
                input: '$categoryDetails',
                as: 'cat',
                cond: {
                  $and: [
                    { $eq: ['$$cat.isBlocked', false] },
                    { $eq: ['$$cat.isDeleted', false] }
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            $expr: {
              $eq: [{ $size: '$category' }, { $size: '$validCategories' }]
            }
          }
        },
        { $sort: { averageRating: -1, salesCount: -1 } },
        { $limit: remaining }
      ]);

      featuredProducts.push(...categoryProducts);
      categoryProducts.forEach(p => excludedIds.add(p._id.toString()));
    }

    if (featuredProducts.length < 4) {
      const remaining = 4 - featuredProducts.length;
      const fallbackProducts = await Products.aggregate([
        {
          $match: {
            _id: { $nin: Array.from(excludedIds).map(objectId) },
            isBlocked: false,
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        },
        {
          $addFields: {
            validCategories: {
              $filter: {
                input: '$categoryDetails',
                as: 'cat',
                cond: {
                  $and: [
                    { $eq: ['$$cat.isBlocked', false] },
                    { $eq: ['$$cat.isDeleted', false] }
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            $expr: {
              $eq: [{ $size: '$category' }, { $size: '$validCategories' }]
            }
          }
        },
        { $sort: { averageRating: -1, salesCount: -1 } },
        { $limit: remaining }
      ]);

      featuredProducts.push(...fallbackProducts);
    }

    return featuredProducts;

  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    throw error;
  }
};
