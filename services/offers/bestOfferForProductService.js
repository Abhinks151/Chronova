import { Products } from "../../models/products.js";
import { ProductOffer } from "../../models/productOffer.js";
import { CategoryOffer } from "../../models/categoryOffer.js";

export const findBestPriceForProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const product = await Products.findById(productId).select(
    "price salePrice category"
  );

  if (!product) {
    throw new Error("Product not found");
  }

  const now = new Date();

  const [productOffers, categoryOffers] = await Promise.all([
    ProductOffer.find({
      products: productId,
      isActive: true,
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }),
    CategoryOffer.find({
      categories: { $in: product.category },
      isActive: true,
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }),
  ]);

  const totalOffers = [...productOffers, ...categoryOffers];

  let bestOffer = null;

  for (const offer of totalOffers) {
    if (
      !bestOffer ||
      offer.discountPercentage > bestOffer.discountPercentage
    ) {
      bestOffer = offer;
    }
  }

  let offerPrice;
  let discount;

  if (bestOffer?.discountPercentage) {
    discount = bestOffer.discountPercentage;
    offerPrice = Math.round(product.price * (1 - discount / 100));
  } else if (product.salePrice && product.salePrice < product.price) {
    offerPrice = product.salePrice;
    discount = Math.round(
      ((product.price - product.salePrice) / product.price) * 100
    );
  } else {
    offerPrice = product.price;
    discount = 0;
  }


  // console.log("Best offer price:", offerPrice); 
  return { offerPrice, discount };
};
