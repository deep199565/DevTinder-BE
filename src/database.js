const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
     "mongodb+srv://deeppatel199565_db_user:MfTISHnuRBHSKgaH@cluster0.cvy3xvg.mongodb.net/"
    );
    console.log("✅ MongoDB connected to Atlas");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
