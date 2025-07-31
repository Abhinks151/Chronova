// ⚙️ Dependencies & Setup
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
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧠 Connect Mongo
connection();
const isProduction = process.env.NODE_ENV === "production";
app.set("trust proxy", 1); // 🔐 Must be BEFORE session if behind proxy

// 🛡 Helmet CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'", "https://api.unsplash.com"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }
}));

// ⚙️ View & Static
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 🧩 Core Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(nocache());

// ✅ Session Setup — FINAL WORKING CONFIG
app.use(
  session({
    name: "chronova.sid",
    secret: process.env.SESSION_SECRET || "chronovaSuperSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7, // 7 days
      autoRemove: "interval",
      autoRemoveInterval: 10, // every 10 minutes
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: isProduction, // true in production with HTTPS
      sameSite: isProduction ? "none" : "lax", // None for cross-site on HTTPS
      domain: isProduction ? ".abhin.site" : undefined 
    },
  })
);

// 🧠 Passport + Sessions (Required)
app.use(passport.initialize());
app.use(passport.session()); // ✅ REQUIRED for working sessions

// 🧭 Routes
app.use("/", indexRoutes);

app.get("/test", (req, res) => {
  req.session.hello = "world";
  req.session.save((err) => {
    if (err) {
      console.error("❌ Session Save Error:", err);
      return res.status(500).send("Session save failed");
    }
    console.log("✅ Session saved:", req.session);
    res.send(req.session);
  });
});

// 🧱 Error handling
app.use((err, req, res, next) => {
  console.error("🔴 Error:", err);
  res.status(500).render("Layouts/error", {
    statusCode: 500,
    message: "Internal Server Error",
    description: "Something went wrong. Please try again later.",
  });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`Server running: https://chronova.abhin.site`);
});
