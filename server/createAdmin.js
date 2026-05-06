const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "Admin User",
      email: "admin@interviewpro.com",
      password: hashedPassword,
      role: "admin",
      theme: "dark"
    });

    await admin.save();

  } catch (error) {
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();