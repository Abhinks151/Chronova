import { getFilteredWalletHistoryService, getWalletHistoryService } from "../../servises/user/walletService.js";


export const getWalletPage = (req, res) => {
  try {
    res.render('Layouts/users/wallet');
  } catch (error) {
    console.error("Error in getWalletPage:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getWalletHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if(!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
        data: null
      });
    }

    const data = await getWalletHistoryService(userId);

    if (!data) {
      return res.status(404).json({
        message: "Wallet not found for the given user ID",
        success: false,
        data: null
      });
    }
    res.json({
      message: "Wallet history retrieved successfully",
      data,
      success: true
    })
  } catch (error) {
    console.error("Error in getWalletHistory:", error);
    res.status(500).json({ message: "Internal Server Error" });

  }
}


export const getFilteredWalletHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10, search = '', type = '', sort = 'desc' } = req.query;

    if (!userId) {
      return res.status(400).json({
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

    res.status(200).json({
      message: "Filtered wallet transactions fetched successfully",
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in getFilteredWalletHistory:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};