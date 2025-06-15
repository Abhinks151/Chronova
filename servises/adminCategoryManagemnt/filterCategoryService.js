import mongoose from 'mongoose';
import { Category } from '../../models/category.js';
import { Products } from "../../models/products.js";

export const filterCategoriesService = async (queryParams) => {
  const {
    search = '',
    type,
    status,
    sort = 'date-desc',
    page = 1,
    limit = 5
  } = queryParams;

  const filter = {};
  // console.log(search)
  if (search) {
    filter.$or = [
      { categoryName: { $regex: search, $options: 'i' } }
    ];
  }

  if (type && type !== 'All') {
    filter.type = type;
  }

  if (status && status !== 'All') {
    if (status !== 'Blocked' && status !== 'Active') {
      throw new Error('Invalid status value');
    }
    filter.isBlocked = status === 'Blocked';
  }

  const sortQuery = {};
  if (sort === 'name-asc') {
    sortQuery.name = 1;
  } else if (sort === 'name-desc') {
    sortQuery.name = -1;
  } else if (sort === 'date-desc') {
    sortQuery.createdAt = -1;
  } else {
    sortQuery.createdAt = -1;
  }

  const totalCount = await Category.countDocuments(filter);
  filter.isDeleted = false;
  let categories = await Category.find(filter)
    .sort(sortQuery)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const categoryIds = categories.map(item => new mongoose.Types.ObjectId(item._id));

  const productCounts = await Products.aggregate([
    {
      $match: {
        isDeleted: false,
        category: { $elemMatch: { $in: categoryIds } }
      }
    },
    { $unwind: "$category" },
    {
      $match: {
        category: { $in: categoryIds }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = {};
  productCounts.forEach(pc => {
    countMap[pc._id.toString()] = pc.count;
  });

  categories = categories.map(cat => ({
    ...cat,
    productCount: countMap[cat._id.toString()] || 0
  }));

  if (sort === 'products-desc') {
    categories.sort((a, b) => b.productCount - a.productCount);
  }

  return {
    success: true,
    categories,
    totalCount,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalCount / limit)
  };
};
