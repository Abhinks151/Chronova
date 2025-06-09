import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
// import csurf from "csurf";

import connection from "./config/dbConnection.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

// Routes imports
import indexRoutes from "./routes/index.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB connection
connection();

// Middleware and config
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(csurf());

// Routes
app.use("/", indexRoutes);

// Error handler
app.use(errorMiddleware);

// Start server


//Actual routes
app.use("/", indexRoutes);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

