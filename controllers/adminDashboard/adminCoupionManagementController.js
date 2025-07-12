import httpStatusCOde from "../../utils/httpStatusCode.js";

export const getCouponManagemntPage = (req, res) => {
  try {
    res
      .status(httpStatusCOde.OK.code)
      .render("Layouts/adminDashboard/couponManagement");
  } catch (error) {
    console.log(error);
    res.status(httpStatusCOde.INTERNAL_SERVER_ERROR.code).render("error", {
      error,
    });
  }
};
