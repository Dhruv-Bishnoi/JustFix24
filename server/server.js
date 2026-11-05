
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import providerRoutes from "./routes/providerRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "ListifyPro API is running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy"
  });
});

// Provider routes
app.use("/api/providers", providerRoutes);

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  // Connect MongoDB after server starts
  connectDB()
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
});
