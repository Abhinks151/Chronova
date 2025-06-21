import { User } from '../../models/userModels.js'
import httpStatusCode from '../../utils/httpStatusCode.js'

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
  return await User.findById(userId)
}
