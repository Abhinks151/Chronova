import { Category } from "../../models/category.js";
import { Products } from "../../models/products.js";

export const getActiveProducts = async () => {
  return await Products.aggregate([
    {
      $match: {
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
      $match: {
        'categoryDetails.isBlocked': { $ne: true },
        'categoryDetails.isDeleted': { $ne: true }
      }
    }
  ]);
};

export const getActiveCategories = async () => {
  return await Category.find({ isBlocked: false, isDeleted: false }).lean();
};