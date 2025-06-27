import { countWishlistProductByUserId, getWishlistProductsByUserId, wishlistToggleService } from '../../servises/user/wishlistServices.js';
import httpStatusCode from '../../utils/httpStatusCode.js';


export const getWishlistController = async (req, res) => {
  const userId = req.user.id || req.user._id;

  try {
    const wishlistProducts = await getWishlistProductsByUserId(userId);
    if (!wishlistProducts || wishlistProducts.length === 0) {
      return res.status(httpStatusCode.NOT_FOUND.code).json({
        success: false,
        message: "No products found in wishlist"
      });
    }

    res.status(httpStatusCode.OK.code).render('Layouts/users/wishlist', {
      wishlistProducts
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
    
  }
}

export const getWishlistData = async (req, res) => {
  const userId = req.user.id || req.user._id;
  try {
    const wishlistProducts = await getWishlistProductsByUserId(userId);
    res.status(httpStatusCode.OK.code).json({
      success: true,
      products: wishlistProducts
    });
  } catch (error) {
    console.error('Error fetching wishlist data API:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Unable to fetch wishlist data."
    });
  }
};

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


