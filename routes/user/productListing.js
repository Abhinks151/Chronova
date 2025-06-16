import express from 'express';
import { Products } from '../../models/products.js';
const userProductListing = express.Router();


// Get product listing page
userProductListing.get('/products', async (req, res) => {
  try {
    const products = await Products.find({ isBlocked: false });
    res.render('Layouts/users/ProductListing',{
      title: 'Product Listing',
      products
    });
  } catch (error) {
    console.error('Error rendering product listing:', error);
    res.status(500).send('Server Error');
  }
});

// API route for filtered products
userProductListing.get('/products/filter', async (req, res) => {
  try {
    let query = { isBlocked: false }; // Only active products
    let sort = {};
    
    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { productName: searchRegex },
        { brand: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Brand filter
    if (req.query.brand) {
      query.brand = req.query.brand;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.salePrice = {};
      if (req.query.minPrice) {
        query.salePrice.$gte = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.salePrice.$lte = parseInt(req.query.maxPrice);
      }
    }
    
    // Sorting
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-low':
          sort.salePrice = 1;
          break;
        case 'price-high':
          sort.salePrice = -1;
          break;
        case 'name-asc':
          sort.productName = 1;
          break;
        case 'name-desc':
          sort.productName = -1;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    
    const products = await Products.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const totalProducts = await Products.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.json({
      success: true,
      products: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

export default userProductListing;


