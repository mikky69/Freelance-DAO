import cors from "cors";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// 🌍 Middlewares
app.use(express.json());
app.use(morgan("dev"));
app.options('/(.*)', cors()); // Enable pre-flight requests for all routes

// 🛣 Routes
app.use("/api/auth", authRoutes);

// 🚀 Test DB connection and Start Server
const startServer = async () => {
  try {
    await db.getConnection(); // This ensures the pool is working
    console.log("✅ MySQL pool is ready.");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MySQL pool error:", err);
    process.exit(1);
  }
};

startServer();