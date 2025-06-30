import { getCartedProducts } from "../../servises/user/cartServices.js";


export const getCheckoutPage = (req, res) => {
  res.render('Layouts/users/checkout');
}


export const getCheckoutPageData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const checkoutData = await getCartedProducts(userId);

    if (!checkoutData || checkoutData.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Your cart is empty.',
        checkoutData: { items: [] }
      });
    }
    res.status(200).json({
      success: true,
      message: 'Checkout page data fetched successfully.',
      checkoutData
    });
  } catch (error) {
    console.error('Error fetching checkout page data:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching checkout page data.'
    });

  }


}