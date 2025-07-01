import { getCartedProducts } from "../../servises/user/cartServices.js";
import { getSingleOrderService, orderListByUserId, placeOrderService } from "../../servises/user/orderService.js";
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
    // console.log(data);
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
    const { orderId } = req.query;
    // console.log(orderId);

    res.status(httpStatusCode.OK.code).render('Layouts/users/orderConform', {
      orderId,
    });
  } catch (error) {
    console.error('Error rendering order confirmation page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong while rendering the order confirmation page.',
    });
  }
};


export const getOrderMangementPage = (req, res) => {
  try {
    res.render('Layouts/users/orders');
  } catch (error) {
    console.error('Error rendering order management page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong while rendering the order management page.'
    });
  }
}

export const getOrderMangementPageData = async (req, res) => {
  const userId = req.user._id || req.user.id;
  if (!userId) {
    return res.status(httpStatusCode.UNAUTHORIZED.code).json({
      success: false,
      message: 'User not authenticated.'
    });
  }
  const orders = await orderListByUserId(userId)
  res.json({
    success: true,
    orders
  })
}


export const getSingleOrderController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const orderId = req.params.orderId;
    if (!userId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Order ID are required.'
      });
    }
    const order = await getSingleOrderService(userId, orderId);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching single order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};