
import { addAddressService, changeEmail, deleteAddressService, editAddressService, editDefaultByIdService, finduserById, getAllAddress, validateAndUpdateUser } from "../../servises/user/userProfileServices.js"
import httpStatusCode from "../../utils/httpStatusCode.js"
import { sendResetPasswordToken } from "../../utils/sendVerificationOTP.js";


export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let user = await finduserById(userId);
    user = user.toObject();
    if (!user) {
      return res.status(httpStatusCode.NOT_FOUND.code).redirect('/user/products');
    }

    user.address = await getAllAddress(userId);
    console.log(user);
    res.render('Layouts/users/userAccountPage', {
      user
    });
  } catch (err) {
    console.error('Error loading user profile:', err);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('Layouts/users/userAccountPage', { 
      message: 'Internal Server Error',
      user : null
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
    console.log(error);
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
    if(!newEmail){
      return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/users/changeEmail', {
        success: null,
        error: "Email is required"
      })
    }
    if(newEmail === req.user.email){
      return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/users/changeEmail', {
        success: null,
        error: "This email is already in use."
      })
    }
    if(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(newEmail)){
      return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/users/changeEmail', {
        success: null,
        error: "Invalid email address"
      })
    }
    const result = await changeEmail(req,userId, newEmail);

    if (!result.success) {
      return res.status(httpStatusCode.NOT_FOUND.code).render('Layouts/users/changeEmail', {
        error: result.message,
        success: null
      });
    }

    res.status(httpStatusCode.OK.code).redirect('/user/verify-otp');
  } catch (error) {
    console.error(error);
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
    console.error(error)
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Internal server error"
    })
  }
}

export const getAddressMangemnt = async (req, res) => {
  try {
    res.render('Layouts/users/userAddressManagement');
  } catch (error) {
    console.error("Error loading user address management page:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const getAddress = async (req, res) => {
  try {
    // console.log(addresses)
    const addresses = await getAllAddress(req.user._id)
    res.json({
      success: true,
      addresses: addresses
    })
  } catch (error) {
    console.error("Error loading user address management page:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const addAddress = async (req, res) => {
  try {
    // console.log(req.body)

    if (!req.user._id) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "Something went wrong"
      })
    }
    const { addressName, fullName, phone, pincode, addressLine, city, state, country, landmark } = req.body;

    if (!addressName) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address name is required',
      });
    }

    if (addressName.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address name can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z0-9\s]+$/.test(addressName)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address name can only have letters and numbers.',
      });
    }

    if (!fullName) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (fullName.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Full name can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(fullName)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Full name can only have letters.',
      });
    }

    if (!phone) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (phone.length < 10) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Phone number can not be less than 10 numbers',
      });
    }

    if (!/^\+?[\d\s-()]{10,}$/.test(phone)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Phone number can only have numbers and special characters.',
      });
    }

    if (!pincode) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Pincode is required',
      });
    }

    if (pincode.length < 6) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Pincode can not be less than 6 numbers',
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Pincode can only have numbers.',
      });
    }

    if (!addressLine) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address line is required',
      });
    }

    if (addressLine.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address line can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z0-9\s]+$/.test(addressLine)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address line can only have letters and numbers.',
      });
    }

    if (!city) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'City is required',
      });
    }

    if (city.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'City can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(city)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'City can only have letters.',
      });
    }

    if (!state) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'State is required',
      });
    }

    if (state.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'State can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(state)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'State can only have letters.',
      });
    }

    if (!country) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Country is required',
      });
    }

    if (country.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Country can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(country)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Country can only have letters.',
      });
    }

    if (landmark && landmark.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Landmark can not be less than 2 characters',
      });
    }

    if (landmark && !/^[A-Za-z0-9\s]+$/.test(landmark)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Landmark can only have letters and numbers.',
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
    console.log(error);
    res.status(500).json({
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
    const { addressName, fullName, phone, pincode, addressLine, city, state, country, landmark } = req.body;

    if (!addressName) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address name is required',
      });
    }

    if (addressName.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address name can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z0-9\s]+$/.test(addressName)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address name can only have letters and numbers.',
      });
    }

    if (!fullName) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (fullName.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Full name can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(fullName)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Full name can only have letters.',
      });
    }

    if (!phone) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (phone.length < 10) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Phone number can not be less than 10 numbers',
      });
    }

    if (!/^\+?[\d\s-()]{10,}$/.test(phone)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Phone number can only have numbers and special characters.',
      });
    }

    if (!pincode) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Pincode is required',
      });
    }

    if (pincode.length < 6) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Pincode can not be less than 6 numbers',
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Pincode can only have numbers.',
      });
    }

    if (!addressLine) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address line is required',
      });
    }

    if (addressLine.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address line can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z0-9\s]+$/.test(addressLine)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Address line can only have letters and numbers.',
      });
    }

    if (!city) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'City is required',
      });
    }

    if (city.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'City can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(city)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'City can only have letters.',
      });
    }

    if (!state) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'State is required',
      });
    }

    if (state.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'State can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(state)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'State can only have letters.',
      });
    }

    if (!country) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Country is required',
      });
    }

    if (country.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Country can not be less than 2 characters',
      });
    }

    if (!/^[A-Za-z\s]+$/.test(country)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Country can only have letters.',
      });
    }

    if (landmark && landmark.length < 2) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Landmark can not be less than 2 characters',
      });
    }

    if (landmark && !/^[A-Za-z0-9\s]+$/.test(landmark)) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: 'Landmark can only have letters and numbers.',
      });
    }
    const editedAddress = await editAddressService(addressId, req.body);
    res.json({
      success: true,
      message: "Address updated",
      address: editedAddress
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
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
    console.log(error);
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
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}