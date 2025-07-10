
import {
  addCategoryOfferService,
  deleteCategoryOfferService,
  editCategoryOfferService,
  getActiveCategoryOffers,
  getCategoryOfferByIdService,
  toggleCategoryOfferStatusService
} from '../../servises/offers/adminCategoryOfferService.js';
import { getActiveCategories } from '../../servises/user/getUserProductService.js';
import httpStatusCode from '../../utils/httpStatusCode.js';

export const getCategoryOfferManagementPage = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt_desc", search = "", status = "", discount = "" } = req.query;

    const datas = await getActiveCategoryOffers({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      search,
      status,
      discount
    });
    const offers = datas.data;

    return res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/categoryOfferManagement',{
      offers
    });

  } catch (error) {
    console.error("Error in getCategoryOfferManagementPage:", error.message);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const getCategoryOfferManagementPageData = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt_desc", search = "", status = "", discount = "" } = req.query;

    const data = await getActiveCategoryOffers({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      search,
      status,
      discount
    });

    const categories = await getActiveCategories();

    return res.status(200).json({
      success: true,
      ...data,
      categories
    });

  } catch (error) {
    console.error("Error in getCategoryOfferManagementPageData:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const addCategoryOffer = async (req, res) => {
  try {
    // console.log(req.body);
    const data = await addCategoryOfferService(req.body);
    return res.status(httpStatusCode.CREATED.code).json({
      message: "Category offer added successfully",
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in addCategoryOffer:", error.message);
    return res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const editCategoryOffers = async (req, res) => {
  try {
    const offerId = req.params.id;
    const newData = req.body;
    const data = await editCategoryOfferService(offerId, newData);
    res.status(httpStatusCode.OK.code).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in editCategoryOffers:", error.message);
    return res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const getCategoryOfferById = async (req, res) => {
  try {
    const offerId = req.params.id;
    const data = await getCategoryOfferByIdService(offerId);
    return res.status(httpStatusCode.OK.code).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in getCategoryOfferById:", error.message);
    return res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const toggleCategoryOfferStatus = async (req, res) => {
  try {
    const offerId = req.params.id;

    const updatedOffer = await toggleCategoryOfferStatusService(offerId);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: `Category offer has been ${updatedOffer.isActive ? "activated" : "deactivated"}`,
      data: updatedOffer,
    });
  } catch (error) {
    console.error("Error toggling category offer status:", error.message);

    let statusCode;
    if (error.message === "Category offer not found") {
      statusCode = httpStatusCode.NOT_FOUND.code;
    } else {
      statusCode = httpStatusCode.INTERNAL_SERVER_ERROR.code;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const deleteCategoryOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const data = await deleteCategoryOfferService(offerId);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      data,
      message: "Category offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category offer:", error.message);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};