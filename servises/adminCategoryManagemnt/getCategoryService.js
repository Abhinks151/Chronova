import { Category } from "../../models/category.js";
import { Products } from "../../models/products.js";


export const getCategoryService = async () => {
  const categoriesWithCount = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
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
    }
  ]);

  // Get all products
  const products = await Products.find().lean();

  return { categoriesWithCount, products };
};
