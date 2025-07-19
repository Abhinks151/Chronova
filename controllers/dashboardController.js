import { Order } from "../models/order.js";
import { User } from "../models/userModels.js";

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // --- Total Users ---
    const totalUsers = await User.countDocuments();
    const usersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });
    const userGrowth =
      usersLastMonth === 0
        ? 100
        : (((usersThisMonth - usersLastMonth) / usersLastMonth) * 100).toFixed(1);

    // --- Total Orders ---
    const totalOrders = await Order.countDocuments();
    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const ordersLastMonth = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });
    const orderGrowth =
      ordersLastMonth === 0
        ? 100
        : (((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100).toFixed(1);

    // --- Total Sales (Only Paid Orders) ---
    const totalSalesAgg = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    const salesThisMonthAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const salesLastMonthAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const salesThisMonth = salesThisMonthAgg[0]?.total || 0;
    const salesLastMonth = salesLastMonthAgg[0]?.total || 0;
    const salesDecline =
      salesLastMonth === 0
        ? 0
        : (((salesLastMonth - salesThisMonth) / salesLastMonth) * 100).toFixed(1);

    // --- Sales Chart Data (Recent 25 Paid Orders) ---
    const recentSales = await Order.find({ paymentStatus: "Paid" })
      .sort({ createdAt: -1 })
      .limit(25)
      .select("totalAmount createdAt")
      .lean();

    const salesChartData = {
      labels: recentSales.map((_, i) => `${(i + 1) * 2}k`),
      values: recentSales.map((order) => Math.floor(order.totalAmount / 1000)),
    };

    // --- Recent Orders Table (Last 10 Orders) ---
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId")
      .lean();

    const orders = recentOrders.map((order) => ({
      id: order.orderId,
      name: order.userId?.firstname || "Guest",
      address: order.shippingAddress?.addressLine || "No address",
      date: order.createdAt.toLocaleDateString("en-GB"),
      type: order.items[0]?.brand || "General",
      status: order.orderStatus,
    }));

    // --- Final Data Assembly ---
    const dashboardData = {
      totalUsers: totalUsers.toLocaleString(),
      userGrowth,
      totalOrders: totalOrders.toLocaleString(),
      orderGrowth,
      totalSales: totalSales.toLocaleString(),
      salesDecline,
      salesData: salesChartData,
      orders,
    };

    res.render("Layouts/adminDashboard/adminDashboard", {
      title: "Dashboard - Chronova",
      dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Something went wrong loading the dashboard",
    });
  }
};
