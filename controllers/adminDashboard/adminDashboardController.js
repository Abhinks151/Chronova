import {
  getAdminDashboardChartService,
  getAdminDashboardPageDataService,
  getAdminPieChartDataService
} from "../../services/adminDashboardService/adminDashboardService.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import {logger} from '../../config/logger.js';


export const getAdminDashboardPage = (req, res) => {
  try {
    res.status(httpStatusCode.OK.code).render("Layouts/adminDashboard/dashboard");
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ error: error.message });
  }
};

export const getAdminDashboardPageData = async (req, res) => {
  try {
    const data = await getAdminDashboardPageDataService();
    // console.log(data);
    res.status(httpStatusCode.OK.code).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ error: error.message });
  }
}


export const getAdminDashboardChartData = async (req, res) => {
  try {
    const data = await getAdminDashboardChartService(req);
    // console.log(data);
    res.status(httpStatusCode.OK.code).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ error: error.message });
  }
}

export const getAdminDashboardPieData = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    const data = await getAdminPieChartDataService(type, startDate, endDate);

    res.status(httpStatusCode.OK.code).json({
      success: true,
      data
    });

  } catch (err) {
    logger.error('Pie chart fetch error:', err.message);
    console.error('Pie chart fetch error:', err.message);
    const status = err.message.includes('Invalid chart type') ? 400 : 500;

    res.status(status).json({
      success: false,
      message: err.message
    });
  }
};