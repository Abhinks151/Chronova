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
- **Others:** Cropper.js, Pincode API, Winston (logging – WIP)

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
  - Address management (with pincode auto-fill)
  - Wallet for refund tracking
- **Shopping Experience**
  - Product browsing (search, sort, filter)
  - Detailed product pages with zoom and wishlist/cart integration
  - Real-time cart quantity control (stock-bound, max 5)
  - Wishlist with toggle UI and blocked/deleted product handling
- **Checkout & Orders**
  - Address & payment method selection
  - Order placement and confirmation flow
  - View orders, cancel individual items or entire orders
  - Return flow with wallet refund

---

### 🛠️ Admin-Side
- **User Management**
  - View, block/unblock users
- **Category & Product Management**
  - Add, edit, delete, block categories/products
  - Pagination, search, filter support
  - Multi-image upload with Cloudinary
- **Order Management**
  - Order listing with filters, pagination, search
  - Per-product status updates
  - Approve returns with wallet refunds
- **Inventory Control**
  - View/update stock
  - Stock history registry
  - Low/out-of-stock filters

---

## 🔐 Security & Validation
- Manual input validation
- OTP & session expiration handling
- Route protection (user/admin)
- Robust status checks for deleted/blocked items

---

## 📦 Project Structure Highlights
- Modular folder structure (`controllers`, `routes`, `services`, `models`)
- Internal JS in EJS files, external CSS files
- Reusable service logic across user/admin

---

## 📈 Development Status

✅ Core functionality completed  
🛠️ Logging, analytics & review system in progress  
🎯 **Next Goal:** Integrate a payment gateway (Razorpay / Stripe / PayPal)  
🧪 Code continuously refactored for performance and clarity  

---

## 📄 Author

**Abhin**  
Aspiring Software Engineer | Full-stack Developer  
[GitHub](https://github.com/Abhinks151/) · [LinkedIn](https://www.linkedin.com/in/abhin-ks/)

---

## 📌 Note

This project is intended for learning purposes so Contributions, suggestions, and constructive code reviews are welcome!
