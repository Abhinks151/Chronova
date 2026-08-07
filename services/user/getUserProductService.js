import { Category } from "../../models/category.js";
import { Products } from "../../models/products.js";
import { logger } from '../../config/logger.js';

export const getActiveProducts = async () => {
  const products = await Products.aggregate([
    {
      $match: {
        isBlocked: false,
        isDeleted: false
      }
    },
    {
      $unwind: "$category"
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    {
      $unwind: "$categoryDetails"
    },
    {
      $match: {
        "categoryDetails.isBlocked": false,
        "categoryDetails.isDeleted": false
      }
    },
    {
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" }
      }
    },
    {
      $replaceRoot: { newRoot: "$doc" }
    }
  ]);

  return products;
};


export const getProductByCategoryId = async (categoryId) => {
  try {
    const products = await Products.find({
      isDeleted: false,
      isBlocked: false,
      category: { $in: [categoryId] }
    }).lean();

    return products;
  } catch (error) {
    logger.error(error);
    return [];
  }
};



export const getActiveCategories = async () => {
  return await Category.find({ isBlocked: false, isDeleted: false }).lean();
};
