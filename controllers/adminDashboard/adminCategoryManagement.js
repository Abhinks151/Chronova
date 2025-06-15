
import { addCategoryService } from "../../servises/adminCategoryManagemnt/addCategoryService.js";
import { filterCategoriesService } from "../../servises/adminCategoryManagemnt/filterCategoryService.js";
import { getCategoryService } from "../../servises/adminCategoryManagemnt/getCategoryService.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import { editCategoryService } from "../../servises/adminCategoryManagemnt/editCategoryService.js";
import { toggleBlockCategoryService } from "../../servises/adminCategoryManagemnt/blockCategory.js";
import { deleteCategoryService } from "../../servises/adminCategoryManagemnt/deleteCategory.js";
import { types } from "../../utils/categoryTypes.js";


export const getCategory = async (req, res) => {
  try {
    const { categoriesWithCount, products } = await getCategoryService();
    // console.log('categoriesWithCount', categoriesWithCount);
    // console.log('products', products);
    return res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/category', {
      categories: categoriesWithCount,
      types,
      products
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/adminDashboard/category', {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    if (page < 1 || limit < 1) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({ success: false, message: 'Invalid pagination parameters' });
    }

    // console.log(req.query);

    const result = await filterCategoriesService({
      ...req.query,
      page,
      limit
    });

    // console.log(result)

    res.status(httpStatusCode.OK.code).json(result);
  } catch (error) {
    console.error('Error filtering categories:', error);
    res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || 'Server error while filtering categories'
    });
  }
};


export const addCategory = async (req, res) => {
  try {
    const { categoryName, type, description, products } = req.body;

    const category = await addCategoryService({
      categoryName,
      type,
      description,
      products
    });

    res.status(httpStatusCode.CREATED.code).json({
      success: true,
      message: 'Category added successfully!',
      category
    });
  } catch (error) {
    console.error('Error adding category:', error.message);
    res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
};



export const editCategory = async (req, res) => {
  try {
    

    const { id } = req.params;
    const { categoryName, type, description, products } = req.body;

    if (!categoryName || !type || !description || !products) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'All fields are required'
      }); 
    }

    const result = await editCategoryService(id, { categoryName, type, description, products });
    // console.log(result)
    if (!result) {
      return res.status(httpStatusCode.NOT_FOUND.code).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: 'Category updated successfully!',
      category: result
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Block 
export const toggleBlockCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic validation
    if (!id || typeof id !== 'string') {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const result = await toggleBlockCategoryService(id);

    if (!result) {
      return res.status(httpStatusCode.NOT_FOUND.code).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: `Category ${result.isBlocked ? 'blocked' : 'unblocked'} successfully!`,
      updatedCategory: result
    });

  } catch (error) {
    console.error('Error toggling category block state:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const result = await deleteCategoryService(id);

    if (!result) {
      return res.status(httpStatusCode.NOT_FOUND.code).json({
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
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

