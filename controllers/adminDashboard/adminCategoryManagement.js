import { Category } from "../../models/category.js";
import { Products } from "../../models/products.js";
import { addCategoryService } from "../../servises/adminCategoryManagemnt/addCategoryService.js";
import httpStatusCode from "../../utils/httpStatusCode.js";

const types = ['fasion', 'men', 'women', 'kids'];

export const getCategory = async (req, res) => {
  try {
      // Aggregate categories with product count
      const categoriesWithCount = await Category.aggregate([
          {
        $lookup: {
          from: 'products', // collection name in MongoDB (lowercase + plural)
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0 // Exclude actual product array, keep only count
        }
      }
    ]);

    console.log(categoriesWithCount);

    // You still need all products (for dropdown, etc.)
    const products = await Products.find().lean();

    return res.render('Layouts/adminDashboard/category', {
      categories: categoriesWithCount,
      types,
      products
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.render('Layouts/adminDashboard/category', {
      categories: [],
      types,
      products: []
    });
  }
};



// export const addCategory = async (req, res) => {
//   try {
//     const categoryData = req.body;
//     const category = await addCategoryService(categoryData);
//     res.status(httpStatusCode.CREATED.code).json(category);
//   } catch (error) {
//     console.error(error);
//     res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'An error occurred' });
//   }
// };


// export const getCategory = async (req, res) => {
//   try {
//     const categories = await Category.find().populate('products').lean();
//     const products = await Products.find().lean();
    
//     // Add product count to each category
//     const categoriesWithCount = categories.map(category => ({
//       ...category,
//       productCount: category.products ? category.products.length : 0
//     }));

//     return res.render('Layouts/adminDashboard/category', {
//       categories: categoriesWithCount,
//       types,
//       products
//     });
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     return res.render('Layouts/adminDashboard/category', {
//       categories: [],
//       types,
//       products: []
//     });
//   }
// };

// Filter categories with search, type, status, sort, pagination




export const filterCategories = async (req, res) => {
  try {
    const { search, type, status, sort, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }
    
    // Status filter
    if (status && status !== 'All') {
      query.isBlocked = status === 'Blocked';
    }
    
    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'name-asc':
        sortQuery.name = 1;
        break;
      case 'name-desc':
        sortQuery.name = -1;
        break;
      case 'date-desc':
        sortQuery.createdAt = -1;
        break;
      case 'products-desc':
        // Will sort after populating
        break;
      default:
        sortQuery.createdAt = -1;
    }
    
    // Get total count
    const totalCount = await Category.countDocuments(query);
    
    // Get paginated results
    let categories = await Category.find(query)
      .populate('products')
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    // Add product count and sort by products if needed
    categories = categories.map(category => ({
      ...category,
      productCount: category.products ? category.products.length : 0
    }));
    
    if (sort === 'products-desc') {
      categories.sort((a, b) => b.productCount - a.productCount);
    }
    
    res.json({
      success: true,
      categories,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit)
    });
    
  } catch (error) {
    console.error('Error filtering categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering categories'
    });
  }
};

// Add new category
export const addCategory = async (req, res) => {
  try {
    const { name, type, description, products } = req.body;
    
    const categoryData = {
      name,
      type,
      description,
      products: products || [],
      isBlocked: false
    };
    
    const category = new Category(categoryData);
    await category.save();
    
    res.json({
      success: true,
      message: 'Category added successfully!',
      category
    });
    
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding category'
    });
  }
};

// Edit category
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, products } = req.body;
    
    const updateData = {
      name,
      type,
      description,
      products: products || []
    };
    
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully!',
      category
    });
    
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
};

// Block category
export const blockCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category blocked successfully!'
    });
    
  } catch (error) {
    console.error('Error blocking category:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking category'
    });
  }
};

// Unblock category
export const unblockCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category unblocked successfully!'
    });
    
  } catch (error) {
    console.error('Error unblocking category:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking category'
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    category.isDeleted = true;
    

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully!'
    });
    
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
};
