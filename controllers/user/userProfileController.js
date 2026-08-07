
import { User } from "../../models/userModels.js";
import { addAddressService, changeEmail, deleteAddressService, editAddressService, editDefaultByIdService, finduserByEmail, finduserById, getAllAddress, validateAndUpdateUser } from "../../services/user/userProfileService.js"
import cloudinary from "../../utils/cloudinary.js";
import httpStatusCode from "../../utils/httpStatusCode.js"
import { sendResetPasswordToken } from "../../utils/sendVerificationOTP.js";
import { validateAddress } from "../../utils/addressValidation.js";
import { logger } from '../../config/logger.js';


export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let user = await finduserById(userId);
    user = user.toObject();
    if (!user) {
      return res.status(httpStatusCode.NOT_FOUND.code).redirect('/user/products');
    }

    user.address = await getAllAddress(userId);
    // logger.info(user);
    res.render('Layouts/users/userAccountPage', {
      user
    });
  } catch (err) {
    logger.error('Error loading user profile:', err);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('Layouts/users/userAccountPage', {
      message: 'Internal Server Error',
      user: null
    });
  }
}

export const sentPasswordReset = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await finduserById(userId);
    await sendResetPasswordToken(user);
    res.status(httpStatusCode.OK.code).json({
      success: true
    })
  } catch (error) {
    logger.info(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false
    })
  }
}

export const getChangeEmail = async (req, res) => {
  res.status(httpStatusCode.OK.code).render('Layouts/users/changeEmail', {
    success: null,
    error: null
  });
}

export const postChangeEmail = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { newEmail } = req.body;
    if (!newEmail) {
      return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/users/changeEmail', {
        success: null,
        error: "Email is required"
      })
    }
    if (newEmail === req.user.email) {
      return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/users/changeEmail', {
        success: null,
        error: "This email is already in use."
      })
    }

    const emailExist = await finduserByEmail(newEmail);
    if (emailExist) {
      return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/users/changeEmail', {
        success: null,
        error: "This email is already in use by another user."
      })
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(newEmail)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/users/changeEmail', {
        success: null,
        error: "Invalid email address"
      })
    }
    const result = await changeEmail(req, userId, newEmail);

    if (!result.success) {
      return res.status(httpStatusCode.NOT_FOUND.code).render('Layouts/users/changeEmail', {
        error: result.message,
        success: null
      });
    }

    res.status(httpStatusCode.OK.code).redirect('/user/verify-otp');
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal server error",
    });
  }
};

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
    logger.error(error)
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal server error"
    })
  }
}




export const getAddressMangemnt = async (req, res) => {
  try {
    res.render('Layouts/users/userAddressmanagement');
  } catch (error) {
    logger.error("Error loading user address management page:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const getAddress = async (req, res) => {
  try {
    // logger.info(addresses)
    const addresses = await getAllAddress(req.user._id)
    res.json({
      success: true,
      addresses: addresses
    })
  } catch (error) {
    logger.error("Error loading user address management page:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const addAddress = async (req, res) => {
  try {
    // logger.info(req.body)

    if (!req.user._id) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Something went wrong"
      })
    }

    const validationError = validateAddress(req.body);
    if (validationError) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: validationError
      });
    }
    const newAddress = await addAddressService(req.user._id, req.body)
    // addresses.push(newAddress)



    res.json({
      success: true,
      message: "Address added successfully",
      address: newAddress
    })
  } catch (error) {
    logger.info(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const editAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    if (!addressId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Something went wrong"
      })
    }
    if (!req.user._id) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Something went wrong"
      })
    }
    const validationError = validateAddress(req.body);
    if (validationError) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: validationError
      });
    }
    const editedAddress = await editAddressService(addressId, req.body);
    res.json({
      success: true,
      message: "Address updated",
      address: editedAddress
    });
  } catch (error) {
    logger.error("Error updating address:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

export const editDefaultById = async (req, res) => {
  try {


    if (!req.params.id) {
      return res.json({
        success: false,
        message: "Somethign went wrong"
      })
    }

    const address = await editDefaultByIdService(req.user.id, req.params.id);

    res.json({
      success: true,
      message: "Default address changed",
      address
    })
  } catch (error) {
    logger.info(error);
    res.json({
      success: false,
      message: "Updation failed"
    })
  }
}

export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    if (!addressId) {
      return res.json({
        success: false,
        message: "Something went wrong"
      })
    }
    const address = await deleteAddressService(addressId);
    res.json({
      success: true,
      message: "Address deleted",
      address
    });
  } catch (error) {
    logger.error("Error deleting address:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

export const updateAvatarImage = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!req.file) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'No avatar file uploaded'
      });
    }

    const image = {
      url: req.file.path,
      public_id: req.file.filename
    };

    const existingUser = await User.findById(userId);
    if (existingUser?.avatar?.public_id) {
      await cloudinary.uploader.destroy(existingUser.avatar.public_id);
    }


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: image },
      { new: true }
    );

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: 'Avatar updated successfully',
      data: updatedUser
    });

  } catch (error) {
    logger.error('Error in updateAvatarImage:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};