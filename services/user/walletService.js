import Wallet from '../../models/wallet.js'
import { logger } from '../../config/logger.js';

export const getFilteredWalletHistoryService = async (userId, { page, limit, search, type, sort }) => {
  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      // Create wallet if it doesn't exist
      await Wallet.create({
        userId,
        balance: 0,
        transactions: []
      });
      return {
        transactions: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        balance: 0,
      };
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    // Filter by type if specified
    let filtered = wallet.transactions;
    if (type) {
      filtered = wallet.transactions.filter(txn => txn.type === type);
    }

    // Filter by search if specified (search in description)
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort transactions
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder * (dateA - dateB);
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      transactions: paginated,
      total,
      currentPage: page,
      totalPages,
      balance: wallet.balance,
    };
  } catch (error) {
    logger.error("Error in getFilteredWalletHistoryService:", error);
    throw new Error("Failed to retrieve filtered wallet history");
  }
};

export const getWalletHistoryService = async (userId) => {
  try {
    let data = await Wallet.findOne({ userId });

    if (!data) {
      // Create new wallet if it doesn't exist
      data = await Wallet.create({
        userId,
        balance: 0,
        transactions: []
      });
    }

    return data;
  } catch (error) {
    logger.error("Error in getWalletHistory:", error);
    throw new Error("Failed to retrieve wallet history");
  }
}