import express from "express";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";
import {
    getAdminDashboardChartData,
    getAdminDashboardPage,
    getAdminDashboardPageData
} from "../../controllers/adminDashboard/adminDashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get('/dashboard', authenticateAdmin, getAdminDashboardPage);
dashboardRouter.get('/dashboard/data', authenticateAdmin, getAdminDashboardPageData);
dashboardRouter.get('/dashboard/sales/chart/data', authenticateAdmin, getAdminDashboardChartData);

export default dashboardRouter;