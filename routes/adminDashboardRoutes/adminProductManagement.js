import express from 'express';
import { blockProduct, deleteProduct, getAddProducts, getFilteredProducts, getProductsPage, postAddProducts } from '../../controllers/adminDashboard/adminProductManagement.js'
import { authenticateAdmin } from '../../middlewares/adminAuthMiddleware.js';
import upload from '../../middlewares/multer.js';


const productsRouter = express.Router()

productsRouter.get('/products', authenticateAdmin, getProductsPage);
productsRouter.get('/products/filter', authenticateAdmin, getFilteredProducts);
productsRouter.get('/products/add', authenticateAdmin, getAddProducts)
productsRouter.post('/products/add', authenticateAdmin, upload.any(), postAddProducts)
productsRouter.patch('/products/block/:productId', authenticateAdmin, blockProduct)
productsRouter.delete('/products/delete/:productId', authenticateAdmin, deleteProduct)

export default productsRouter;

