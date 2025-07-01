import { getCartedProducts } from "../../servises/user/cartServices.js";
import { placeOrderService } from "../../servises/user/orderService.js";
import httpStatusCode from "../../utils/httpStatusCode.js";

export const getCheckoutPage = (req, res) => {
  try {
    res.render('Layouts/users/checkout');
  } catch (error) {
    console.error('Error rendering checkout page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong while rendering the checkout page.'
    });
  }

}



export const getCheckoutPageData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const checkoutData = await getCartedProducts(userId);

    if (!checkoutData || checkoutData.items.length === 0) {
      return res.status(httpStatusCode.OK.code).json({
        success: true,
        message: 'Your cart is empty.',
        checkoutData: { items: [] }
      });
    }
    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: 'Checkout page data fetched successfully.',
      checkoutData
    });
  } catch (error) {
    console.error('Error fetching checkout page data:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong while fetching checkout page data.'
    });

  }


}

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const data = await placeOrderService(userId, req.body);
    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: 'Order placed successfully.',
      data
    });
  } catch (error) {
    console.log('Error placing order:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong while placing the order.',
      error: error.message || 'Internal Server Error'
    });
  }
}

export const getConformPage = (req, res) => {
  try {
    res.status(httpStatusCode.OK.code).render('Layouts/users/orderConform', {
      orderId: 'ORD-18372872',
      userEmail: 'abhin@gmail.com'
    });
  } catch (error) {
    console.error('Error rendering order confirmation page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong while rendering the order confirmation page.'
    });
  }
}