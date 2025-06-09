import express from 'express';
import { getAddProducts, getProducts, postAddProducts } from '../../controllers/adminDashboard/adminProductManagement.js'
import { authenticateAdmin } from '../../middlewares/adminAuthMiddleware.js';
import { upload } from '../../config/multer.js';


const productsRouter = express.Router()

productsRouter.get('/products', authenticateAdmin, getProducts);
productsRouter.get('/products/add', authenticateAdmin, getAddProducts)
productsRouter.post('/products/add', authenticateAdmin, upload.any(), postAddProducts)

export default productsRouter;