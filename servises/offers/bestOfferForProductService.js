import { Products } from "../../models/products.js";
import { ProductOffer } from "../../models/productOffer.js";
import { CategoryOffer } from "../../models/categoryOffer.js";

export const findBestPriceForProduct = async (productId) => {
  if (!productId) {
    throw new Error(":Product Id is required");
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

  let totalOffers = [...productOffers];
  totalOffers = totalOffers.concat(categoryOffers);
  let bestOffer = totalOffers.reduce((acc, curr) => {
    if (curr.discountPercentage > acc.discountPercentage) {
      return curr;
    } else {
      return acc;
    }
  }, totalOffers[0]);

  let offerPrice = 0;
  if (totalOffers.length > 0 && bestOffer?.discountPercentage) {
    offerPrice = product.price * (1 - bestOffer.discountPercentage / 100);
    console.log("Actual Price: ", product.price);
    console.log("Offer Price: ", offerPrice);
    console.log("Discount used: ", bestOffer.discountPercentage);
    console.log();
  } else {
    offerPrice = product.salePrice; 
    console.log("Actual Price: ", product.price);
    console.log("Offer Price: ", offerPrice);
    console.log();
  }


};
