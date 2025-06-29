import { Wishlist } from "../../models/wishlist.js";
import { Products } from '../../models/products.js';
import {Cart} from '../../models/cart.js';

export const wishlistToggleService = async (userId, productId) => {
  const ifExisting = await Wishlist.findOne({ userId, productId });

  if (ifExisting) {
    await Wishlist.deleteOne({ userId, productId });
    return 'removed';
  }

  const existInCart = await Cart.findOne({
    userId,
    'items.productId': productId
  });

  if (existInCart) {
    return 'inCart';
  }

  await Wishlist.create({ userId, productId });
  return 'added';
};


// export const findWishlistByUserId = async (userId) => {
//   const productIds = await Wishlist.find({ userId }).distinct('productId');
//   console.log(productIds)
//   return productIds;
// }

export const findWishlistByUserId = async (userId) => {
    const wishlistProductIds = await Wishlist.find({ userId }).distinct('productId');

    // Fetch all the products the user has wishlisted
    const products = await Products.find({ _id: { $in: wishlistProductIds } }).populate({
        path: 'category',
        select: '_id isBlocked categoryName'
    });

    // Filter out the products that should not be shown
    const filteredProductIds = products
        .filter(product => {
            if (product.isBlocked || product.isDeleted) return false;
            if (!product.category || product.category.some(cat => cat.isBlocked)) return false;
            return true;
        })
        .map(product => product._id.toString());

    return filteredProductIds;
};

// export const countWishlistProductByUserId = async (userId) => {
//   return await Wishlist.countDocuments({ userId });
// }

export const countWishlistProductByUserId = async (userId) => {
    const wishlistProductIds = await Wishlist.find({ userId }).distinct('productId');

    const products = await Products.find({ _id: { $in: wishlistProductIds } })
        .populate({
            path: 'category',
            select: '_id isBlocked'
        });

    const visibleProductCount = products.filter(product => {
        if (product.isBlocked || product.isDeleted) return false;
        if (!product.category || product.category.some(cat => cat.isBlocked)) return false;
        return true;
    }).length;

    return visibleProductCount;
};

export const getWishlistProductsByUserId = async (userId) => {
    const wishlistProductIds = await Wishlist.find({ userId }).distinct('productId');

    const products = await Products.find({ _id: { $in: wishlistProductIds } })
        .populate({
            path: 'category',
            select: '_id isBlocked categoryName'
        });

    const visibleProducts = products.filter(product => {
        if (product.isBlocked || product.isDeleted) return false;
        if (!product.category || product.category.some(cat => cat.isBlocked)) return false;
        return true;
    });

    return visibleProducts;
};

