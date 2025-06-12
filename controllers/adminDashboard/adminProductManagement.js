import httpStatusCode from '../../utils/httpStatusCode.js';
import { addProductService } from '../../servises/productManagement/addProductServise.js';
import { getProductsServise } from '../../servises/productManagement/getProductsServise.js';
import { blockProductService } from '../../servises/productManagement/blockProductServise.js';
import { deleteProductService } from '../../servises/productManagement/daleteProductServise.js';
import { paginationService } from '../../servises/productManagement/paginationService.js';
import { Products } from '../../models/products.js';





export const getProductsPage = async (req, res) => {
  try {
    const paginated = await paginationService(req.query);

    res.render('Layouts/adminDashboard/products', {
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
    res.status(500).render('error', { error: 'Failed to load products' });
  }
};

export const getFilteredProducts = async (req, res) => {
  try {
    const paginated = await paginationService(req.query);
    // console.log(paginated);
    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

export const getAddProducts = async (req, res) => {
  res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/addProducts');
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

const categories = [
  { _id: 'men', name: 'Men' },
  { _id: 'women', name: 'Women' },
  { _id: 'kids', name: 'Kids' },
  { _id: 'unisex', name: 'Unisex' },
  { _id: 'luxury', name: 'Luxury' },
  { _id: 'formal', name: 'Formal' },
  { _id: 'casual', name: 'Casual' },
  { _id: 'sports', name: 'Sports' },
  { _id: 'minimalist', name: 'Minimalist' },
  { _id: 'fashion', name: 'Fashion' },
  { _id: 'retro', name: 'Retro' },
  { _id: 'outdoor', name: 'Outdoor' },
  { _id: 'chronograph', name: 'Chronograph' }
];


// @desc Render edit product page
export const getEditProducts = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Products.findById(id);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
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

// @desc Handle product update
export const patchEditProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { body, files } = req;

        const existingProduct = await Products.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (body.sku && body.sku !== existingProduct.sku) {
            const existingSKU = await Products.findOne({
                sku: body.sku,
                _id: { $ne: id }
            });

            if (existingSKU) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists. Please use a different SKU.'
                });
            }
        }

        let images = existingProduct.images;
        if (files && files.length > 0) {
            images = files.map(file => ({
                url: file.path,
                public_id: file.filename
            }));
        }

        const productData = {
            ...body,
            images,
            updatedAt: new Date()
        };

        const updatedProduct = await Products.findByIdAndUpdate(
            id,
            productData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully!',
            product: updatedProduct,
            redirect: '/admin/products'
        });

    } catch (error) {
        console.error('Error updating product:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: errors.join(', ')
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists. Please use a different SKU.'
            });
        }

        res.status(500).json({
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
    const {productId} = req.params;

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
