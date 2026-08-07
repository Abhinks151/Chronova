import httpStatusCode from '../../utils/httpStatusCode.js';
import { addProductService, getCategories } from '../../services/productManagement/addProductService.js';
import { blockProductService } from '../../services/productManagement/blockProductService.js';
import { deleteProductService } from '../../services/productManagement/deleteProductService.js';
import { getCategory, paginationService } from '../../services/productManagement/paginationService.js';
import { getProduct, updateProductService } from '../../services/productManagement/editProductService.js';
import { findBestPriceForProduct } from '../../services/offers/bestOfferForProductService.js';
import { logger } from '../../config/logger.js';


export const getProductsPage = async (req, res) => {
  try {
    const paginated = await paginationService(req.query);
    const categories = await getCategory();

    const productsWithPrice = await Promise.all(
      paginated.products.map(async (product) => {
        const offer = await findBestPriceForProduct(product._id);
        return {
          ...product,
          offer,
        };
      })
    );

    res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/products', {
      title: 'Products',
      products: productsWithPrice,
      categories,
      brands: paginated.brands,
      types: paginated.types,
      success: true,
      currentPage: paginated.currentPage,
      totalPages: paginated.totalPages,
      totalCount: paginated.totalCount,
    });
  } catch (error) {
    logger.error('Error loading products page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('error', { error: 'Failed to load products' });
  }
};

export const getFilteredProducts = async (req, res) => {
  try {
    const paginated = await paginationService(req.query);
    const categories = await getCategory();

    const productsWithPrice = await Promise.all(
      paginated.products.map(async (product) => {
        const offer = await findBestPriceForProduct(product._id);
        return {
          ...product,
          offer,
        };
      })
    );

    // logger.info(productsWithPrice);

    res.status(httpStatusCode.OK.code).json({
      success: true,
      products: productsWithPrice,
      categories,
      brands: paginated.brands,
      types: paginated.types,
      currentPage: paginated.currentPage,
      totalPages: paginated.totalPages,
      totalCount: paginated.totalCount,
    });
  } catch (error) {
    logger.error('Error filtering products:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};


export const getAddProducts = async (req, res) => {
  try {
    const categories = await getCategories();
    res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/addProducts', {
      categories
    });
  } catch (error) {
    logger.info(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Something went wrong' });
  }
};


export const postAddProducts = async (req, res) => {
  try {
    const { body, files } = req;

    const images = files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    const productData = { ...body, images };
    const result = await addProductService(productData);

    if (result.error) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: result.error
      });
    }

    return res.status(httpStatusCode.CREATED.code).json({
      success: true,
      message: "Product added successfully",
      redirect: '/admin/products'
    });

  } catch (err) {
    logger.error('Error in postAddProducts:', err);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};



export const getEditProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await getCategories();
    const product = await getProduct(id);

    const brands = [
      { _id: 'Rolex', name: 'Rolex' },
      { _id: "Omega", name: "Omega" },
      { _id: 'Seiko', name: 'Seiko' },
      { _id: 'Casio', name: 'Casio' },
      { _id: 'Tissot', name: 'Tissot' },
      { _id: 'Citizen', name: 'Citizen' },
      { _id: 'TAG Heuer', name: 'TAG Heuer' },
      { _id: 'Fossil', name: 'Fossil' },
      { _id: 'Apple', name: 'Apple' },
      { _id: 'Samsung', name: 'Samsung' },
    ];

    const types = [
      'Analog',
      'Digital',
      'Smart',
      'Hybrid',
      'Automatic',
      'Mechanical',
      'Quartz',
      'Chronograph',
      'Skeleton'
    ];

    if (!product) {
      return res.status(httpStatusCode.NOT_FOUND.code).json({
        message: 'Product not found or blocked'
      });
    }

    if (product.category && Array.isArray(product.category)) {
      product.category = product.category.map(cat => cat.toString());
    }

    res.render('Layouts/adminDashboard/editProducts', {
      title: 'Edit Product',
      product,
      categories,
      brands,
      types
    });

  } catch (error) {
    logger.error('Error fetching product for edit:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('Layouts/adminDashboard/editProducts', {
      message: 'Server error while fetching product',
      categories: [],
      brands: [],
      types: []
    });
  }
};


export const patchEditProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;
    // logger.info(body)
    const result = await updateProductService(id, body, files);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.json({
      success: true,
      message: result.message,
      product: result.product,
      redirect: '/admin/products'
    });

  } catch (error) {
    logger.error('Unexpected error in patchEditProducts:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Error updating product. Please try again.'
    });
  }
};

export const blockProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    await blockProductService(productId);

    res.status(httpStatusCode.OK.code).json({
      message: "Product blocked successfully",
      redirect: '/admin/products',
      success: true
    });

  } catch (error) {
    logger.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Something went wrong' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    await deleteProductService(productId);

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    logger.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Something went wrong' });
  }
};

