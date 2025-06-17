import httpStatusCode from '../../utils/httpStatusCode.js';
import { addProductService, getCategories } from '../../servises/productManagement/addProductServise.js';
import { blockProductService } from '../../servises/productManagement/blockProductServise.js';
import { deleteProductService } from '../../servises/productManagement/daleteProductServise.js';
import { paginationService } from '../../servises/productManagement/paginationService.js';
import { getProduct, updateProductService } from '../../servises/productManagement/editProductService.js';


// const categories = [
//   { _id: 'men', name: 'Men' },
//   { _id: 'women', name: 'Women' },
//   { _id: 'kids', name: 'Kids' },
//   { _id: 'unisex', name: 'Unisex' },
//   { _id: 'luxury', name: 'Luxury' },
//   { _id: 'formal', name: 'Formal' },
//   { _id: 'casual', name: 'Casual' },
//   { _id: 'sports', name: 'Sports' },
//   { _id: 'minimalist', name: 'Minimalist' },
//   { _id: 'fashion', name: 'Fashion' },
//   { _id: 'retro', name: 'Retro' },
//   { _id: 'outdoor', name: 'Outdoor' },
//   { _id: 'chronograph', name: 'Chronograph' }
// ];

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
    // console.log(paginated.products);
    res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/products', {
      title: 'Products',
      products: paginated.products,
      categories: paginated.categories,
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
    // console.log(paginated);
    res.status(httpStatusCode.OK.code).json({
      success: true,
      products: paginated.products,
      categories: paginated.categories,
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
}

export const postAddProducts = async (req, res) => {
  try {
    const { body, files } = req;

    // console.log(body);
    // console.log(files);

    const images = files.map((file) => ({
      url: file.path,
      public_id: file.filename
    }));

    const productData = {
      ...body,
      images
    };

    const newProduct = await addProductService(productData);




    console.log(newProduct);
    res.status(httpStatusCode.CREATED.code).json({
      message: "Product added successfully",
      redirect: '/admin/products'
    });

  } catch (err) {
    console.error(err);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Something went wrong' });
  }
}


// export const getEditProducts = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const product = await Products.findById(id);
//         if (!product) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: 'Product not found' 
//             });
//         }

//         if (product.isDeleted) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: 'Product has been deleted' 
//             });
//         }

//         res.render('Layouts/adminDashboard/editProducts', { 
//             product,
//             title: 'Edit Product',
//             // currentPage: 'products'
//         });
//     } catch (error) {
//         console.error('Error fetching product for edit:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error while fetching product' 
//         });
//     }
// };





// export const patchEditProducts = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { body, files } = req;

//     const existingProduct = await Products.findById(id);
//     if (!existingProduct) {
//       return res.status(404).render('Layouts/adminDashboard/editProducts', {
//         error: 'Product not found',
//         product: null,
//         title: 'Edit Product',
//         currentPage: 'products'
//       });
//     }

//     // Prepare new image array
//     let images = [];

//     if (files && files.length > 0) {
//       images = files.map(file => ({
//         url: file.path,
//         public_id: file.filename
//       }));
//     } else {
//       images = existingProduct.images;
//     }

//     // Optional manual validation
//     if (!images || images.length !== 4) {
//       return res.status(400).render('Layouts/adminDashboard/editProducts', {
//         error: 'Exactly 4 images are required.',
//         product: existingProduct,
//         title: 'Edit Product',
//         currentPage: 'products'
//       });
//     }

//     const updatedProductData = {
//       ...body,
//       images
//     };


//     console.log(updatedProductData);

//     await Products.findByIdAndUpdate(id, updatedProductData, {
//       new: true,
//       runValidators: true
//     });

//     res.status(httpStatusCode.OK.code).json({
//       message: 'Product updated successfully',
//       redirect: '/admin/products'
//     });
//   } catch (err) {
//     console.error('Error in patchEditProducts:', err);
//     res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
//       message: 'Something went wrong while updating product'
//     });
//   }
// };



// Temporary hardcoded values






// @desc Render edit product page
export const getEditProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await getCategories();
    const product = await getProduct()
    if (!product) {
      return res.status(httpStatusCode.NOT_FOUND.code).render('error', { message: 'Product not found' });
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
    res.status(500).render('error', { message: 'Server error' });
  }
};

export const patchEditProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

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
    console.error(err);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Something went wrong' });
  }
}


export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    await deleteProductService(productId);

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: 'Product deleted successfully',

    })

  } catch (error) {
    console.error(err);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Something went wrong' });
  }
}
