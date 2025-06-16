Chronova — E-commerce Platform for Watch Enthusiasts

Chronova is a full-featured e-commerce platform dedicated to premium and high-quality watches. Designed with a focus on performance, security, and user experience, it serves both customers and admins through dynamic, responsive views and powerful backend capabilities.

💪 Tech Stack

Frontend

EJS — Template rendering

Vanilla JavaScript — Dynamic client-side behavior

CSS — Styling

Backend

Node.js + Express.js

MongoDB — NoSQL database

Mongoose — ODM for MongoDB

JWT — JSON Web Token-based authentication

Passport.js — Local & Google OAuth strategies

Nodemailer — OTP & Welcome email service using custom templates

Cloudinary — Image storage

📁 Folder Structure
<pre>
Chronova/
├── controllers/            # All route logic (user/admin)
├── models/                 # Mongoose models
├── routes/                 # Route declarations
├── views/                 
│   └── partials/           # Common reusable components
├── public/
│   ├── scripts/            # Frontend JavaScript
│   └── styles/             # Custom CSS
├── config/                 # DB config & other setup files
├── services/               # External integrations like email or cloudinary
├── middleware/             # Custom middlewares
├── utils/                  # Utility functions (e.g., email sending)
├── server.js               # Main app entry
└── .env                    # Environment variables
</pre>

✅ Features (Currently Implemented)

🔐 Authentication

Local signup/login with JWT

Google OAuth using Passport

OTP verification via email (Resend API / Nodemailer)

Forgot & Reset password flows

Welcome email on signup

👤 Admin

Admin login with authentication

User management (view, block/unblock, delete)

Product management (CRUD with image upload)

Category management with full CRUD

Server-side filtering and pagination

🛙️ User

Product listing with filters (by category, style, etc.)

Product detail pages

Pagination in listings

View categories and filtered results

🧹 Upcoming Features

These are currently under development and will be rolled out incrementally.

🔧 User Profile Management

💵 Cash on Delivery (COD) order placement

📦 Order management (user + admin)

🎟️ Discounts, Coupons, and Offers (admin side)

📊 Admin Dashboard with analytics

📦 Dependencies

<pre>
{
  "express": "^5.1.0",
  "ejs": "^3.1.10",
  "mongoose": "^8.15.1",
  "jsonwebtoken": "^9.0.2",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "bcrypt": "^6.0.0",
  "multer": "^2.0.1",
  "cloudinary": "^2.6.1",
  "nodemailer": "^7.0.3"
}
</pre>

🚀 Getting Started

Coming soon — installation and setup instructions will be added once project reaches MVP stage.

📌 Status

🧪 In Development — Core modules working, admin/user sides being expanded.

📄 License

MIT

✍️ Author

Abhin — Aspiring software engineer & full-stack web developer.
