import { fetchFilteredProducts } from "../../servises/user/filterUserProductsService.js";
import { getActiveCategories, getActiveProducts } from "../../servises/user/getUserProductService.js";
import {  findWishlistByUserId } from "../../servises/user/wishlistServices.js";
import HttpStatusCode from "../../utils/httpStatusCode.js";



export const getProductListingPage = async (req, res) => {
  try {
    const products = await getActiveProducts();
    const categories = await getActiveCategories();
    // console.log(products);

    let wishedProductIds = await findWishlistByUserId(req.user.id);
    
    res.status(HttpStatusCode.OK.code).render('Layouts/users/ProductListing', {
      title: 'Chronova',
      products,
      categories,
      wishedProductIds: JSON.stringify(wishedProductIds.map(id => id.toString()))
    });
  } catch (error) {
    console.error('Error rendering product listing:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR.code).send('Server Error');
  }
};

export const getFilteredProducts = async (req, res) => {
  try {
    const result = await fetchFilteredProducts(req.query);
    // console.log(result)
    res.status(HttpStatusCode.OK.code).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

