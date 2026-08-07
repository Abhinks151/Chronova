// utils/addressValidation.js

export const validateAddress = (body) => {
  const { addressName, fullName, phone, pincode, addressLine, city, state, country, landmark } = body;

  if (!addressName) {
    return 'Address name is required';
  }
  if (addressName.length < 2) {
    return 'Address name can not be less than 2 characters';
  }
  if (!/^[A-Za-z0-9\s]+$/.test(addressName)) {
    return 'Address name can only have letters and numbers.';
  }

  if (!fullName) {
    return 'Full name is required';
  }
  if (fullName.length < 2) {
    return 'Full name can not be less than 2 characters';
  }
  if (!/^[A-Za-z\s]+$/.test(fullName)) {
    return 'Full name can only have letters.';
  }

  if (!phone) {
    return 'Phone number is required';
  }
  if (phone.length !== 10) {
    return 'Phone number can not be less than 10 numbers';
  }
  if (!/^\+?[\d\s-()]{10,}$/.test(phone)) {
    return 'Phone number can only have numbers and special characters.';
  }

  if (!pincode) {
    return 'Pincode is required';
  }
  if (pincode.length < 6) {
    return 'Pincode can not be less than 6 numbers';
  }
  if (!/^\d{6}$/.test(pincode)) {
    return 'Pincode can only have numbers.';
  }

  if (!addressLine) {
    return 'Address line is required';
  }
  if (addressLine.length < 2) {
    return 'Address line can not be less than 2 characters';
  }
  if (!/^[A-Za-z0-9\s]+$/.test(addressLine)) {
    return 'Address line can only have letters and numbers.';
  }

  if (!city) {
    return 'City is required';
  }
  if (city.length < 2) {
    return 'City can not be less than 2 characters';
  }
  if (!/^[A-Za-z\s]+$/.test(city)) {
    return 'City can only have letters.';
  }

  if (!state) {
    return 'State is required';
  }
  if (state.length < 2) {
    return 'State can not be less than 2 characters';
  }
  if (!/^[A-Za-z\s]+$/.test(state)) {
    return 'State can only have letters.';
  }

  if (!country) {
    return 'Country is required';
  }
  if (country.length < 2) {
    return 'Country can not be less than 2 characters';
  }
  if (!/^[A-Za-z\s]+$/.test(country)) {
    return 'Country can only have letters.';
  }

  if (landmark && landmark.length < 2) {
    return 'Landmark can not be less than 2 characters';
  }
  if (landmark && !/^[A-Za-z0-9\s]+$/.test(landmark)) {
    return 'Landmark can only have letters and numbers.';
  }

  return null;
};
