import { validateAndUpdateUser } from "../../servises/user/editProfileDetails.js"
import httpStatusCode from "../../utils/httpStatusCode.js"

export const updateUserData = async (req, res) => {
  try {
    const result = await validateAndUpdateUser(req.user._id, req.body)

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      })
    }

    res.status(result.status).json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error(error)
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal server error"
    })
  }
}
