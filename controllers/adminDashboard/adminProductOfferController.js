import {
  addProductOfferService,
  deleteProductOfferService,
  editProductOfferService,
  getActiveProductOffers,
  getProductOfferByIdService,
  toggleProductOfferStatusService
} from "../../services/offers/adminProductOfferService.js";
import { getActiveProducts } from "../../services/user/getUserProductService.js";
import httpStatusCode from '../../utils/httpStatusCode.js';


export const getProductOfferManagementPage = async (req, res) => {
  try {
    return res.status(httpStatusCode.OK.code).render('Layouts/adminDashboard/productOfferManagement', {});
    
  } catch (error) {
    console.error("Error in getProductOfferManagementPage:", error.message);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
}

export const getProductOfferManagementPageData = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt_desc", search = "",status="" ,discount=""} = req.query;


    const data = await getActiveProductOffers({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      search,
      status,
      discount
    });

    const products = await getActiveProducts();

    // console.log(products);
    // console.log(data);

    return res.status(200).json({
      success: true,
      ...data,
      products
    });

  } catch (error) {
    console.error("Error in getProductOfferManagementPageData:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const addProductOffer = async (req, res) => {
  try {
    console.log(req.body);
    const data = await addProductOfferService(req.body);
    return res.status(httpStatusCode.CREATED.code).json({
      message: "Product offer added successfully",
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in addProductOffer:", error.message);
    return res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const editProductOffers = async (req,res)=>{
  try{
    // console.log('req.params',req.params);
    // console.log('req.body',req.body);
    const offerId = req.params.id;
    const newData = req.body;
    const data = await editProductOfferService(offerId,newData);
    res.status(httpStatusCode.OK.code).json({
      success: true,
      data,
      message:"Product offer updated "
    });
  }catch(error){
    console.error("Error in editProductOffers:", error.message);
    return res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
}


export const getProductOfferById = async (req, res) => {
  try {
    const offerId = req.params.id;
    // console.log(offerId);
    const data = await getProductOfferByIdService(offerId);
    return res.status(httpStatusCode.OK.code).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in getProductOfferById:", error.message);
    return res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
}


export const toggleProductOfferStatus = async (req, res) => {
  try {
    const offerId = req.params.id;

    const updatedOffer = await toggleProductOfferStatusService(offerId);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: `Offer has been ${updatedOffer.isActive ? "activated" : "deactivated"}`,
      data: updatedOffer,
    });
  } catch (error) {
    console.error("Error toggling product offer status:", error.message);

    let statusCode;
    if (error.message === "Product offer not found") {
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

export const deleteProductOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const data = await deleteProductOfferService(offerId);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      data,
      message: "Product offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product offer:", error.message);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};