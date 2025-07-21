import {
  getCartCountService,
  getCartedProducts,
  postAddToCartService,
  removeCartService,
  updateCartService,
} from "../../services/user/cartServices.js";
import httpStatusCode from "../../utils/httpStatusCode.js";

export const getCartPage = async (req, res) => {
  try {
    res.status(httpStatusCode.OK.code).render("Layouts/users/cart");
  } catch (error) {
    console.log(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while loading the cart page.",
    });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await getCartedProducts(userId);

    // for (let i = 0; i < cart.items.length; i++) {
    //   console.log(cart.items[i].offer);
    // }

    if (!cart || cart.items.length === 0) {
      return res.status(httpStatusCode.OK.code).json({
        success: true,
        message: "Your cart is empty.",
        cart: { items: [] },
      });
    }

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Cart products fetched successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error fetching cart products:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while fetching cart products.",
    });
  }
};

export const getCartCount = async (req, res) => {
  const userId = req.user._id || req.user.id;
  try {
    const count = await getCartCountService(userId);
    if (!count) {
      return res.status(httpStatusCode.OK.code).json({
        success: true,
        message: "Cart is empty.",
        count: 0,
      });
    }
    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Cart count fetched successfully.",
      count,
    });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while fetching cart count.",
    });
  }
};

export const postAddToCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== "number") {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Product ID and quantity are required.",
      });
    }

    const cart = await postAddToCartService(userId, productId, quantity);
    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Failed to add product to cart.",
    });
  }
};

export const updateCartCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, quantity } = req.body;

    if (!userId || !productId || typeof quantity !== "number") {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "User ID, product ID and quantity are required.",
      });
    }

    const cart = await updateCartService(userId, productId, quantity);
    if (!cart) {
      return res.status(httpStatusCode.NOT_FOUND.code).json({
        success: false,
        message: "Product not found in cart or cart deleted.",
      });
    }

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Cart updated successfully.",
      cart,
    });
  } catch (error) {
    res.status(httpStatusCode.BAD_REQUEST.code).json({
      success: false,
      message: error.message || "Failed to update cart.",
    });
  }
};

export const removeFormCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const cart = await removeCartService(userId, productId);

    if (!cart) {
      return res.status(httpStatusCode.OK.code).json({
        success: true,
        message: "Item removed. Cart is now empty.",
        cart: { items: [] },
      });
    }

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Product removed from cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while removing the product from cart.",
    });
  }
};
