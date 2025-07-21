import jwt from "jsonwebtoken";
import {
  getActiveCategories,
  getProductByCategoryId,
} from "../../services/user/getUserProductService.js";
import { findWishlistByUserId } from "../../services/user/wishlistServices.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import dotenv from "dotenv";
import { findBestPriceForProduct } from "../../services/offers/bestOfferForProductService.js";

dotenv.config();
const config = {
  JWT_SECRET: process.env.JWT_SECRET_KEY,
};

export const getLandingPage = async (req, res) => {
  let isLoggedIn = false;
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      if (decoded && (decoded.id || decoded._id)) {
        isLoggedIn = true;
      }
    } catch (err) {
      console.warn("Invalid or expired token:", err.message);
    }
  }

  try {
    res
      .status(httpStatusCode.OK.code)
      .render("Layouts/users/userLanding", { isLoggedIn });
  } catch (error) {
    console.error("Error rendering landing page:", error);
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR.code)
      .send("Internal Server Error");
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await getActiveCategories();
    res.status(httpStatusCode.OK.code).json({
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: "Failed to load categories",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const categoryId = req.params.id;
    let userId = null;

    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        userId = decoded?.id || decoded?._id;
      } catch (err) {
        console.warn("Invalid or expired token:", err.message);
      }
    }

    // console.log('Fetched products for user:', userId);

    if (!categoryId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        message: "Category ID is required",
      });
    }

    const products = await getProductByCategoryId(categoryId);

    let wishlistProductIds = [];
    if (userId) {
      wishlistProductIds = await findWishlistByUserId(userId);
    }

    const categoryProducts = await Promise.all(
      products.map(async (product) => {
        const isInWishlist = wishlistProductIds.some(
          (id) => id.toString() === product._id.toString()
        );

        const offer = await findBestPriceForProduct (product._id);
        // console.log(product)
        return {
          ...product,
          isInWishlist,
          offer,
        };
      })
    );

    res.status(httpStatusCode.OK.code).json({ categoryProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: "Failed to load products",
    });
  }
};
