import { getFilteredWalletHistoryService, getWalletHistoryService } from "../../services/user/walletService.js";
import httpStatusCode from '../../utils/httpStatusCode.js';
import { logger } from '../../config/logger.js';

export const getWalletPage = (req, res) => {
  try {
    res.render('Layouts/users/wallet');
  } catch (error) {
    logger.error("Error in getWalletPage:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ 
      message: "Internal Server Error",
      success: false 
    });
  }
}

export const getWalletHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        message: "User ID is required",
        success: false,
        data: null
      });
    }

    const data = await getWalletHistoryService(userId);

    if (!data) {
      return res.status(httpStatusCode.NOT_FOUND.code).json({
        message: "Wallet not found",
        success: false,
        data: {
          balance: 0,
          transactions: []
        },
      });
    }

    res.status(httpStatusCode.OK.code).json({
      message: "Wallet history retrieved successfully",
      data,
      success: true
    });
  } catch (error) {
    logger.error("Error in getWalletHistory:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ 
      message: "Internal Server Error",
      success: false,
      data: null
    });
  }
}

export const getFilteredWalletHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      type = '', 
      sort = 'desc' 
    } = req.query;

    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        message: "User ID is required",
        success: false,
        data: null
      });
    }

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Validate sort parameter
    const sortOrder = ['asc', 'desc'].includes(sort) ? sort : 'desc';

    // Validate type parameter
    const typeFilter = ['credit', 'debit', ''].includes(type) ? type : '';

    const filters = {
      page: pageNum,
      limit: limitNum,
      search: search.trim(),
      type: typeFilter,
      sort: sortOrder
    };

    const data = await getFilteredWalletHistoryService(userId, filters);

    res.status(httpStatusCode.OK.code).json({
      message: "Filtered wallet transactions fetched successfully",
      success: true,
      data
    });
  } catch (error) {
    logger.error("Error in getFilteredWalletHistory:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ 
      message: error.message || "Internal Server Error",
      success: false,
      data: {
        transactions: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        balance: 0
      }
    });
  }
};