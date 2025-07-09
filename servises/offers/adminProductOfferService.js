import { ProductOffer } from "../../models/productOffer.js";
import { logger } from "../../config/logger.js";
import { Products } from '../../models/products.js';
import mongoose from "mongoose";

export const getActiveProductOffers = async ({ page = 1, limit = 10, sort = "createdAt_desc", search = "" }) => {
  const [sortField, sortOrder] = sort.split("_");
  const sortOptions = { [sortField]: sortOrder === "desc" ? -1 : 1 };
  const skip = (page - 1) * limit;

  const query = {
    isDeleted: false,
    ...(search && {
      name: { $regex: search, $options: "i" }
    })
  };

  const [offers, total] = await Promise.all([
    ProductOffer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    ProductOffer.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = page;

  return {
    data: offers,
    pagination: {
      total,
      limit,
      currentPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  };
};



export const addProductOfferService = async (offerData) => {
  const { name, discountPercentage, startDate, endDate, products } = offerData;

  if (!name || !discountPercentage || !startDate || !endDate || !Array.isArray(products) || products.length === 0) {
    logger.warn("Invalid product offer payload");
    throw new Error("All fields are required and at least one product must be selected");
  }

  if (discountPercentage <= 0 || discountPercentage > 100) {
    throw new Error("Discount percent must be between 1 and 100");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("Start date must be before end date");
  }

  const productCount = await Products.countDocuments({ _id: { $in: products } });
  if (productCount !== products.length) {
    throw new Error("One or more product IDs are invalid");
  }

  const offer = await ProductOffer.create({
    name,
    discountPercentage,
    startDate: start,
    endDate: end,
    products,
  });

  logger.info(`Product offer "${name}" created for ${products.length} products`);

  return offer;
};


export const editProductOfferService = async (offerId, data) => {
  const { name, discountPercentage, startDate, endDate, products } = data;

  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw new Error("Invalid offer ID");
  }

  if (!name || !discountPercentage || !startDate || !endDate || !Array.isArray(products) || products.length === 0) {
    logger.warn("Invalid product offer payload during edit");
    throw new Error("All fields are required and at least one product must be selected");
  }

  if (discountPercentage <= 0 || discountPercentage > 100) {
    throw new Error("Discount percent must be between 1 and 100");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("Start date must be before end date");
  }

  const productCount = await Products.countDocuments({ _id: { $in: products } });
  if (productCount !== products.length) {
    throw new Error("One or more product IDs are invalid");
  }

  const editedOffer = await ProductOffer.findByIdAndUpdate(
    offerId,
    {
      name,
      discountPercentage,
      startDate: start,
      endDate: end,
      products
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!editedOffer) {
    throw new Error("Product offer not found");
  }

  logger.info(`Product offer "${name}" updated for ${products.length} products`);
  return editedOffer;
};

export const getProductOfferByIdService = async (offerId) => {
  const offer = await ProductOffer.findById(offerId);
  if (!offer) {
    throw new Error("Product offer not found");
  }
  return offer;
};

export const toggleProductOfferStatusService = async (offerId) => {
  const offer = await ProductOffer.findById(offerId);
  if (!offer) {
    throw new Error("Product offer not found");
  }

  if (offer.isDeleted) {
    throw new Error("Product offer is deleted");
  }

  offer.isActive = !offer.isActive;
  await offer.save();

  logger.info(`Offer ${offerId} status toggled to ${offer.isActive ? "active" : "inactive"}`);

  return offer;
};


export const deleteProductOfferService = async (offerId) => {
  if (!offerId) {
    throw new Error("Product offer not found");
  }
  const offer = await ProductOffer.findById(offerId);
  offer.isDeleted = true;
  await offer.save();
  return offer;
}
