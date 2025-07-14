import { Products } from "../../models/products.js";
import { ProductOffer } from "../../models/productOffer.js";
import { CategoryOffer } from "../../models/categoryOffer.js";

export const findBestPriceForProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product Id is required");
  }

  const product = await Products.findById(productId).select(
    "price salePrice category"
  );

  if (!product) {
    throw new Error("Product not found");
  }

  const productOffers = await ProductOffer.find({
    products: productId,
    isActive: true,
    isDeleted: false,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  const categoryOffers = await CategoryOffer.find({
    categories: { $in: product.category },
    isActive: true,
    isDeleted: false,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  const totalOffers = [...productOffers, ...categoryOffers];

  let bestOffer = totalOffers[0];

  for (const offer of totalOffers) {
    if (offer.discountPercentage > bestOffer.discountPercentage) {
      bestOffer = offer;
    }
  }

  let offerPrice;
  let discount;

  if (totalOffers.length > 0 && bestOffer?.discountPercentage) {
    offerPrice = Math.round(
      product.price * (1 - bestOffer.discountPercentage / 100)
    );
    discount = bestOffer.discountPercentage;
  } else {
    offerPrice = product.salePrice;
    discount = Math.round(
      ((product.price - product.salePrice) / product.price) * 100
    );
  }

  return { offerPrice, discount };
};
