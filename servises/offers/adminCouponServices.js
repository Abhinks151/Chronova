import { Coupon } from "../../models/coupon.js";
import { logger } from "../../config/logger.js";

export const getCouponManagemntPageDataService = async (
  filterConditions = {},
  sortConditions = { createdAt: -1 },
  skip = 0,
  limit = 10
) => {
  try {
    const totalCount = await Coupon.countDocuments(filterConditions);

    const coupons = await Coupon.find(filterConditions)
      .sort(sortConditions)
      .skip(skip)
      .limit(limit)
      .lean();

    logger.info("Successfully fetched coupons");

    return {
      coupons,
      totalCount,
    };
  } catch (error) {
    logger.error(`Error fetching coupons: ${error.message}`);
    throw new Error(`Error fetching coupons: ${error.message}`);
  }
};

export const createCouponService = async (data) => {
  let { coupon, discountAmount, minimumCartAmount, expiryTime } = data;

  const parsedDiscountAmount = Number(discountAmount);
  const parsedMinimumCartAmount = Number(minimumCartAmount);
  const parsedExpiryTime = new Date(expiryTime);

  if (isNaN(parsedDiscountAmount) || parsedDiscountAmount <= 0) {
    throw new Error("Discount amount must be a positive number.");
  }

  if (isNaN(parsedMinimumCartAmount) || parsedMinimumCartAmount < 0) {
    throw new Error("Minimum cart amount must be a non-negative number.");
  }

  if (isNaN(parsedExpiryTime.getTime())) {
    throw new Error("Expiry time must be a valid date.");
  }

  if (coupon && typeof coupon === "string" && coupon.trim() !== "") {
    coupon = coupon.trim();

    if (coupon.length != 8) {
      throw new Error("Coupon code must be 8 characters long.");
    }

    const modifiedCoupon = "COUPON-" + coupon.toUpperCase();
    coupon = modifiedCoupon;

    const doesExist = await Coupon.findOne({ coupon });
    if (doesExist) {
      throw new Error("Coupon code already exists.");
    }
  } else {
    coupon = undefined;
  }

  const newCoupon = await Coupon.create({
    coupon,
    discountAmount: parsedDiscountAmount,
    minimumCartAmount: parsedMinimumCartAmount,
    expiryTime: parsedExpiryTime,
  });

  logger.info(`Successfully created new coupon: ${newCoupon.coupon}`);

  return newCoupon;
};

export const editCouponService = async (couponId, updateData) => {
  let { coupon, discountAmount, minimumCartAmount, expiryTime } = updateData;

  const parsedDiscountAmount = Number(discountAmount);
  const parsedMinimumCartAmount = Number(minimumCartAmount);
  const parsedExpiryTime = new Date(expiryTime);

  if (isNaN(parsedDiscountAmount) || parsedDiscountAmount <= 0) {
    throw new Error("Discount amount must be a positive number.");
  }

  if (isNaN(parsedMinimumCartAmount) || parsedMinimumCartAmount < 0) {
    throw new Error("Minimum cart amount must be a non-negative number.");
  }

  if (isNaN(parsedExpiryTime.getTime())) {
    throw new Error("Expiry time must be a valid date.");
  }

  const updatePayload = {
    discountAmount: parsedDiscountAmount,
    minimumCartAmount: parsedMinimumCartAmount,
    expiryTime: parsedExpiryTime,
  };

  if (coupon && typeof coupon === "string" && coupon.trim() !== "") {
    coupon = coupon.trim().toUpperCase();

    if (coupon.length !== 8) {
      throw new Error("Coupon code must be 8 characters long.");
    }

    const formattedCoupon = `COUPON-${coupon}`;

    const doesExists = await Coupon.findOne({
      coupon: formattedCoupon,
      _id: { $ne: couponId },
    });

    if (doesExists) {
      throw new Error("Coupon code already exists.");
    }

    updatePayload.coupon = formattedCoupon;
  }

  const updatedCoupon = await Coupon.findOneAndUpdate(
    { _id: couponId, isDeleted: false },
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  if (!updatedCoupon) {
    throw new Error("Coupon not found");
  }

  logger.info(`Successfully updated coupon: ${updatedCoupon.coupon}`);

  return updatedCoupon;
};

export const toggleActiveStatusService = async (couponId) => {
  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    throw new Error("Coupon not found");
  }

  coupon.isActive = !coupon.isActive;

  await coupon.save();

  logger.info(`Successfully toggled active status of coupon: ${coupon.coupon}`);

  return coupon;
};

export const deleteCouponService = async (couponId) => {
  const coupon = await Coupon.find({ _id: couponId, isDeleted: false });

  if (!coupon) {
    throw new Error("Coupon not found ");
  }

  coupon.isDeleted = true;
  await coupon.save();

  logger.info(`Successfully deleted coupon: ${coupon.coupon}`);

  return coupon;
};
