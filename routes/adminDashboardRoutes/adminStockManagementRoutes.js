import express from 'express';
import { authenticateAdmin } from '../../middlewares/adminAuthMiddleware.js';
import { getStockManagementPage, getStockPageData, getStockRegistryByProduct } from '../../controllers/adminDashboard/adminStockManagement.js';


const adminStockRouter = express.Router();

adminStockRouter.get('/stock/management', authenticateAdmin,getStockManagementPage)
adminStockRouter.get('/stock/management/data', authenticateAdmin,getStockPageData)

adminStockRouter.get('/stock/registry/:productId', authenticateAdmin, getStockRegistryByProduct);
export default adminStockRouter;

