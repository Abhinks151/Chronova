import express from "express";
import { getAdminUserManagement, getAdminUsersPage, togleBlock } from "../../controllers/adminDashboard/adminUserManagement.js";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";

const adminUserManagementRouter = express.Router();

adminUserManagementRouter.get('/users', authenticateAdmin, getAdminUserManagement)
adminUserManagementRouter.get('/users/page', authenticateAdmin, getAdminUsersPage)
adminUserManagementRouter.patch('/users/toggle-block/:id', authenticateAdmin, togleBlock)


export default adminUserManagementRouter  