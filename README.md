# Chronova – E-Commerce Watch Store

Chronova is a full-featured e-commerce platform for selling watches, crafted with scalable architecture, complete authentication flow, and robust admin/user-side functionalities. Built using **Node.js**, **Express**, **MongoDB**, and **EJS**, it delivers a seamless shopping experience from browsing to order completion.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB + Mongoose  
- **Frontend:** EJS, CSS, JavaScript (ES Modules)  
- **Auth:** Session-based Auth + Google OAuth (Passport.js)  
- **Email/OTP:** Nodemailer  
- **Image Hosting:** Cloudinary  
- **Payment Gateway:** Razorpay  
- **Logging:** Winston with Daily Rotate File  
- **Reports:** Puppeteer (PDF), ExcelJS (Excel)  
- **Extras:** Cropper.js, Pincode API, MongoDB Transactions

---

## 🧩 Features

### 👤 User-Side

- **Authentication & Security**
  - OTP verification (signup, login, password reset)
  - Google OAuth (Passport.js)
  - Secure session management
  - Razorpay payment verification (HMAC + Webhook fallback)
  - Route protection & data sanitization

- **Profile & Account**
  - Edit name, email (with verification), and profile image (Cropper.js)
  - Manage multiple addresses with pincode auto-fill
  - Set default address
  - Email and password update with OTP verification
  - Wallet for refund tracking
  - Referral code support on registration

- **Shopping Experience**
  - Product search, filter, and sort
  - Wishlist (add/remove), Cart (add/remove/update)
  - Wishlist <-> Cart mutual exclusivity logic
  - Product zoom on detail page
  - Handles blocked/deleted products gracefully
  - Category/Product-level offers (auto-applied best price)

- **Checkout & Orders**
  - Address & payment method selection (COD / Razorpay)
  - Payment retry logic after Razorpay failure
  - Coupon apply/remove with validation
  - Cancel order (full or item-wise) with reason
  - Return flow post delivery with reason input
  - Auto refund to wallet for valid returns/cancellations
  - Order success/failure pages with redirection options

---

### 🛠️ Admin-Side

- **User Management**
  - View, block/unblock users

- **Category Management**
  - Add/edit/delete categories with pagination & search
  - Validation & duplication checks
  - Convert constants to dynamic category collection
  - Sync changes with product module

- **Product Management**
  - Add/edit/delete products
  - Populate edit form with previous data
  - Upload multiple images (Cloudinary)
  - Handle blocked/deleted category gracefully
  - Validate all input fields
  - Product uniqueness enforced

- **Order Management**
  - List all orders with filters & pagination
  - View per-item order status
  - Cancel/return handling + restock
  - Razorpay payment status tracking
  - Admin-side status update and refund processing
  - Session-based MongoDB transactions

- **Coupons & Offers**
  - Create/delete coupons
  - Apply coupons with expiration, reuse protection
  - Category/Product-based offers
  - Referral-based offers
  - Auto-apply best discount logic
  - Usage log tracking per user

- **Sales Report**
  - Filter reports by daily, weekly, monthly, or custom range
  - Summary metrics (sales, discounts, coupon usage)
  - Download PDF (Puppeteer) or Excel (ExcelJS)
  - Query-based backend filtering
  - Chart-based dashboard (Monthly, Yearly etc.)
  - Top 10 brands/products/categories

---

## 🔐 Security & Validation

- OTP/session expiry check
- Proper status codes for every route
- Backend validation for user/product/coupon
- Coupon and address ID sanitization
- Quantity and price validation against DB
- Handle deleted/blocked data across all modules
- Race condition prevention on stock updates using MongoDB transactions

---

## 📦 Project Structure Highlights

- Modular folder structure: `controllers`, `routes`, `services`, `models`, `middlewares`
- Internal scripts in EJS pages
- Reusable services across modules
- Error handling middleware
- Logger with daily rotation and cleanup
- Clean, maintainable architecture for scalability

---

## 📈 Development Status

✅ Complete user + admin modules  
✅ End-to-end Razorpay integration with fallback  
✅ OTP-based auth flow, Google OAuth  
✅ Admin sales report export (PDF/Excel)  
✅ Robust stock/coupon/order validation using MongoDB transactions  
✅ Wishlist, Cart, Return & Refund Logic  
🧪 Wallet & Refund display (UI phase pending)  
🎯 **Next Goal:** Refactor order management layout + analytics visualization

---

## 📄 Author

**Abhin**  
Aspiring Software Engineer | Full-stack Developer  
[GitHub](https://github.com/Abhinks151/) · [LinkedIn](https://www.linkedin.com/in/abhin-ks/)

---

## 📌 Note

This project is built as a learning + portfolio piece.  
Feedback, issues, and pull requests are always welcome!
