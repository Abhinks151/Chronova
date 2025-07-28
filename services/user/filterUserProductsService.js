import mongoose from "mongoose";
import { Products } from "../../models/products.js";
import { findBestPriceForProduct } from "../offers/bestOfferForProductService.js";

export const fetchFilteredProducts = async (filters) => {
  const query = { isBlocked: false, isDeleted: false };

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

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 9;

  const rawProducts = await Products.aggregate([
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
  ]);

  const productsWithPrice = await Promise.all(
    rawProducts.map(async (product) => {
      const offer = await findBestPriceForProduct(product._id);

      return {
        ...product,
        offer
      };
    })
  );

  let filtered = productsWithPrice;
  if (filters.minPrice || filters.maxPrice) {
    const min = parseInt(filters.minPrice) || 0;
    const max = parseInt(filters.maxPrice) || Infinity;

    filtered = filtered.filter((product) => {
      return product.offer.offerPrice >= min && product.offer.offerPrice <= max
    });
  }

  // console.log(filtered);

  const sort = filters.sort;
  if (sort === "price-low") {
    filtered.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (sort === "price-high") {
    filtered.sort((a, b) => b.finalPrice - a.finalPrice);
  } else if (sort === "name-asc") {
    filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  } else if (sort === "name-desc") {
    filtered.sort((a, b) => b.productName.localeCompare(a.productName));
  } else if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalProducts = filtered.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    products: paginated,
    currentPage: page,
    totalPages,
    totalProducts,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
