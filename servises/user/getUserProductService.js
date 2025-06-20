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
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    {
      $match: {
        "categoryDetails.isBlocked": { $ne: true },
        "categoryDetails.isDeleted": { $ne: true }
      }
    }
  ]);
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
    console.error(error);
  }
};

export const getActiveCategories = async () => {
  return await Category.find({ isBlocked: false, isDeleted: false }).lean();
};
