import { getActiveCategories, getStockData, getStockRegistryByProductId } from '../../services/adminStockManagementServices.js'
import httpStatusCode from "../../utils/httpStatusCode.js"
import { logger } from '../../config/logger.js';


export const getStockRegistryByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(httpStatusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Product ID is required",
            });
        }

        const registryEntries = await getStockRegistryByProductId(productId);

        return res.status(httpStatusCode.OK.code).json({
            success: true,
            stockRegistry: registryEntries,
        });
    } catch (error) {
        logger.error("Error fetching stock registry:", error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "Failed to fetch stock registry",
        });
    }
};

export const getStockManagementPage = async (req, res) => {
    try {
        const categories = await getActiveCategories();

        return res.render("Layouts/adminDashboard/stockManagement.ejs", {
            categories,
            title: "Stock Management",
        });
    } catch (error) {
        logger.error("Error rendering stock management page:", error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render("admin/error", {
            message: "Failed to load stock management page.",
            title: "Error"
        });
    }
};

export const getStockPageData = async (req, res) => {
    try {
        const filters = {
            search: req.query.search?.trim() || "",
            category: req.query.category || "",
            minPrice: req.query.minPrice || "",
            maxPrice: req.query.maxPrice || "",
            stockStatus: req.query.stockStatus || "all",
            sortBy: req.query.sortBy || "name",
            sortOrder: req.query.sortOrder || "asc",
            page: Math.max(1, parseInt(req.query.page) || 1),
            limit: Math.min(50, Math.max(1, parseInt(req.query.limit) || 10)),
        };

        // Validate price filters
        if (filters.minPrice && isNaN(filters.minPrice)) {
            return res.status(httpStatusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Invalid minimum price value",
            });
        }

        if (filters.maxPrice && isNaN(filters.maxPrice)) {
            return res.status(httpStatusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Invalid maximum price value",
            });
        }

        const result = await getStockData(filters);

        return res.json({
            success: true,
            data: result.products,
            pagination: result.pagination,
            filters: filters
        });
    } catch (error) {
        logger.error("Error fetching stock data:", error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "Failed to fetch stock data",
        });
    }
};

export const getFilterData = async (req, res) => {
    try {
        const categories = await getActiveCategories();

        return res.json({
            success: true,
            categories,
        });
    } catch (error) {
        logger.error("Error fetching filter data:", error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "Failed to fetch filter data",
        });
    }
};