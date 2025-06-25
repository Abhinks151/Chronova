import { countWishlistProductByUserId, wishlistToggleService } from '../../servises/user/wishlistServices.js';
import httpStatusCode from '../../utils/httpStatusCode.js';

export const toggleWishlistController = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const productId = req.body.productId;

  try {
    if (!userId || !productId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Invalid request"
      })
    }

    const data = await wishlistToggleService(userId, productId);
    if (!data) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Failed to update wishlist"
      })
    }

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: data === 'added' ? 'Product added to wishlist!' : 'Product removed from wishlist!',
      action: data
    });
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
}


export const getWishlistCount = async (req, res) => {
  const wishlistCount = await countWishlistProductByUserId(req.user.id);
  res.status(httpStatusCode.OK.code).json({
    wishlistCount
  });
} 
