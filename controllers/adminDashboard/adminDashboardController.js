import {
  getAdminDashboardChartService,
  getAdminDashboardPageDataService
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