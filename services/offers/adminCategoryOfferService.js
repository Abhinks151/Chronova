import mongoose from 'mongoose';
import { CategoryOffer } from '../../models/categoryOffer.js';
import { Category } from '../../models/category.js';
import {logger} from '../../config/logger.js';

export const getActiveCategoryOffers = async ({ page = 1, limit = 10, sort = "createdAt_desc", search = "", status = "", discount = "" }) => {
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (status === "active") {
    query.isActive = true;
  } else if (status === "inactive") {
    query.isActive = false;
  }

  if (discount && /^\d{1,3}-\d{1,3}$/.test(discount)) {
    const [min, max] = discount.split("-").map(Number);
    query.discountPercentage = { $gte: min, $lte: max };
  }

  const [field, order] = sort.split("_");
  const sortOptions = { [field || "createdAt"]: order === "asc" ? 1 : -1 };

  const [offers, total] = await Promise.all([
    CategoryOffer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('categories', 'categoryName description type')
      .lean(),
    CategoryOffer.countDocuments(query)
  ]);

  return {
    data: offers,
    pagination: {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

export const addCategoryOfferService = async (offerData) => {
  const { name, discountPercentage, startDate, endDate, categories } = offerData;

  if (!name || !discountPercentage || !startDate || !endDate || !Array.isArray(categories) || categories.length === 0) {
    logger.warn("Invalid category offer payload");
    throw new Error("All fields are required and at least one category must be selected");
  }

  const isExist = await CategoryOffer.findOne({ name });
  if (isExist) {
    throw new Error("Category offer already exists");
  }

  if (discountPercentage <= 0 || discountPercentage > 100) {
    throw new Error("Discount percent must be between 1 and 100");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("Start date must be before end date");
  }

  const categoryCount = await Category.countDocuments({ _id: { $in: categories }, isDeleted: false });
  if (categoryCount !== categories.length) {
    throw new Error("One or more category IDs are invalid or deleted");
  }

  const offer = await CategoryOffer.create({
    name,
    discountPercentage,
    startDate: start,
    endDate: end,
    categories,
  });

  logger.info(`Category offer "${name}" created for ${categories.length} categories`);

  return offer;
};

export const editCategoryOfferService = async (offerId, data) => {
  const { name, discountPercentage, startDate, endDate, categories } = data;

  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw new Error("Invalid offer ID");
  }

  if (!name || !discountPercentage || !startDate || !endDate || !Array.isArray(categories) || categories.length === 0) {
    logger.warn("Invalid category offer payload during edit");
    throw new Error("All fields are required and at least one category must be selected");
  }

  // Check if another offer with the same name exists (excluding current offer)
  const isExist = await CategoryOffer.findOne({ name, _id: { $ne: offerId } });
  if (isExist) {
    throw new Error("Category offer name already exists");
  }

  if (discountPercentage <= 0 || discountPercentage > 100) {
    throw new Error("Discount percent must be between 1 and 100");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("Start date must be before end date");
  }

  const categoryCount = await Category.countDocuments({ _id: { $in: categories }, isDeleted: false });
  if (categoryCount !== categories.length) {
    throw new Error("One or more category IDs are invalid or deleted");
  }

  const editedOffer = await CategoryOffer.findByIdAndUpdate(
    offerId,
    {
      name,
      discountPercentage,
      startDate: start,
      endDate: end,
      categories
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!editedOffer) {
    throw new Error("Category offer not found");
  }

  logger.info(`Category offer "${name}" updated for ${categories.length} categories`);
  return editedOffer;
};

export const getCategoryOfferByIdService = async (offerId) => {
  const offer = await CategoryOffer.findById(offerId).populate('categories', 'categoryName description type');
  if (!offer) {
    throw new Error("Category offer not found");
  }
  return offer;
};

export const toggleCategoryOfferStatusService = async (offerId) => {
  const offer = await CategoryOffer.findById(offerId);
  if (!offer) {
    throw new Error("Category offer not found");
  }

  if (offer.isDeleted) {
    throw new Error("Category offer is deleted");
  }

  offer.isActive = !offer.isActive;
  await offer.save();

  logger.info(`Category offer ${offerId} status toggled to ${offer.isActive ? "active" : "inactive"}`);

  return offer;
};

export const deleteCategoryOfferService = async (offerId) => {
  if (!offerId) {
    throw new Error("Category offer not found");
  }
  const offer = await CategoryOffer.findById(offerId);
  if (!offer) {
    throw new Error("Category offer not found");
  }
  offer.isDeleted = true;
  await offer.save();
  return offer;
};

