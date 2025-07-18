import mongoose from "mongoose";
import { Products } from "../../models/products.js";
import { findBestPriceForProduct } from "../offers/bestOfferForProductService.js";

export const fetchFilteredProducts = async (filters) => {
  const query = { isBlocked: false, isDeleted: false };
  const sort = {};

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [{ productName: searchRegex }, { brand: searchRegex }];
  }

  if (filters.category && mongoose.Types.ObjectId.isValid(filters.category)) {
    query.category = { $in: [new mongoose.Types.ObjectId(filters.category)] };
  }

  if (filters.brand) {
    query.brand = filters.brand;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.salePrice = {};
    if (filters.minPrice) {
      query.salePrice.$gte = parseInt(filters.minPrice);
    }
    if (filters.maxPrice) {
      query.salePrice.$lte = parseInt(filters.maxPrice);
    }
  }

  if (filters.sort === "price-low") {
    sort.salePrice = 1;
  } else if (filters.sort === "price-high") {
    sort.salePrice = -1;
  } else if (filters.sort === "name-asc") {
    sort.productName = 1;
  } else if (filters.sort === "name-desc") {
    sort.productName = -1;
  } else if (filters.sort === "newest") {
    sort.createdAt = -1;
  } else {
    sort.createdAt = -1;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 9;
  const skip = (page - 1) * limit;

  const products = await Products.aggregate([
    { $match: query },
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
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
  ]);
  // products.offer = await findBestPriceForProduct
  for (let key in products) {
    products[key].offer = await findBestPriceForProduct(products[key]._id);
  }
  // console.log(products[0]);

  // console.log("Sort", sort);
  // console.log("Query", query);
  // console.log("limit", limit);
  // console.log("page", page);
  // console.log("skip", skip);
  // console.log("products", products);

  const totalCountResult = await Products.aggregate([
    { $match: query },
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
    { $count: "total" },
  ]);

  const totalProducts = totalCountResult[0]?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    currentPage: page,
    totalPages,
    totalProducts,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
