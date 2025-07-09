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

const offerRouter = express.Router()

offerRouter.get('/offer/products', authenticateAdmin, getProductOfferManagementPage)
offerRouter.get('/offer/products/data', authenticateAdmin, getProductOfferManagementPageData)
offerRouter.get('/offer/products/:id', authenticateAdmin, getProductOfferById)
offerRouter.post('/offer/products/add', authenticateAdmin, addProductOffer)
offerRouter.patch('/offer/products/edit/:id', authenticateAdmin, editProductOffers)
offerRouter.patch('/offer/products/toggle/:id', authenticateAdmin, toggleProductOfferStatus)
offerRouter.patch('/offer/products/delete/:id', authenticateAdmin, deleteProductOffer)


export default offerRouter
