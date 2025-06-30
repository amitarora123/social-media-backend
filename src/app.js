const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("./utils/cronJob.js");
require("dotenv").config();

const logger = require("./utils/logger");
const { connectDB } = require("./utils/database");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const cookieParser = require("cookie-parser");
/**
 * Express application setup and configuration
 */
const app = express();
const PORT = process.env.PORT || 3000;

// cookie parser to fetch the cookies
app.use(cookieParser());
// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.static("public"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.critical("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/**
 * Start the server
 */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.verbose(`Server is running on port ${PORT}`);
      logger.verbose(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.critical("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
