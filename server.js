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

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(passport.initialize());
app.use(nocache());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(csurf());
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/user/home`);
  console.log(`Server running on http://localhost:${PORT}/admin/dashboard`);
});
