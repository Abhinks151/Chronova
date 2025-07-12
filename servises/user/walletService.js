import Wallet from '../../models/wallet.js'

export const getFilteredWalletHistoryService = async (userId, { page, limit, type, sort }) => {
  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      throw new Error("Wallet not found for the given user ID");
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    let filtered = type
      ? wallet.transactions.filter(txn => txn.type === type)
      : wallet.transactions;

    filtered.sort((a, b) => sortOrder * (new Date(a.timestamp) - new Date(b.timestamp)));

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      transactions: paginated,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      balance: wallet.balance,
    };
  } catch (error) {
    console.error("Error in getFilteredWalletHistoryService:", error);
    throw new Error("Failed to retrieve filtered wallet history");
  }
};


export const getWalletHistoryService = async (userId) => {
  try {
    const data = await Wallet.findOne({ userId })
      .populate('transactions')

    if (!data) {
      throw new Error("Wallet not found for the given user ID");
    }


    
    return data;
  } catch (error) {
    console.error("Error in getWalletHistory:", error);
    throw new Error("Failed to retrieve wallet history");

  }
}


