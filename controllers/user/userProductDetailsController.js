import { getFeaturedProducts } from "../../servises/user/featuredProduct.js";
import { getProductDetails } from "../../servises/user/productDetailsService.js";
import { findWishlistByUserId } from "../../servises/user/wishlistServices.js";
import httpStatusCode from '../../utils/httpStatusCode.js';

export const productDetails = async (req, res) => {
    try {
        const result = await getProductDetails(req.params.id);
        const userId = req.user ? req.user.id : null;
        let isInWishlist = false;

        if (userId) {
            const productIdsInWishlist = await findWishlistByUserId(userId);
            isInWishlist = productIdsInWishlist.some(
                id => id.toString() === req.params.id.toString()
            );
        }

        if (!result.success) {
            return res.status(httpStatusCode.NOT_FOUND.code).redirect('/user/products');
        }

        res.status(httpStatusCode.OK.code).render('Layouts/users/ProductDetails', {
            product: result.data,
            isInWishlist
        });
    } catch (error) {
        console.error('Error in productDetails:', error.message);
        req.flash('error', 'Unexpected error occurred while loading product.');
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).redirect('/user/products');
    }
};

export const featuredProducts = async (req, res) => {
    try {
        const featuredProducts = await getFeaturedProducts(req.params.id);
        const userId = req.user ? req.user.id : null;

        let wishlistProductIds = [];

        if (userId) {
            wishlistProductIds = await findWishlistByUserId(userId);
            wishlistProductIds = wishlistProductIds.map(id => id.toString());
        }

        const updatedProducts = featuredProducts.map(product => {
            return {
                ...product, 
                isInWishlist: wishlistProductIds.includes(product._id.toString())
            };
        });

        res.status(httpStatusCode.OK.code).json({
            featuredProducts: updatedProducts
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
            message: 'Failed to fetch featured products',
            error: error.message || 'Something went wrong'
        });
    }
};

