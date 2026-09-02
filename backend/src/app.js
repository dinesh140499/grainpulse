const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

require("./config/db")();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const errorMiddleware = require("./middleware/error.middleware");
const ErrorHandler = require("./utils/errorHandler");

const authRoute = require("./routes/auth/auth.route");
const userRoute = require("./routes/user/user.route");
const addressRoute = require("./routes/user/address.route");
const publicCategoryRoute = require("./routes/public/category.route");
const publicProductRoute = require("./routes/public/product.route");
const cartRoute = require("./routes/user/cart.route");

const adminProductRoute = require("./routes/admin/product.route");
const adminCategoryRoute = require("./routes/admin/category.route");

const superAdminRoute = require("./routes/superadmin/superadmin.route");

const app = express();

app.set("trust proxy", 1);

/* =========================================
   SECURITY MIDDLEWARE
========================================= */

app.use(helmet());

/* =========================================
   COMPRESS RESPONSE
========================================= */

app.use(compression());

/* =========================================
   BODY PARSER
========================================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* =========================================
   COOKIE PARSER
========================================= */

app.use(cookieParser());

/* =========================================
   STATIC FOLDER
========================================= */

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

/* =========================================
   RATE LIMITER
========================================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use("/api", limiter);

/* =========================================
   CORS
========================================= */

// app.use(
//   cors({
//     origin: [process.env.CLIENT_URL],
//     credentials: true,
//   }),
// );

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://grainpulse-qes3.onrender.com",
  "null"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
        /^https:\/\/.*\.onrender\.com$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

/* =========================================
   ROUTES
========================================= */

app.use("/api/v1/auth", authRoute);

// Customer APIs
app.use("/api/v1/user", userRoute);
app.use("/api/v1/user", addressRoute);

// Public APIs
app.use("/api/v1/categories", publicCategoryRoute);
app.use("/api/v1/products", publicProductRoute);
app.use("/api/v1/cart", cartRoute)

// Admin APIs
app.use("/api/v1/admin/products", adminProductRoute);
app.use("/api/v1/admin/categories", adminCategoryRoute);

// Super Admin APIs
app.use("/api/v1/superadmin", superAdminRoute);


/* =========================================
   HEALTH CHECK
========================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API running...!",
  });
});

app.use((req, res, next) => {
  return next(new ErrorHandler("Route not found", 404));
});

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(errorMiddleware);

module.exports = app;
