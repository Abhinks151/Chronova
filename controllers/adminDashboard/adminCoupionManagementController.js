import {
  createCouponService,
  deleteCouponService,
  editCouponService,
  getAllActiveCouponsService,
  getCouponManagemntPageDataService,
  toggleActiveStatusService,
} from "../../services/offers/adminCouponServices.js";
import httpStatusCOde from "../../utils/httpStatusCode.js";
import { logger } from "../../config/logger.js";

export const getCouponManagementPage = (req, res) => {
  try {
    res
      .status(httpStatusCOde.OK.code)
      .render("Layouts/adminDashboard/couponManagement");
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).render("error", {
      error,
    });
  }
};

export const getCouponManagementPageData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "newest",
      status = "",
      date = "",
      search = "",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filterConditions = { isDeleted: false };

    if (status) {
      const now = new Date();
      if (status === "active") {
        filterConditions.isActive = true;
        filterConditions.expiryTime = { $gt: now };
      } else if (status === "inactive") {
        filterConditions.isActive = false;
        filterConditions.expiryTime = { $gt: now };
      } else if (status === "expired") {
        filterConditions.expiryTime = { $lte: now };
      }
    }

    if (date) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (date === "today") {
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        filterConditions.createdAt = { $gte: today, $lt: tomorrow };
      } else if (date === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filterConditions.createdAt = { $gte: weekAgo };
      } else if (date === "month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filterConditions.createdAt = { $gte: monthAgo };
      }
    }

    if (search) {
      filterConditions.coupon = { $regex: search, $options: "i" };
    }

    let sortConditions = {};
    switch (sort) {
      case "oldest":
        sortConditions = { createdAt: 1 };
        break;
      case "discount":
        sortConditions = { discountAmount: -1 };
        break;
      case "expiry":
        sortConditions = { expiryTime: 1 };
        break;
      case "newest":
      default:
        sortConditions = { createdAt: -1 };
        break;
    }

    const data = await getCouponManagemntPageDataService(
      filterConditions,
      sortConditions,
      skip,
      limitNum
    );

    res.status(httpStatusCOde.OK.code).json({
      success: true,
      data: data.coupons,
      totalItems: data.totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(data.totalCount / limitNum),
      itemsPerPage: limitNum,
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const addCoupon = async (req, res) => {
  try {
    // console.log(req.body)
    if (!req.body) {
      return res.status(httpStatusCOde.BAD_REQUEST.code).json({
        success: false,
        message: "Coupon data is required",
      });
    }
    const coupon = await createCouponService(req.body);

    res.status(httpStatusCOde.CREATED.code).json({
      success: true,
      message: "Coupon added successfully",
      coupon,
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const editCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    if (!couponId) {
      return res.status(httpStatusCOde.BAD_REQUEST.code).json({
        success: false,
        message: "Coupon id is required",
      });
    }

    const coupon = await editCouponService(couponId, req.body);

    res.status(httpStatusCOde.OK.code).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await toggleActiveStatusService(couponId);
    res.status(httpStatusCOde.OK.code).json({
      success: true,
      message: "Coupon status updated successfully",
      coupon,
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    await deleteCouponService(couponId);
    res.status(httpStatusCOde.OK.code).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getAllActiveCoupons = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await getAllActiveCouponsService(userId);
    res.status(httpStatusCOde.OK.code).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
