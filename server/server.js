const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const interviewRoutes = require("./routes/interview");
const featuresRoutes = require("./routes/features");

const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      /\.vercel\.app$/,
      /^http:\/\/localhost/,
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (!origin) return callback(null, true);
    const ok = allowed.some(o => o instanceof RegExp ? o.test(origin) : o === origin);
    callback(null, ok ? origin : false);
  },
  credentials: true,
}));
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// DB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/features", featuresRoutes);

// Health check
app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "AI Interview Server is running ✅" });
});

// React build serve karo (combined deploy ke liye)
const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath));

// Sab routes React ko do (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Local: listen; Vercel: export
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT);
}

module.exports = app;
