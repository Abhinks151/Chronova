import express from "express";
import { addCategory, deleteCategory, editCategory, filterCategories, getCategory, toggleBlockCategory } from "../../controllers/adminDashboard/adminCategoryManagement.js";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";

const categoryRouter = express.Router()



// import { Category } from '../../models/category.js'
// import { Products } from "../../models/products.js";



categoryRouter.get('/category', authenticateAdmin, getCategory);
categoryRouter.get('/category/filter', authenticateAdmin, filterCategories);
categoryRouter.post('/category/add', authenticateAdmin, addCategory);
categoryRouter.patch('/category/edit/:id', authenticateAdmin, editCategory);
categoryRouter.patch('/category/block/:id', authenticateAdmin, toggleBlockCategory);
categoryRouter.delete('/category/delete/:id', authenticateAdmin, deleteCategory);


export default categoryRouter