import { Order } from "../models/order.js";
import { Products } from "../models/products.js";
import { Category } from "../models/category.js";
import { stockRegistry } from "../models/stockRegistry.js";

export const getActiveCategories = async () => {
    try {
        return await Category.find({ 
            isBlocked: false, 
            isDeleted: false 
        })
        .select('categoryName')
        .sort({ categoryName: 1 })
        .lean();
    } catch (error) {
        console.error("Error fetching active categories:", error);
        throw new Error("Failed to fetch categories");
    }
};

export const getStockRegistryByProductId = async (productId) => {
    try {
        return await stockRegistry.find({ productId })
            .sort({ timestamp: -1 })
            .limit(100) 
            .lean();
    } catch (error) {
        console.error("Error fetching stock registry:", error);
        throw new Error("Failed to fetch stock registry");
    }
};

export const getStockData = async (filters = {}) => {
    try {
        const {
            search = "",
            category = "",
            minPrice = "",
            maxPrice = "",
            stockStatus = "all",
            sortBy = "name",
            sortOrder = "asc",
            page = 1,
            limit = 10,
        } = filters;

        const match = {
            isDeleted: false,
        };

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            match.$or = [
                { productName: searchRegex },
                { sku: searchRegex },
                { brand: searchRegex },
                { description: searchRegex }
            ];
        }

        if (category && category !== "all") {
            match.category = category;
        }

        if (minPrice || maxPrice) {
            match.salePrice = {};
            if (minPrice) {
                const min = parseFloat(minPrice);
                if (!isNaN(min) && min >= 0) {
                    match.salePrice.$gte = min;
                }
            }
            if (maxPrice) {
                const max = parseFloat(maxPrice);
                if (!isNaN(max) && max >= 0) {
                    match.salePrice.$lte = max;
                }
            }
        }

        switch (stockStatus) {
            case "low":
                match.stockQuantity = { $lte: 10, $gt: 0 };
                break;
            case "out":
                match.stockQuantity = 0;
                break;
            case "in":
                match.stockQuantity = { $gt: 10 };
                break;
        }

        const sortCriteria = {};
        switch (sortBy) {
            case "name":
                sortCriteria.productName = sortOrder === "desc" ? -1 : 1;
                break;
            case "price":
                sortCriteria.salePrice = sortOrder === "desc" ? -1 : 1;
                break;
            case "stock":
                sortCriteria.stockQuantity = sortOrder === "desc" ? -1 : 1;
                break;
            case "lowStock":
                sortCriteria.stockQuantity = 1; // Always ascending for low stock
                break;
            default:
                sortCriteria.productName = 1;
        }

        if (sortBy !== "name") {
            sortCriteria.productName = 1;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const limitNum = Number(limit);

        const products = await Products.find(match)
            .populate({
                path: "category",
                select: "categoryName isBlocked isDeleted",
                match: { isDeleted: false, isBlocked: false },
            })
            .sort(sortCriteria)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalCount = await Products.countDocuments(match);

        const productIds = products.map((p) => p._id);
        const soldCounts = await Order.aggregate([
            { $unwind: "$items" },
            { 
                $match: { 
                    "items.productId": { $in: productIds },
                    status: { $in: ["delivered", "shipped"] }
                }
            },
            {
                $group: {
                    _id: "$items.productId",
                    totalSold: { $sum: "$items.quantity" },
                },
            },
        ]);

        const soldMap = {};
        soldCounts.forEach((entry) => {
            soldMap[entry._id.toString()] = entry.totalSold;
        });

        const enrichedProducts = products.map((product) => {
            const categoryNames = product.category && product.category.length > 0
                ? product.category
                    .filter(cat => cat && !cat.isDeleted && !cat.isBlocked)
                    .map(cat => cat.categoryName)
                : ['Uncategorized'];

            return {
                ...product,
                totalSold: soldMap[product._id.toString()] || 0,
                categoryNames,
                stockQuantity: product.stockQuantity || 0,
                salePrice: product.salePrice || 0,
                images: product.images || [],
                sku: product.sku || `SKU-${product._id.toString().slice(-6)}`,
            };
        });

        return {
            products: enrichedProducts,
            pagination: {
                total: totalCount,
                page: Number(page),
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum),
                hasNext: Number(page) < Math.ceil(totalCount / limitNum),
                hasPrev: Number(page) > 1,
            },
        };
    } catch (error) {
        console.error("Error in getStockData service:", error);
        throw new Error("Failed to fetch stock data");
    }
};