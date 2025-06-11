import httpStatusCode from '../../utils/httpStatusCode.js';
import { addProductService } from '../../servises/productManagement/addProductServise.js';
import { getProductsServise } from '../../servises/productManagement/getProductsServise.js';
import { blockProductService } from '../../servises/productManagement/blockProductServise.js';
import { deleteProductService } from '../../servises/productManagement/daleteProductServise.js';
import { paginationService } from '../../servises/productManagement/paginationService.js';





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
