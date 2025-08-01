import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import './config/passport.js';
import passport from "passport";
import nocache from "nocache";
import session from "express-session";
// import csurf from "csurf";
import helmet from "helmet";

import connection from "./config/dbConnection.js";
// import { errorMiddleware } from "./middlewares/errorMiddleware.js";

import indexRoutes from "./routes/index.js";
// import { requestLogger } from "./middlewares/requestLogger.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connection();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https:",
        "data:",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://code.jquery.com",
        "https://checkout.razorpay.com"
      ],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        "data:",
        "https://images.unsplash.com",
        "https://res.cloudinary.com",
        "https://lh3.googleusercontent.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.unsplash.com",
        "https://lumberjack.razorpay.com"
      ],
      frameSrc: [
        "'self'",
        "https://api.razorpay.com"
      ],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));



app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(passport.initialize());
app.use(nocache());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Abhin is the batman",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);



// Error handler
// app.use(errorMiddleware);

// app.use(requestLogger);
app.use("/", indexRoutes);

app.get("/error", (req, res, next) => {
  next(new Error("This is a test error"));
});



//Error
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).render("Layouts/error", {
    statusCode: 500,
    message: "Internal Server Error",
    description: "Something went wrong. Please try again later.",
  });
})




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/user/home`);
  console.log(`Server running on http://localhost:${PORT}/admin/dashboard`);
});