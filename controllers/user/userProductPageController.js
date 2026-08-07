import { fetchFilteredProducts } from "../../services/user/filterUserProductsService.js";
import { getActiveCategories, getActiveProducts } from "../../services/user/getUserProductService.js";
import {  findWishlistByUserId } from "../../services/user/wishlistService.js";
import HttpStatusCode from "../../utils/httpStatusCode.js";
import { logger } from '../../config/logger.js';



export const getProductListingPage = async (req, res) => {
  try {
    const products = await getActiveProducts();
    const categories = await getActiveCategories();
    // logger.info(products);

    let wishedProductIds = await findWishlistByUserId(req.user.id);
    
    res.status(HttpStatusCode.OK.code).render('Layouts/users/productListing', {
      title: 'Chronova',
      products,
      categories,
      wishedProductIds: JSON.stringify(wishedProductIds.map(id => id.toString()))
    });
  } catch (error) {
    logger.error('Error rendering product listing:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR.code).send('Server Error');
  }
};

export const getFilteredProducts = async (req, res) => {
  try {
    const result = await fetchFilteredProducts(req.query);
    // logger.info(result)
    
    res.status(HttpStatusCode.OK.code).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

