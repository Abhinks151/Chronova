import mongoose from "mongoose";
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
    const products = await Products.aggregate([
      { $match: {
        isBlocked: false,
        isDeleted: false,
        category:{$in:[new mongoose.Types.ObjectId(categoryId)]}
      } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $addFields: {
          validCategories: {
            $filter: {
              input: "$categoryDetails",
              as: "cat",
              cond: {
                $and: [
                  { $eq: ["$$cat.isBlocked", false] },
                  { $eq: ["$$cat.isDeleted", false] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $eq: [{ $size: "$category" }, { $size: "$validCategories" }],
          },
        },
      },
    ]);

    return products;
  } catch (error) {
    console.error(error);
    return [];
  }
};



export const getActiveCategories = async () => {
  return await Category.find({ isBlocked: false, isDeleted: false }).lean();
};
