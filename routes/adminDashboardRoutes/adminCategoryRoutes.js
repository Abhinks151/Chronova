import express from "express";
import { addCategory, blockCategory, deleteCategory, editCategory, filterCategories, getCategory, unblockCategory } from "../../controllers/adminDashboard/adminCategoryManagement.js";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";

const categoryRouter = express.Router()



// import { Category } from '../../models/category.js'
// import { Products } from "../../models/products.js";



categoryRouter.get('/category', authenticateAdmin, getCategory);
categoryRouter.get('/category/filter', authenticateAdmin, filterCategories);
categoryRouter.post('/category/add', authenticateAdmin, addCategory);
categoryRouter.put('/category/edit/:id', authenticateAdmin, editCategory);
categoryRouter.put('/category/block/:id', authenticateAdmin, blockCategory);
categoryRouter.put('/category/unblock/:id', authenticateAdmin, unblockCategory);
categoryRouter.delete('/category/delete/:id', authenticateAdmin, deleteCategory);


export default categoryRouter