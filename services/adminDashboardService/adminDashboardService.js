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
		{ $project: { _id: 0, productName: 1, totalQuantity: 1 } }
	]);

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
	const { range, customStart, customEnd } = req.query;

	let matchStage = {};
	let groupStage = {};
	const today = new Date();

	if (customStart && customEnd) {
		const startDate = new Date(customStart);
		const endDate = new Date(customEnd);
		endDate.setHours(23, 59, 59, 999);

		matchStage.createdAt = { $gte: startDate, $lte: endDate };

		const diffInDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

		let format;
		if (diffInDays <= 31) {
			format = "%Y-%m-%d";
		} else if (diffInDays <= 365) {
			format = "%Y-%m";
		} else {
			format = "%Y";
		}

		groupStage = {
			_id: { $dateToString: { format: format, date: "$createdAt" } },
			total: { $sum: "$totalAmount" }
		};
	} else {
		switch (range) {
			case "daily":
				const start = new Date();
				start.setDate(today.getDate() - 1);
				matchStage.createdAt = { $gte: start, $lte: today };
				groupStage = {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					total: { $sum: "$totalAmount" }
				};
				break;
			case "weekly":
				const startWeek = new Date();
				startWeek.setDate(today.getDate() - 6);
				matchStage.createdAt = { $gte: startWeek, $lte: today };
				groupStage = {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					total: { $sum: "$totalAmount" }
				}
				break;
			case "monthly":
				const startMonth = new Date();
				startMonth.setMonth(today.getMonth() - 11);
				matchStage.createdAt = { $gte: startMonth, $lte: today };
				groupStage = {
					_id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
					total: { $sum: "$totalAmount" }
				};
				break;
			case "yearly":
				const startYear = new Date();
				startYear.setFullYear(today.getFullYear() - 4);
				matchStage.createdAt = { $gte: startYear, $lte: today };
				groupStage = {
					_id: { $dateToString: { format: "%Y", date: "$createdAt" } },
					total: { $sum: "$totalAmount" }
				};
				break;
			default:
				throw new Error("Invalid range");
		}
	}

	const sales = await Order.aggregate([
		{ $match: matchStage },
		{ $group: groupStage },
		{ $sort: { _id: 1 } }
	]);

	const chartLabels = sales.map((sale) => sale._id);
	const chartValues = sales.map((sale) => sale.total);

	return {
		chartLabels,
		chartValues
	};
};
