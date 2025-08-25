const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // ✅ إضافة mongoose
const connectDB = require("./db"); // Import MongoDB connection
const client = require("prom-client");

const app = express();

// Connect to MongoDB
connectDB();

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_operations_total",
  help: "Total number of Http requests",
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of http request in seconds",
  buckets: [0.1, 0.5, 2, 5, 10],
});

// Enable CORS
app.use(cors());

// API route
app.get("/", async (req, res) => {
  const start = new Date();
  const simulateTime = Math.floor(Math.random() * (10000 - 500 + 1) + 500);

  setTimeout(() => {
    const end = new Date() - start;
    httpRequestDurationSeconds.observe(end / 1000); // convert to seconds
  }, simulateTime);

  httpRequestsTotal.inc();

  try {
    // ✅ اختبار اتصال بالـ MongoDB
    await mongoose.connection.db.admin().ping();

    console.log("✅ Database connection successful");
    res.status(200).json({
      message: "Node.js backend is running",
      dbStatus: "Database connection successful",
    });
  } catch (err) {
    console.error("❌ Database ping failed:", err.message);
    res.status(500).json({
      message: "Node.js backend is running",
      dbStatus: "Database connection failed",
      error: err.message,
    });
  }
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Start server
app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Server is running on http://0.0.0.0:3000");
});
