import { getFeaturedProducts } from "../../servises/user/featuredProduct.js";
import { getProductDetails } from "../../servises/user/productDetailsService.js";
import httpStatusCode from '../../utils/httpStatusCode.js';

export const productDetails = async (req, res) => {
  try {
    const product = await getProductDetails(req.params.id);
    res.status(httpStatusCode.OK.code).render('Layouts/users/ProductDetails', {
      product
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).redirect('/user/products');
  }
};

export const featuredProducts = async (req, res) => {
  try {
    const featuredProducts = await getFeaturedProducts(req.params.id);
    // console.log(req.params.id);
    // console.log(featuredProducts);
    res.status(httpStatusCode.OK.code).json({
      featuredProducts
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: 'Failed to fetch featured products',
      error: error.message || 'Something went wrong'
    });
  }
};
