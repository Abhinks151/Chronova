# Chronova – E-Commerce Watch Store

Chronova is a full-featured e-commerce platform built for selling watches, designed with modular architecture, robust authentication, and dynamic user/admin functionality. Built using **Node.js**, **Express**, **MongoDB**, and **EJS**, it offers an end-to-end solution covering everything from product management to cart, checkout, and order processing.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB + Mongoose  
- **Frontend:** EJS, CSS, JavaScript (ES Modules)  
- **Auth:** Session-based Auth + Google OAuth (Passport.js)  
- **Email/OTP:** Nodemailer  
- **Image Hosting:** Cloudinary  
- **Payment Gateway:** Razorpay  
- **Logging:** Winston with Daily Rotate  
- **PDF/Excel Report:** Puppeteer, ExcelJS  
- **Others:** Cropper.js, Pincode API, MongoDB Transactions

---

## 🧩 Features

### 👤 User-Side

- **Authentication**
  - Email OTP verification (signup, login, password reset)
  - Google OAuth login
  - Session-based login/logout

- **Profile & Account**
  - Edit profile & email (with OTP verification)
  - Profile image upload (Cropper.js)
  - Address management with pincode auto-fill
  - Single default address logic
  - Wallet for refund tracking
  - Referral code support during registration

- **Shopping Experience**
  - Product search, sort, filter (by name, brand, category)
  - Wishlist (add/remove), cart (add/remove/update) with real-time sync
  - Product zoom support
  - Handles blocked/deleted products in UI
  - Product/category offers (best offer auto-applied)
  - Wishlist and cart mutual exclusivity

- **Checkout & Orders**
  - Address & payment method selection (COD / Razorpay)
  - Razorpay integration with retry flow for failed transactions
  - Secure payment verification via HMAC + fallback via webhook
  - Coupon apply/remove with expiry and usage checks
  - Order confirmation, failure, and retry flows
  - Cancel individual items or entire order with reason
  - Return flow post delivery with mandatory reason
  - Refunds to wallet on approved returns/cancellations
  - Order success/failure pages with redirection options

---

### 🛠️ Admin-Side

- **User Management**
  - View users, block/unblock accounts

- **Category & Product Management**
  - Add, edit, delete, block categories/products
  - Pagination, search, filtering
  - Category and product uniqueness enforced
  - Multi-image upload with Cloudinary
  - Edit forms with pre-filled data
  - Offer management (category/product level)

- **Order Management**
  - Order listing with filters, pagination, and search
  - View per-product order status
  - Cancel/return handling and status updates
  - Refund handling via wallet
  - Razorpay payment status tracking
  - Stock increment on cancel/return

- **Inventory Control**
  - Product-wise stock update
  - Stock registry tracking
  - Low/out-of-stock filters
  - Prevent race conditions using MongoDB transactions

- **Coupons & Offers**
  - Create/delete coupons with validations
  - Auto-apply the best offer (category vs product)
  - Prevent coupon reuse, enforce expiry rules
  - Track coupon usage per user

- **Sales Report**
  - Generate reports by day, week, month, or custom date range
  - Show total sales, order count, discounts, coupon deductions
  - PDF and Excel download supported
  - Filter reports based on order status or date range

---

## 🔐 Security & Validation

- Manual input validation (server-side and client-side)
- OTP and session expiration checks
- Route protection for user/admin access
- Razorpay signature verification for secure payments
- Sanitize all coupon/address IDs and payment input
- Price validation server-side (not trusting frontend)
- Handles blocked/deleted categories and products properly

---

## 📦 Project Structure Highlights

- Modular architecture (`controllers`, `routes`, `services`, `models`)
- Internal JS in EJS, separate CSS files
- Proper use of middleware, clean folder structure
- MongoDB transactions used in critical flows (order, coupon, stock)
- Centralized error handling with HTTP status codes
- Reusable services shared across user/admin routes

---

## 📈 Development Status

✅ Core functionality completed  
✅ Razorpay payment flow with fallback implemented  
✅ Offers, coupon logic, and transaction handling done  
✅ Admin-side sales reporting & export  
🧪 Ongoing: Wallet UI and analytics review system  
🎯 **Next Goal:** Redesign order management pages and admin dashboard  

---

## 📄 Author

**Abhin**  
Aspiring Software Engineer | Full-stack Developer  
[GitHub](https://github.com/Abhinks151/) · [LinkedIn](https://www.linkedin.com/in/abhin-ks/)

---

## 📌 Note

This project is intended for learning purposes.  
Contributions, suggestions, and constructive code reviews are welcome!
