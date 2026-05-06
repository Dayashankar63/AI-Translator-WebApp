const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  userId: String,
  question: String,
  answer: String,
  feedback: String,
  score: Number,
  recordingUrl: String,
  recordingDuration: Number,
  topic: String,
  voiceAnalysis: {
    pace: Number,
    clarity: Number,
    fillerWords: Number,
    enthusiasm: Number
  },
  performanceMetrics: {
    communication: Number,
    skills: Number,
    confidence: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", interviewSchema);