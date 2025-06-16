import mongoose from 'mongoose';
import { Products } from '../../models/products.js';

export const fetchFilteredProducts = async (filters) => {
  const query = { isBlocked: false };
  const sort = {};

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [
      { productName: searchRegex },
      { brand: searchRegex }
    ];
  }

  //mongoose
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

  if (filters.sort === 'price-low') {
    sort.salePrice = 1;
  } else if (filters.sort === 'price-high') {
    sort.salePrice = -1;
  } else if (filters.sort === 'name-asc') {
    sort.productName = 1;
  } else if (filters.sort === 'name-desc') {
    sort.productName = -1;
  } else if (filters.sort === 'newest') {
    sort.createdAt = -1;
  } else {
    sort.createdAt = -1;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 9;
  const skip = (page - 1) * limit;

  const [products, totalProducts] = await Promise.all([
    Products.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Products.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    currentPage: page,
    totalPages,
    totalProducts,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};