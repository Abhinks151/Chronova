import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import './config/passport.js';
import passport from "passport";
import nocache from "nocache";
import session from "express-session";
import helmet from "helmet";
import MongoStore from "connect-mongo";

import connection from "./config/dbConnection.js";
import indexRoutes from "./routes/index.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connection();

const isProduction = process.env.NODE_ENV === "production";
console.log("production", isProduction);

// Trust proxy if behind a load balancer (like NGINX)
app.set("trust proxy", 1);

// Helmet CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", "'unsafe-inline'", "https:", "data:",
        "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'", "'unsafe-inline'",
        "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"
      ],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'", "data:",
        "https://images.unsplash.com", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"
      ],
      connectSrc: ["'self'", "https://api.unsplash.com"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// View engine + static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Core middlewares
app.use(passport.initialize());
app.use(nocache());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION CONFIGURATION ✅
app.use(
  session({
    secret: "Abhin is the batman", // Replace with secure .env value later
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, 
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Routes
app.use("/", indexRoutes);

// Test Route to Save Session ✅
app.get("/test", (req, res) => {
  req.session.hello = "world";
  req.session.save((err) => {
    if (err) {
      console.error("Session Save Error:", err);
      return res.status(500).send("Session save failed");
    }
    console.log("✅ Session saved:", req.session);
    res.send("Session test successful");
  });
});

// Default route
app.get("/", (req, res) => {
  res.status(200).render("Layouts/users/products");
});

// Error testing route
app.get("/error", (req, res, next) => {
  next(new Error("This is a test error"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("Layouts/error", {
    statusCode: 500,
    message: "Internal Server Error",
    description: "Something went wrong. Please try again later.",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/user/home`);
  console.log(`Server running on http://localhost:${PORT}/admin/dashboard`);
});
