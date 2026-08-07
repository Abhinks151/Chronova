import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import './config/passport.js';
import passport from "passport";
import nocache from "nocache";
import session from "express-session";
import httpStatusCode from "./utils/httpStatusCode.js";
import connection from "./config/dbConnection.js";
import indexRoutes from "./routes/index.js";
import { authenticateUser } from "./middlewares/userAuthMiddleware.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { logger } from "./config/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connection();

// Static Files & Template Engine Setup
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Request Logging Middleware
app.use(requestLogger);

// Global Middleware Config
app.use(nocache());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Configuration
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "Abhin is the batman",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    },
  })
);

// Initialize Passport
app.use(passport.initialize());

// Application Routing
app.use("/", indexRoutes);

app.get('/', authenticateUser, (req, res) => {
  res.redirect('/user/home');
});


app.use((req, res) => {
  res.status(httpStatusCode.NOT_FOUND.code).render('Layouts/404');
});

// Global Error Handler
app.use((err, req, res, _next) => {
  logger.error(`Error: ${err.message}\nStack: ${err.stack}`);

  res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render("Layouts/error", {
    statusCode: httpStatusCode.INTERNAL_SERVER_ERROR.code,
    message: "Internal Server Error",
    description: "Something went wrong. Please try again later.",
  });
});

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}/user/home`);
  logger.info(`Admin panel accessible on http://localhost:${PORT}/admin/dashboard`);
});