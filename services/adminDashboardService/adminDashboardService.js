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

// export const getAdminDashboardChartService = async (req) => {
// 	const { range, customStart, customEnd, timezone = 'UTC', aggregateBy = 'totalAmount' } = req.query;

// 	let matchStage = {};
// 	let groupStage = {};
// 	const today = new Date();
// 	let startDate, endDate, format;

// 	// Input validation
// 	if (customStart && customEnd) {
// 		const start = new Date(customStart);
// 		const end = new Date(customEnd);

// 		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
// 			throw new Error("Invalid date format");
// 		}
// 		if (start >= end) {
// 			throw new Error("Start date must be before end date");
// 		}

// 		startDate = start;
// 		endDate = end;
// 		endDate.setHours(23, 59, 59, 999);

// 		matchStage.createdAt = { $gte: startDate, $lte: endDate };

// 		const diffInDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
// 		if (diffInDays <= 1) {
// 			format = "%Y-%m-%dT%H";
// 		} else if (diffInDays <= 31) {
// 			format = "%Y-%m-%d";
// 		} else if (diffInDays <= 365) {
// 			format = "%Y-%m";
// 		} else {
// 			format = "%Y";
// 		}

// 		groupStage = {
// 			_id: { $dateToString: { format: format, date: "$createdAt", timezone: timezone } },
// 			total: { $sum: `$${aggregateBy}` },
// 			count: { $sum: 1 },
// 			average: { $avg: `$${aggregateBy}` }
// 		};
// 	} else {
// 		if (!["daily", "weekly", "monthly", "yearly"].includes(range)) {
// 			throw new Error("Invalid range. Must be one of: daily, weekly, monthly, yearly");
// 		}

// 		switch (range) {
// 			case "daily":
// 				startDate = new Date();
// 				startDate.setHours(0, 0, 0, 0);
// 				endDate = new Date();
// 				endDate.setHours(23, 59, 59, 999);

// 				matchStage.createdAt = { $gte: startDate, $lte: endDate };
// 				format = "%Y-%m-%dT%H";
// 				groupStage = {
// 					_id: { $dateToString: { format, date: "$createdAt", timezone: timezone } },
// 					total: { $sum: `$${aggregateBy}` },
// 					count: { $sum: 1 },
// 					average: { $avg: `$${aggregateBy}` }
// 				};
// 				break;

// 			case "weekly":
// 				startDate = new Date();
// 				startDate.setDate(today.getDate() - 6);
// 				startDate.setHours(0, 0, 0, 0);
// 				endDate = new Date();
// 				endDate.setHours(23, 59, 59, 999);

// 				matchStage.createdAt = { $gte: startDate, $lte: endDate };
// 				format = "%Y-%m-%d";
// 				groupStage = {
// 					_id: { $dateToString: { format, date: "$createdAt", timezone: timezone } },
// 					total: { $sum: `$${aggregateBy}` },
// 					count: { $sum: 1 },
// 					average: { $avg: `$${aggregateBy}` }
// 				};
// 				break;

// 			case "monthly":
// 				startDate = new Date();
// 				startDate.setMonth(today.getMonth() - 11);
// 				startDate.setDate(1);
// 				startDate.setHours(0, 0, 0, 0);
// 				endDate = new Date();
// 				endDate.setHours(23, 59, 59, 999);

// 				matchStage.createdAt = { $gte: startDate, $lte: endDate };
// 				format = "%Y-%m";
// 				groupStage = {
// 					_id: { $dateToString: { format, date: "$createdAt", timezone: timezone } },
// 					total: { $sum: `$${aggregateBy}` },
// 					count: { $sum: 1 },
// 					average: { $avg: `$${aggregateBy}` }
// 				};
// 				break;

// 			case "yearly":
// 				startDate = new Date();
// 				startDate.setFullYear(today.getFullYear() - 4);
// 				startDate.setMonth(0, 1);
// 				startDate.setHours(0, 0, 0, 0);
// 				endDate = new Date();
// 				endDate.setHours(23, 59, 59, 999);

// 				matchStage.createdAt = { $gte: startDate, $lte: endDate };
// 				format = "%Y";
// 				groupStage = {
// 					_id: { $dateToString: { format, date: "$createdAt", timezone: timezone } },
// 					total: { $sum: `$${aggregateBy}` },
// 					count: { $sum: 1 },
// 					average: { $avg: `$${aggregateBy}` }
// 				};
// 				break;
// 		}
// 	}

// 	// Enhanced aggregation pipeline with additional filtering and sorting options
// 	const pipeline = [
// 		{ $match: matchStage },
// 		{ $group: groupStage },
// 		{ $sort: { _id: 1 } }
// 	];

// 	// Add conditional stages for better performance
// 	if (req.query.minAmount) {
// 		pipeline.unshift({ $match: { [`${aggregateBy}`]: { $gte: parseFloat(req.query.minAmount) } } });
// 	}
// 	if (req.query.maxAmount) {
// 		pipeline.unshift({ $match: { [`${aggregateBy}`]: { $lte: parseFloat(req.query.maxAmount) } } });
// 	}
// 	if (req.query.status) {
// 		pipeline.unshift({ $match: { status: req.query.status } });
// 	}

// 	// Fetch sales data from Mongo with error handling
// 	let sales;
// 	try {
// 		sales = await Order.aggregate(pipeline);
// 	} catch (error) {
// 		throw new Error(`Database aggregation failed: ${error.message}`);
// 	}

// 	// Enhanced data processing with better mapping
// 	const salesMap = new Map();
// 	const countMap = new Map();
// 	const averageMap = new Map();

// 	sales.forEach(sale => {
// 		salesMap.set(sale._id, sale.total || 0);
// 		countMap.set(sale._id, sale.count || 0);
// 		averageMap.set(sale._id, sale.average || 0);
// 	});

// 	const buckets = generateTimeBuckets(range, startDate, endDate, timezone);

// 	const chartLabels = buckets.map(bucket => formatLabelForDisplay(bucket, range, customStart, customEnd));
// 	const chartValues = buckets.map(bucket => salesMap.get(bucket) || 0);
// 	const chartCounts = buckets.map(bucket => countMap.get(bucket) || 0);
// 	const chartAverages = buckets.map(bucket => averageMap.get(bucket) || 0);

// 	// Calculate additional metrics
// 	const totalRevenue = chartValues.reduce((sum, val) => sum + val, 0);
// 	const totalOrders = chartCounts.reduce((sum, val) => sum + val, 0);
// 	const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
// 	const maxValue = Math.max(...chartValues);
// 	const minValue = Math.min(...chartValues.filter(val => val > 0));

// 	// Calculate growth rate (comparing first and last non-zero values)
// 	const nonZeroValues = chartValues.filter(val => val > 0);
// 	const growthRate = nonZeroValues.length >= 2 
// 		? ((nonZeroValues[nonZeroValues.length - 1] - nonZeroValues[0]) / nonZeroValues[0] * 100)
// 		: 0;

// 	return {
// 		chartLabels,
// 		chartValues,
// 		chartCounts,
// 		chartAverages,
// 		metadata: {
// 			totalRevenue,
// 			totalOrders,
// 			averageOrderValue: Math.round(averageOrderValue * 100) / 100,
// 			maxValue,
// 			minValue: minValue === Infinity ? 0 : minValue,
// 			growthRate: Math.round(growthRate * 100) / 100,
// 			dateRange: {
// 				start: startDate.toISOString(),
// 				end: endDate.toISOString()
// 			},
// 			bucketCount: buckets.length,
// 			timezone,
// 			aggregateBy
// 		}
// 	};
// };

// // Enhanced helper to generate fixed time buckets with timezone support
// function generateTimeBuckets(range, start, end, timezone = 'UTC') {
// 	const result = [];
// 	const cursor = new Date(start);

// 	if (range === "daily") {
// 		cursor.setMinutes(0, 0, 0);
// 		for (let i = 0; i < 24; i++) {
// 			result.push(cursor.toISOString().slice(0, 13)); // "YYYY-MM-DDTHH"
// 			cursor.setHours(cursor.getHours() + 1);
// 		}
// 	} else if (range === "weekly") {
// 		cursor.setHours(0, 0, 0, 0);
// 		for (let i = 0; i < 7; i++) {
// 			result.push(cursor.toISOString().slice(0, 10)); // "YYYY-MM-DD"
// 			cursor.setDate(cursor.getDate() + 1);
// 		}
// 	} else if (range === "monthly") {
// 		cursor.setDate(1);
// 		for (let i = 0; i < 12; i++) {
// 			result.push(cursor.toISOString().slice(0, 7)); // "YYYY-MM"
// 			cursor.setMonth(cursor.getMonth() + 1);
// 		}
// 	} else if (range === "yearly") {
// 		for (let i = 0; i < 5; i++) {
// 			result.push(cursor.getFullYear().toString()); // "YYYY"
// 			cursor.setFullYear(cursor.getFullYear() + 1);
// 		}
// 	} else {
// 		// Custom logic with improved boundary handling
// 		const diffInDays = (end - start) / (1000 * 60 * 60 * 24);

// 		if (diffInDays <= 1) {
// 			cursor.setMinutes(0, 0, 0);
// 			while (cursor <= end) {
// 				result.push(cursor.toISOString().slice(0, 13)); // Hourly
// 				cursor.setHours(cursor.getHours() + 1);
// 			}
// 		} else if (diffInDays <= 31) {
// 			cursor.setHours(0, 0, 0, 0);
// 			while (cursor <= end) {
// 				result.push(cursor.toISOString().slice(0, 10)); // Daily
// 				cursor.setDate(cursor.getDate() + 1);
// 			}
// 		} else if (diffInDays <= 365) {
// 			cursor.setDate(1);
// 			cursor.setHours(0, 0, 0, 0);
// 			while (cursor <= end) {
// 				result.push(cursor.toISOString().slice(0, 7)); // Monthly
// 				cursor.setMonth(cursor.getMonth() + 1);
// 			}
// 		} else {
// 			cursor.setMonth(0, 1);
// 			cursor.setHours(0, 0, 0, 0);
// 			while (cursor <= end) {
// 				result.push(cursor.getFullYear().toString()); // Yearly
// 				cursor.setFullYear(cursor.getFullYear() + 1);
// 			}
// 		}
// 	}

// 	return result;
// }

// // Helper function to format labels for better display
// function formatLabelForDisplay(bucket, range, customStart, customEnd) {
// 	if (customStart && customEnd) {
// 		const diffInDays = (new Date(customEnd) - new Date(customStart)) / (1000 * 60 * 60 * 24);
// 		if (diffInDays <= 1) {
// 			// Format: "10 AM", "2 PM"
// 			const hour = parseInt(bucket.slice(-2));
// 			return hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
// 		} else if (diffInDays <= 31) {
// 			// Format: "Jan 15", "Feb 3"
// 			const date = new Date(bucket);
// 			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
// 		} else if (diffInDays <= 365) {
// 			// Format: "Jan 2024", "Feb 2024"
// 			const date = new Date(bucket + "-01");
// 			return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
// 		}
// 		return bucket;
// 	}

// 	switch (range) {
// 		case "daily":
// 			const hour = parseInt(bucket.slice(-2));
// 			return hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
// 		case "weekly":
// 			const date = new Date(bucket);
// 			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
// 		case "monthly":
// 			const monthDate = new Date(bucket + "-01");
// 			return monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
// 		case "yearly":
// 			return bucket;
// 		default:
// 			return bucket;
// 	}
// }





// export const getAdminDashboardChartService = async () => {
// 	const today = new Date();
// 	const startDate = new Date();
// 	startDate.setDate(today.getDate() - 6); // last 7 days
// 	startDate.setHours(0, 0, 0, 0);
// 	const endDate = new Date();
// 	endDate.setHours(23, 59, 59, 999);

// 	const pipeline = [
// 		{ $match: { createdAt: { $gte: startDate, $lte: endDate } } },
// 		{
// 			$group: {
// 				_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
// 				totalRevenue: { $sum: "$totalAmount" }
// 			}
// 		},
// 		{ $sort: { _id: 1 } }
// 	];

// 	const sales = await Order.aggregate(pipeline);

// 	// Map to chart format
// 	const dateMap = new Map();
// 	sales.forEach(entry => dateMap.set(entry._id, entry.totalRevenue));

// 	const chartLabels = [];
// 	const chartValues = [];

// 	const cursor = new Date(startDate);
// 	for (let i = 0; i < 7; i++) {
// 		const label = cursor.toISOString().slice(0, 10); // "YYYY-MM-DD"
// 		chartLabels.push(label);
// 		chartValues.push(dateMap.get(label) || 0);
// 		cursor.setDate(cursor.getDate() + 1);
// 	}

// 	return { chartLabels, chartValues };
// };











// export const getAdminDashboardChartService = async (req) => {

// 	//today
// 	const endDate = new Date();
// 	endDate.setHours(23, 59, 59, 999);


// 	const startDate = new Date(endDate);
// 	startDate.setDate(startDate.getDate() - 6);
// 	startDate.setHours(0, 0, 0, 0);


// 	const sales = await Order.aggregate([
// 		{
// 			$match: {
// 				createdAt: {
// 					$gte: startDate,
// 					$lte: endDate,
// 				},
// 			},
// 		},
// 		{
// 			$group: {
// 				_id: {
// 					$dateToString: {
// 						format: "%Y-%m-%d",
// 						date: "$createdAt"
// 					},
// 				},
// 				totalRevenue: { $sum: "$totalAmount" },
// 			},
// 		},
// 	]);

// 	const revenueObj = {};
// 	sales.forEach((item) => {
// 		revenueObj[item._id] = item.totalRevenue;
// 	});

// 	const chartLabels = [];
// 	const chartValues = [];

// 	const cursor = new Date(startDate);
// 	for (let i = 0; i < 7; i++) {
// 		const dateStr = cursor.toLocaleDateString("sv-SE");
// 		chartLabels.push(dateStr);
// 		chartValues.push(revenueObj[dateStr] || 0);
// 		cursor.setDate(cursor.getDate() + 1);
// 	}



// 	return {
// 		chartLabels,
// 		chartValues,
// 	};
// };



// export const getAdminDashboardChartService = async (req) => {
// 	const { range, start: customStart, end: customEnd } = req.query;

// 	const endDate = new Date();
// 	endDate.setHours(23, 59, 59, 999);

// 	let startDate = new Date(endDate);

// 	switch (range) {
// 		case "daily":
// 			startDate.setHours(0, 0, 0, 0);
// 			break;

// 		case "weekly":
// 			startDate.setDate(startDate.getDate() - 6);
// 			startDate.setHours(0, 0, 0, 0);
// 			break;

// 		case "monthly":
// 			startDate.setDate(1);
// 			startDate.setHours(0, 0, 0, 0);
// 			break;

// 		case "yearly":
// 			startDate = new Date(endDate.getFullYear(), 0, 1);
// 			startDate.setHours(0, 0, 0, 0);
// 			break;

// 		case "custom":
// 			startDate = new Date(customStart);
// 			startDate.setHours(0, 0, 0, 0);
// 			endDate = new Date(customEnd);
// 			endDate.setHours(23, 59, 59, 999);
// 			break;

// 		default:
// 			startDate.setDate(startDate.getDate() - 6);
// 			startDate.setHours(0, 0, 0, 0);
// 			break;
// 	}

// 	const sales = await Order.aggregate([
// 		{
// 			$match: {
// 				createdAt: {
// 					$gte: startDate,
// 					$lte: endDate,
// 				},
// 			},
// 		},
// 		{
// 			$group: {
// 				_id: {
// 					$dateToString: {
// 						format: "%Y-%m-%d",
// 						date: "$createdAt"
// 					},
// 				},
// 				totalRevenue: { $sum: "$totalAmount" },
// 			},
// 		},
// 	]);

// 	const revenueObj = {};
// 	sales.forEach((item) => {
// 		revenueObj[item._id] = item.totalRevenue;
// 	});

// 	const chartLabels = [];
// 	const chartValues = [];

// 	const cursor = new Date(startDate);
// 	while (cursor <= endDate) {
// 		const dateStr = cursor.toLocaleDateString("sv-SE");
// 		chartLabels.push(dateStr);
// 		chartValues.push(revenueObj[dateStr] || 0);
// 		cursor.setDate(cursor.getDate() + 1);
// 	}

// 	return {
// 		chartLabels,
// 		chartValues,
// 	};
// };




export const getAdminDashboardChartService = async (req) => {
	const {
		range,
		customStart,
		customEnd,
		timezone = "Asia/Kolkata",
		aggregateBy = "totalAmount",
	} = req.query;

	const startInput = customStart ;
	const endInput = customEnd ;

	let endDate = new Date();
	endDate.setHours(23, 59, 59, 999);
	let startDate = new Date(endDate);

	switch (range) {
		case "daily":
			startDate.setHours(0, 0, 0, 0);
			break;
		case "weekly":
			startDate.setDate(startDate.getDate() - 6);
			startDate.setHours(0, 0, 0, 0);
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

	// Set MongoDB $dateToString format
	let groupFormat = "%Y-%m-%d";
	if (range === "daily") groupFormat = "%Y-%m-%d %H:00";
	if (range === "monthly") groupFormat = "%Y-%m-%d"; // We'll post-process 4-week buckets
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
	for (const record of sales) {
		dataMap[record._id] = record.value;
	}

	const chartLabels = [];
	const chartValues = [];

	if (range === "daily") {
		const cursor = new Date(startDate);
		while (cursor <= endDate) {
			const label = cursor.toISOString().slice(0, 13) + ":00"; // YYYY-MM-DDTHH
			chartLabels.push(label.replace("T", " "));
			chartValues.push(dataMap[label.replace("T", " ")] || 0);
			cursor.setHours(cursor.getHours() + 1);
		}
	} else if (range === "monthly") {
		// 4-week buckets
		const weekBuckets = [0, 0, 0, 0];
		const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
		Object.entries(dataMap).forEach(([dateStr, value]) => {
			const date = new Date(dateStr);
			const day = date.getDate();
			const weekIndex = Math.min(Math.floor((day - 1) / 7), 3); // 0-3
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
		// weekly, custom, default = daywise
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

