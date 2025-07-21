import httpStatusCode from "../../utils/httpStatusCode.js";
import { generatePDFReportService, generateExcelReportService, getSalesReportService } from "../../services/adminSalesService/adminSalesService.js";

export const getSalesReport = async (req, res) => {
  try {
    res.status(httpStatusCode.OK.code).render("Layouts/adminDashboard/salesReport");
  } catch (error) {
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ error: error.message });
  }
};

export const getSalesReportData = async (req, res) => {
  try {
    const result = await getSalesReportService(req);
    res.status(httpStatusCode.OK.code).json({
      message: "Sales Report",
      data: result.orders,
      summary: result.summary,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ error: error.message });
  }
};

export const downloadSalesReportPDF = async (req, res) => {
  try {
    const pdfBuffer = await generatePDFReportService(req);
    const filename = `sales-report-${new Date().toISOString().split("T")[0]}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
};

export const downloadSalesReportExcel = async (req, res) => {
  try {
    const buffer = await generateExcelReportService(req);
    const filename = `sales-report-${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: "Failed to generate Excel report",
      error: error.message,
    });
  }
};
