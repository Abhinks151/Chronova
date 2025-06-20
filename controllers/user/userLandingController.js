import { getActiveCategories, getProductByCategoryId } from '../../servises/user/getUserProductService.js';
import httpStatusCode from '../../utils/httpStatusCode.js';

export const getLandingPage = async (req, res) => {
  try {
    res.status(httpStatusCode.OK.code).render('Layouts/users/userLanding');
  } catch (error) {
    console.error('Error rendering landing page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).send('Internal Server Error');
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await getActiveCategories();
    res.status(httpStatusCode.OK.code).json({
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: 'Failed to load categories'
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        message: 'Category ID is required'
      });
    }

    const categoryProducts = await getProductByCategoryId(categoryId);
    res.status(httpStatusCode.OK.code).json({
      categoryProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: 'Failed to load products'
    });
  }
};

