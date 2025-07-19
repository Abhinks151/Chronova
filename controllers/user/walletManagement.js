import { getFilteredWalletHistoryService, getWalletHistoryService } from "../../servises/user/walletService.js";
import httpStatusCOde from '../../utils/httpStatusCode.js';

export const getWalletPage = (req, res) => {
  try {
    res.render('Layouts/users/wallet');
  } catch (error) {
    console.error("Error in getWalletPage:", error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({ message: "Internal Server Error" });
  }
}

export const getWalletHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if(!userId) {
      return res.status(httpStatusCOde.BAD_REQUEST.code).json({
        message: "User ID is required",
        success: false,
        data: null
      });
    }

    const data = await getWalletHistoryService(userId);

    if (!data) {
      return res.status(httpStatusCOde.NOT_FOUND.code).json({
        message: "Wallet is empty",
        success: false,
        data: [],
      });
    }
    res.json({
      message: "Wallet history retrieved successfully",
      data,
      success: true
    })
  } catch (error) {
    console.error("Error in getWalletHistory:", error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({ message: "Internal Server Error" });

  }
}


export const getFilteredWalletHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10, search = '', type = '', sort = 'desc' } = req.query;

    if (!userId) {
      return res.status(httpStatusCOde.BAD_REQUEST.code).json({
        message: "User ID is required",
        success: false,
        data: null
      });
    }

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      type,
      sort
    };

    const data = await getFilteredWalletHistoryService(userId, filters);

    res.status(httpStatusCOde.OK.code).json({
      message: "Filtered wallet transactions fetched successfully",
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in getFilteredWalletHistory:", error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({ message: "Internal Server Error" });
  }
};