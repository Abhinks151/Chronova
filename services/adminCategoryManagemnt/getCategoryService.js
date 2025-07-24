import { Category } from "../../models/category.js";
import { Products } from "../../models/products.js";


export const getCategoryService = async () => {
  const categoriesWithCount = await Category.aggregate([
    {
      $match: {
        isDeleted: false
      }
    },
    {
      $lookup: {
        from: 'products',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$categoryId', '$category'] },
                  { $eq: ['$isDeleted', false] }
                ]
              }
            }
          }
        ],
        as: 'products'
      }
    },
    {
      $addFields: {
        productCount: { $size: '$products' }
      }
    },
    {
      $project: {
        products: 0
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ]);

  const products = await Products.find({ isDeleted: false }).lean();

  return { categoriesWithCount, products };
};

