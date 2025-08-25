const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongo_URI =
      process.env.MONGO_DB_URI ||
      "mongodb://admin:password@mongo:27017/shop?authSource=admin"; 
    // 👆 "mongo" هنا هو اسم الـ service في docker-compose

    await mongoose.connect(mongo_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = connectDB;
