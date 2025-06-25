import {Wishlist} from "../../models/wishlist.js";

export const wishlistToggleService = async (userId, productId) => {
  const ifExisting = await Wishlist.findOne({ userId, productId });

  if (ifExisting) {
    await Wishlist.deleteOne({ userId, productId });
    return 'removed';
  } else {
    await Wishlist.create({ userId, productId });
    return 'added';
  }
};


export const findWishlistByUserId = async  (userId) => {
  return await Wishlist.find({ userId }).distinct('productId');
}




export const countWishlistProductByUserId = async (userId) => {
  return await Wishlist.countDocuments({ userId });
}