import express from "express";
import { addCategory } from "../../controllers/adminDashboard/adminCategoryManagement.js";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";

const categoryRouter = express.Router()

categoryRouter.post('/category/add',authenticateAdmin,addCategory)



export default categoryRouter