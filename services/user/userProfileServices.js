
import { Address } from '../../models/address.js';
import { User } from '../../models/userModels.js'
import httpStatusCode from '../../utils/httpStatusCode.js'
import { sendVerificationOTP } from '../../utils/sendVerificationOTP.js';

export const validateAndUpdateUser = async (userId, userData) => {
  let { firstname, lastname, phone } = userData

  firstname = firstname?.trim()
  lastname = lastname?.trim()
  phone = phone?.trim()

  if (!firstname || !lastname || !phone) {
    return {
      success: false,
      status: httpStatusCode.BAD_REQUEST.code,
      message: "All fields are required"
    }
  }

  if (firstname.length < 2 || lastname.length < 2) {
    return {
      success: false,
      status: httpStatusCode.BAD_REQUEST.code,
      message: "First name and last name must be at least 2 characters long"
    }
  }

  if (!/^[a-zA-Z]+$/.test(firstname) || !/^[a-zA-Z]+$/.test(lastname)) {
    return {
      success: false,
      status: httpStatusCode.BAD_REQUEST.code,
      message: "First name and last name can only contain letters"
    }
  }

  if (phone.length !== 10 || !/^[0-9]+$/.test(phone)) {
    return {
      success: false,
      status: httpStatusCode.BAD_REQUEST.code,
      message: "Phone number must be exactly 10 digits and contain only numbers"
    }
  }

  const user = await User.findById(userId)
  if (!user) {
    return {
      success: false,
      status: httpStatusCode.UNAUTHORIZED.code,
      message: "User not found"
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, {
    firstname,
    lastname,
    phone
  }, { new: true })

  return {
    success: true,
    status: httpStatusCode.OK.code,
    data: updatedUser
  }
}

export const finduserById = async (userId) => {
  return await User.findById(userId);
}

export const finduserByEmail = async (email) => {
  return await User.findOne({ email });
}


export const changeEmail = async (req, userId, newEmail) => {
  const user = await User.findById(userId);

  if (!user) {
    return {
      success: false,
      message: "User not found"
    };
  }

  if (user.email === newEmail || user.newEmail === newEmail) {
    return {
      success: false,
      message: "This email is already in use."
    };
  }

  user.newEmail = newEmail;
  await user.save();

  req.session.emailForVerification = newEmail;
  req.session.userIdForVerification = user._id.toString();

  await sendVerificationOTP(user, newEmail);

  return {
    success: true,
    message: "OTP sent successfully to your new email."
  };
};




export const getAllAddress = async (userId) => {
  const addresses = await Address.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).lean();
  return addresses;
}

export const addAddressService = async (userId, data) => {
  // const address = data
  // const {addressName,fullName,phone,pincode,addressLine,city,state,country,countryCode,landmark,isDefault} = data;
  // console.log(data);
  data.userId = userId;

  const address = new Address(data);
  await address.save();
  if (address.isDefault === true) {
    await Address.updateMany({ userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
  }
  return address;
}

export const editAddressService = async (addressId, data) => {
  const updatedAddress = await Address.findByIdAndUpdate(
    addressId,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (updatedAddress.isDefault === true) {
    await Address.updateMany({ userId: updatedAddress.userId, _id: { $ne: updatedAddress._id } }, { $set: { isDefault: false } });
  }
  return updatedAddress;
};

export const editDefaultByIdService = async (userId, addressId) => {
  await Address.updateOne({ userId, _id: addressId }, { $set: { isDefault: true } });
  const address = await Address.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });
  return address;
}

export const deleteAddressService = async (addressId) => {
  const address = await Address.findById(addressId);
  address.isDeleted = true;
  await address.save();
  return address;
}


