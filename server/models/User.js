const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user", enum: ["user", "admin"] },
  // Advanced Profile Fields
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  jobTitle: { type: String, default: "" },
  company: { type: String, default: "" },
  location: { type: String, default: "" },
  skills: [{ type: String }],
  interests: [{ type: String }],
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  experience: { type: String, default: "" },
  education: { type: String, default: "" },
  achievements: [{ type: String }],
  profileCompletion: { type: Number, default: 0 },
  theme: { type: String, default: "dark" },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);