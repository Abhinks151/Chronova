import express from "express";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";
import {
  addProductOffer,
  deleteProductOffer,
  editProductOffers,
  getProductOfferById,
  getProductOfferManagementPage,
  getProductOfferManagementPageData,
  toggleProductOfferStatus
} from "../../controllers/adminDashboard/adminProductOfferController.js";
import { addCategoryOffer, deleteCategoryOffer, editCategoryOffers, getCategoryOfferById, getCategoryOfferManagementPage, getCategoryOfferManagementPageData, toggleCategoryOfferStatus } from "../../controllers/adminDashboard/adminCategoryOfferManagementController.js";

const offerRouter = express.Router()

offerRouter.get('/offer/products', authenticateAdmin, getProductOfferManagementPage)
offerRouter.get('/offer/products/data', authenticateAdmin, getProductOfferManagementPageData)
offerRouter.get('/offer/products/:id', authenticateAdmin, getProductOfferById)
offerRouter.post('/offer/products/add', authenticateAdmin, addProductOffer)
offerRouter.patch('/offer/products/edit/:id', authenticateAdmin, editProductOffers)
offerRouter.patch('/offer/products/toggle/:id', authenticateAdmin, toggleProductOfferStatus)
offerRouter.patch('/offer/products/delete/:id', authenticateAdmin, deleteProductOffer)


offerRouter.get('/offer/category', authenticateAdmin, getCategoryOfferManagementPage);
offerRouter.get('/offer/category/data', authenticateAdmin, getCategoryOfferManagementPageData);
offerRouter.get('/offer/category/:id', authenticateAdmin, getCategoryOfferById);
offerRouter.post('/offer/category/add', authenticateAdmin, addCategoryOffer);
offerRouter.patch('/offer/category/edit/:id', authenticateAdmin, editCategoryOffers);
offerRouter.patch('/offer/category/toggle/:id', authenticateAdmin, toggleCategoryOfferStatus);
offerRouter.patch('/offer/category/delete/:id', authenticateAdmin, deleteCategoryOffer);



export default offerRouter
