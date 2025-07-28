import { User } from '../../models/userModels.js';
import { Order } from '../../models/order.js';


export const getAdminDashboardPageDataService = async () => {
  const userCount = await User.countDocuments({});

  const orderCount = await Order.countDocuments({});

  const deliveredOrders = await Order.find({ orderStatus: "Delivered" });
  const totalSales = deliveredOrders.reduce((acc, curr) => {
    acc += curr.totalAmount;
    return acc;
  }, 0)


  const bestTenProducts = await Order.aggregate([
    { $match: { orderStatus: "Delivered" } },
    { $unwind: "$items" },
    { $group: { _id: "$items.productId", productName: { $first: "$items.productName" }, totalQuantity: { $sum: "$items.quantity" } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, productName: 1, totalQuantity: 1, totalAmount: 1 } }
  ]);

  // console.log(bestTenProducts);

  // const sum =  bestTenProducts.reduce((acc,curr)=>{
  //   acc += curr.totalAmount;
  //   return acc;
  // },0);
  // console.log("Sum",sum);


  const bestTenBrands = await Order.aggregate([
    { $match: { orderStatus: "Delivered" } },
    { $unwind: "$items" },
    { $group: { _id: "$items.brand", brand: { $first: "$items.brand" }, totalQuantity: { $sum: "$items.quantity" } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, brand: 1, totalQuantity: 1 } }
  ]);

  const bestTenCategory = await Order.aggregate([
    { $match: { orderStatus: "Delivered" } },
    { $unwind: "$items" },
    { $unwind: "$items.category" },
    {
      $group: {
        _id: "$items.category",
        totalQuantity: { $sum: "$items.quantity" }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    { $unwind: "$categoryDetails" },
    {
      $project: {
        _id: 0,
        categoryName: "$categoryDetails.categoryName",
        totalQuantity: 1
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
  ]);




  // console.log(bestTenCategory);


  return {
    userCount,
    orderCount,
    totalSales,
    bestTenProducts,
    bestTenProducts,
    bestTenCategory,
    bestTenBrands
  }
}


export const getAdminDashboardChartService = async (req) => {
  const {
    range,
    customStart,
    customEnd,
    timezone = "Asia/Kolkata",
    aggregateBy = "totalAmount",
  } = req.query;

  const startInput = customStart;
  const endInput = customEnd;

  let endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  let startDate = new Date(endDate);

  switch (range) {
    case "daily":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(23, 59, 59, 999);
      break;
    case "monthly":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      startDate = new Date(endDate.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "custom":
      startDate = new Date(startInput);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endInput);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  let groupFormat = "%Y-%m-%d";
  if (range === "daily") groupFormat = "%Y-%m-%d %H:00";
  if (range === "monthly") groupFormat = "%Y-%m-%d";
  if (range === "yearly") groupFormat = "%Y-%m";

  const sales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: "$createdAt",
            timezone,
          },
        },
        value:
          aggregateBy === "orderCount"
            ? { $sum: 1 }
            : { $sum: `$${aggregateBy}` },
      },
    },
  ]);

  const dataMap = {};
  for (const item of sales) {
    dataMap[item._id] = item.value;
  }

  const chartLabels = [];
  const chartValues = [];

  if (range === "daily") {
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const label = cursor.toISOString().slice(0, 13) + ":00";
      chartLabels.push(label.replace("T", " "));
      chartValues.push(dataMap[label.replace("T", " ")] || 0);
      cursor.setHours(cursor.getHours() + 1);
    }
  } else if (range === "monthly") {
    const weekBuckets = [0, 0, 0, 0];
    const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    Object.entries(dataMap).forEach(([dateStr, value]) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      weekBuckets[weekIndex] += value;
    });
    chartLabels.push(...weekLabels);
    chartValues.push(...weekBuckets);
  } else if (range === "yearly") {
    for (let month = 0; month < 12; month++) {
      const label = `${startDate.getFullYear()}-${String(month + 1).padStart(2, "0")}`;
      chartLabels.push(label);
      chartValues.push(dataMap[label] || 0);
    }
  } else {
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const label = cursor.toISOString().split("T")[0];
      chartLabels.push(label);
      chartValues.push(dataMap[label] || 0);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return { chartLabels, chartValues };
};
