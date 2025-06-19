import httpStatusCode from '../../utils/httpStatusCode.js';
import { addProductService, getCategories } from '../../servises/productManagement/addProductServise.js';
import { blockProductService } from '../../servises/productManagement/blockProductServise.js';
import { deleteProductService } from '../../servises/productManagement/daleteProductServise.js';
import { getCategory, paginationService } from '../../servises/productManagement/paginationService.js';
import { getProduct, updateProductService } from '../../servises/productManagement/editProductService.js';
import mongoose from 'mongoose';

const types = [
  { _id: 'mechanical', name: 'Mechanical' },
  { _id: 'automatic', name: 'Automatic' },
  { _id: 'quartz', name: 'Quartz' },
  { _id: 'smartwatch', name: 'Smartwatch' }
];

const brands = [
  { _id: 'fossil', name: 'Fossil' },
  { _id: 'casio', name: 'Casio' },
  { _id: 'titan', name: 'Titan' },
  { _id: 'timex', name: 'Timex' },
  { _id: 'rolex', name: 'Rolex' },
  { _id: 'seiko', name: 'Seiko' },
  { _id: 'tissot', name: 'Tissot' },
  { _id: 'mk', name: 'Michael Kors' }
];

export const getProductsPage = async (req, res) => {
  try {
    const paginated = await paginationService(req.query);
    const categories = await getCategory();
    res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/products', {
      title: 'Products',
      products: paginated.products,
      categories,
      brands: paginated.brands,
      types: paginated.types,
      success: true,
      currentPage: paginated.currentPage,
      totalPages: paginated.totalPages,
      totalCount: paginated.totalCount,
    });
  } catch (error) {
    console.error('Error loading products page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('error', { error: 'Failed to load products' });
  }
};

export const getFilteredProducts = async (req, res) => {
  try {
    const paginated = await paginationService(req.query);
    const categories = await getCategory();
    res.status(httpStatusCode.OK.code).json({
      success: true,
      products: paginated.products,
      categories,
      brands: paginated.brands,
      types: paginated.types,
      currentPage: paginated.currentPage,
      totalPages: paginated.totalPages,
      totalCount: paginated.totalCount,
    });
  } catch (error) {
    console.error('Error filtering products:', error);
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
    console.log(error);
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

    const { productName, description, price, stockQuantity, category, brand } = productData;
    const parsedPrice = Number(price);
    const parsedStock = Number(stockQuantity);

    if (!productName || !productName.trim() || !/^[a-zA-Z\s]+$/.test(productName.trim())) {
      return { error: "Product name is required and must contain only letters and spaces" };
    }

    if (!description || !description.trim() || !/^.{10,}$/.test(description.trim())) {
      return { error: "Product description is required and must be at least 10 characters" };
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return { error: "Product price must be a valid non-negative number" };
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return { error: "Product stock must be a valid non-negative number" };
    }

    if (!Array.isArray(category) || !category.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return { error: "Invalid category id" };
    }

    if (brand && (!/^[a-zA-Z\s]+$/.test(brand) || typeof brand !== "string")) {
      return { error: "Brand must be a string containing only letters and spaces" };
    }

    return res.status(httpStatusCode.CREATED.code).json({
      success: true,
      message: "Product added successfully",
      redirect: '/admin/products'
    });

  } catch (err) {
    console.error('Error in postAddProducts:', err);
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
      { _id: 'Fossil', name: 'Fossil' },
      { _id: 'Casio', name: 'Casio' },
      { _id: 'Titan', name: 'Titan' },
      { _id: 'Timex', name: 'Timex' },
      { _id: 'Rolex', name: 'Rolex' },
      { _id: 'Seiko', name: 'Seiko' },
      { _id: 'Tissot', name: 'Tissot' },
      { _id: 'Michael Kors', name: 'Michael Kors' }
    ];

    const types = ['Analog', 'Digital', 'Smart', 'Chronograph'];

    if (!product) {
      return res.status(httpStatusCode.NOT_FOUND.code).render('error', {
        message: 'Product not found'
      });
    }

    res.render('Layouts/adminDashboard/editProducts', {
      title: 'Edit Product',
      product,
      categories,
      brands,
      types
    });

  } catch (error) {
    console.error('Error fetching product for edit:', error);
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
    // console.log(body)
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
    console.error('Unexpected error in patchEditProducts:', error);
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
    console.error(error);
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
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Something went wrong' });
  }
};

