const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword
    });

    await testUser.save();

  } catch (error) {
  } finally {
    await mongoose.connection.close();
  }
}

createTestUser();