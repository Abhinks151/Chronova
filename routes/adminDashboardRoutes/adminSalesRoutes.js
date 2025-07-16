import express from "express";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";
import {
  downloadSalesReportExcel,
  downloadSalesReportPDF,
  getSalesReport,
  getSalesReportData,
} from "../../controllers/adminDashboard/adminSalesReport.js";

const salesRouter = express.Router();

salesRouter.get("/sales/report", authenticateAdmin, getSalesReport);
salesRouter.get("/sales/report/data", authenticateAdmin, getSalesReportData);
salesRouter.get("/sales/report/download/pdf", authenticateAdmin, downloadSalesReportPDF);
salesRouter.get("/sales/report/download/excel", authenticateAdmin, downloadSalesReportExcel);

export default salesRouter;
