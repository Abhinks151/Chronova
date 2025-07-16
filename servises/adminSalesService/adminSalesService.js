import { Order } from "../../models/order.js";
import puppeteer from "puppeteer";
import ExcelJS from "exceljs";

export const getSalesReportService = async (req) => {
  let { period, startDate, endDate, status, page = 1, limit = 2 } = req.query;

  let filter = {};
  const now = new Date();

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  } else if (period) {
    let startPeriod;
    switch (period) {
      case "weekly":
        startPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "annual":
        startPeriod = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    startPeriod.setUTCHours(0, 0, 0, 0);
    now.setUTCHours(23, 59, 59, 999);
    filter.createdAt = { $gte: startPeriod, $lte: now };
  }

  if (status) {
    filter.orderStatus = status;
  }

  const totalItems = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const allFilteredOrders = await Order.find(filter);

  const summary = {
    totalOrders: allFilteredOrders.length,
    totalRevenue: allFilteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalDiscount: allFilteredOrders.reduce((sum, order) => sum + order.discount, 0),
    totalRefunds: allFilteredOrders.reduce((sum, order) => sum + order.refundedAmount, 0),
  };

  return {
    orders,
    summary,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: parseInt(limit),
    },
    filters: { period, startDate, endDate, status },
  };
};



export const generatePDFReportService = async (req) => {
  const { orders, summary } = await getSalesReportService(req);

  const html = `
    <html>
    <head><style>body { font-family: sans-serif; }</style></head>
    <body>
      <h1>Chronova - Sales Report</h1>
      <h3>Total Orders: ${summary.totalOrders}</h3>
      <h3>Total Revenue: ₹${summary.totalRevenue}</h3>
      <h3>Total Discount: ₹${summary.totalDiscount}</h3>
      <h3>Total Refunds: ₹${summary.totalRefunds}</h3>
      <br/>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Order ID</th>
          <th>Name</th>
          <th>Date</th>
          <th>Items</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
        ${orders.map(o => `
          <tr>
            <td>${o.orderId}</td>
            <td>${o.shippingAddress.fullName}</td>
            <td>${new Date(o.createdAt).toLocaleDateString()}</td>
            <td>${o.items.length}</td>
            <td>${o.paymentMethod}</td>
            <td>${o.orderStatus}</td>
            <td>₹${o.totalAmount}</td>
          </tr>`).join("")}
      </table>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const buffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();
  return buffer;
};

export const generateExcelReportService = async (req) => {
  const { orders, summary, filters } = await getSalesReportService(req);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sales Report");

  sheet.mergeCells("A1:H1");
  sheet.getCell("A1").value = "Chronova - Sales Report";
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.getCell("A1").font = { size: 16, bold: true };

  // Filters
  sheet.mergeCells("A2:H2");
  let filterText = "Filters: ";
  if (filters.period) filterText += `Period: ${filters.period}, `;
  if (filters.startDate && filters.endDate) filterText += `Date: ${filters.startDate} to ${filters.endDate}, `;
  if (filters.status) filterText += `Status: ${filters.status}`;
  sheet.getCell("A2").value = filterText.trim().replace(/,$/, "");

  // Summary
  sheet.addRow([]);
  sheet.addRow(["Summary"]);
  sheet.addRow(["Total Orders", summary.totalOrders]);
  sheet.addRow(["Total Revenue", summary.totalRevenue]);
  sheet.addRow(["Total Discount", summary.totalDiscount]);
  sheet.addRow(["Total Refunds", summary.totalRefunds]);
  sheet.addRow([]);

  // Table headers
  sheet.addRow([
    "Order ID",
    "Customer",
    "Date",
    "Items Count",
    "Payment Method",
    "Order Status",
    "Total",
    "Refunded"
  ]).font = { bold: true };

  // Rows
  orders.forEach(order => {
    sheet.addRow([
      order.orderId,
      order.shippingAddress.fullName,
      new Date(order.createdAt).toLocaleDateString(),
      order.items.length,
      order.paymentMethod,
      order.orderStatus,
      order.totalAmount,
      order.refundedAmount
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
