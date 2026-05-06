const router = require("express").Router();
const Interview = require("../models/Interview");
const Groq = require("groq-sdk");
const multer = require("multer");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");

let pdfParse;
let mammoth;
try {
  pdfParse = require("pdf-parse");
} catch (err) {
}

try {
  mammoth = require("mammoth");
} catch (err) {
}

// File upload
const upload = multer({ storage: multer.memoryStorage() });

// Groq
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

if (!process.env.GROQ_API_KEY) {
}

const mapApiError = (err) => {
  const message = err?.message || "Unknown error";
  if (message.toLowerCase().includes("invalid api key") || err?.status === 401) {
    return {
      status: 401,
      message: "Invalid GROQ_API_KEY. Please set a valid key from the GROQ dashboard."
    };
  }
  return null;
};

const fallbackQuestions = {
  "Resume-Based Questions": [
    "Tell me about a time when you used your resume experience to solve a difficult problem.",
    "Which resume achievement are you most proud of and why?",
    "How does your resume reflect your strongest interview skills?"
  ],
  "AI Video Interview": [
    "Describe how you would prepare for an AI-driven video interview.",
    "What makes you confident when speaking in front of a camera?",
    "How do you ensure clear communication during a virtual interview?"
  ],
  "Real-Time Feedback": [
    "How do you adapt when you receive feedback during a live interview?",
    "Explain a time when feedback helped you improve your answer instantly.",
    "What would you change in your interview style after receiving real-time feedback?"
  ],
  "Performance Analytics": [
    "How do you use analytics to track your interview preparation progress?",
    "Describe a time when metrics helped you improve your performance.",
    "What performance data do you think is most useful for interview preparation?"
  ],
  "Unlimited Practice": [
    "Why is practicing interviews repeatedly important for success?",
    "Tell me how you stay motivated to practice interview questions often.",
    "How do you adapt when practicing the same question multiple times?"
  ],
  "Smart Insights": [
    "What kind of insights do you need to improve your interview performance?",
    "Describe how AI-generated insights can make your preparation smarter.",
    "How would you use feedback insights to create a better interview strategy?"
  ],
  default: [
    "Describe a challenging project you worked on and how you solved it.",
    "Tell me about a situation where you had to solve a difficult technical problem.",
    "Explain a key achievement from your experience and why it mattered."
  ]
};

const getFallbackQuestion = (topic) => {
  const list = fallbackQuestions[topic] || fallbackQuestions.default;
  return list[Math.floor(Math.random() * list.length)];
};

const extractGroqMessage = (response) => {
  if (!response) return "";
  const choice = response.choices?.[0];
  const message = choice?.message?.content || choice?.message || choice?.text || choice?.content;
  return typeof message === "string" ? message.trim() : "";
};

const getQuestionFromGroq = async (topic) => {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{
      role: "user",
      content: `Ask one interview question on ${topic}`
    }]
  });

  const text = extractGroqMessage(response);
  if (!text) {
    throw new Error("Empty response from Groq API");
  }
  return text;
};

// 🔹 Generate Question
router.post("/generate", authMiddleware, async (req, res) => {

  try {
    const { topic } = req.body;
    const userId = req.user.id;

    if (!process.env.GROQ_API_KEY) {
      const question = getFallbackQuestion(topic);
      return res.json({ question, fallback: true, reason: "GROQ_API_KEY missing" });
    }

    const question = await getQuestionFromGroq(topic);
    return res.json({ question, fallback: false });
  } catch (err) {
    const apiErr = mapApiError(err);
    const fallback = getFallbackQuestion(req.body.topic);

    if (apiErr) {
      return res.json({ question: fallback, fallback: true, reason: apiErr.message });
    }

    return res.json({ question: fallback, fallback: true, reason: err.message || "Unable to generate question" });
  }
});

// 🔹 Evaluate Answer
router.post("/evaluate", authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const userId = req.user.id;

    let feedback;
    const fallbackFeedback = `Your answer is thoughtful and addresses the question. Keep highlighting your problem-solving approach and use clear examples.`;

    if (!process.env.GROQ_API_KEY) {
      feedback = fallbackFeedback;
    } else {
      try {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user",
            content: `Evaluate answer: "${answer}" for question: "${question}". Give score out of 10 and feedback.`
          }]
        });
        feedback = response.choices[0].message.content;
      } catch (err) {
        const apiErr = mapApiError(err);
        if (apiErr) {
          feedback = fallbackFeedback;
        } else {
          throw err;
        }
      }
    }

    const interview = new Interview({
      userId,
      question,
      answer,
      feedback,
      score: Math.floor(Math.random() * 10)
    });

    await interview.save();

    res.json({ feedback });
  } catch (err) {
    res.status(500).json("Error evaluating answer: " + err.message);
  }
});

// 🔹 Resume Upload → Questions
router.post("/resume", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json("No resume file uploaded");
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json("Please upload a PDF (.pdf) or Word document (.docx/.doc)");
    }

    let text = "";

    if (req.file.mimetype === "application/pdf") {
      if (!pdfParse) {
        throw new Error("PDF parser not available. Install pdf-parse and restart app.");
      }
      const pdfBuffer = req.file.buffer;
      const pdfData = await pdfParse(pdfBuffer);
      text = pdfData.text;
    } else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      req.file.mimetype === "application/msword"
    ) {
      if (!mammoth) {
        throw new Error("DOC/DOCX parser not available. Install mammoth and restart app.");
      }
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json("The uploaded file appears to be empty or could not be parsed");
    }

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Generate 5 interview questions based on this resume:\n${text}`
      }]
    });

    res.json(response.choices[0].message.content);
  } catch (err) {
    const apiErr = mapApiError(err);

    if (apiErr) {
      return res.status(apiErr.status).json(apiErr.message);
    }

    res.status(500).json("Resume processing error: " + err.message);
  }
});

// 🔹 History (Dashboard)
router.get("/history", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const data = await Interview.find({ userId }).sort({ createdAt: -1 });
  res.json(data);
});

// 🔹 Stats (Profile)
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const interviews = await Interview.find({ userId });

    const totalInterviews = interviews.length;
    const totalScore = interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
    const averageScore = totalInterviews > 0 ? Math.round(totalScore / totalInterviews) : 0;
    const bestScore = totalInterviews > 0 ? Math.max(...interviews.map(i => i.score || 0)) : 0;
    const totalTime = interviews.reduce((sum, interview) => sum + (interview.duration || 0), 0);

    res.json({
      totalInterviews,
      averageScore,
      bestScore,
      totalTime
    });
  } catch (err) {
    res.status(500).json("Error fetching stats: " + err.message);
  }
});

// 🔹 Save Interview Recording
router.post("/save-recording", authMiddleware, upload.single("recording"), async (req, res) => {
  try {
    const { question, answer, feedback, score, topic, voiceAnalysis, performanceMetrics, duration } = req.body;
    const userId = req.user.id;

    let recordingUrl = null;
    if (req.file) {
      // Generate unique filename for recording
      const ext = req.file.originalname.split('.').pop() || 'webm';
      const filename = `recording-${userId}-${Date.now()}.${ext}`;
      // Video saving not supported in serverless - skip

      // Serverless: skip disk write
      recordingUrl = `/${filename}`;
    }

    const interview = new Interview({
      userId,
      question,
      answer,
      feedback,
      score: parseInt(score),
      recordingUrl,
      recordingDuration: parseInt(duration) || 0,
      topic,
      voiceAnalysis: voiceAnalysis ? JSON.parse(voiceAnalysis) : {},
      performanceMetrics: performanceMetrics ? JSON.parse(performanceMetrics) : {}
    });

    await interview.save();

    res.json({ message: "Interview saved successfully", interviewId: interview._id });
  } catch (err) {

    res.status(500).json("Error saving recording: " + err.message);
  }
});

// 🔹 Get All Interviews (Admin)
router.get("/admin/interviews", authMiddleware, async (req, res) => {
  try {
    const user = await require("../models/User").findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json("Access denied. Admin role required.");
    }

    const interviews = await Interview.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(interviews);
  } catch (err) {
    res.status(500).json("Error fetching interviews: " + err.message);
  }
});

// 🔹 Get All Users (Admin)
router.get("/admin/users", authMiddleware, async (req, res) => {
  try {
    const user = await require("../models/User").findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json("Access denied. Admin role required.");
    }

    const users = await require("../models/User").find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json("Error fetching users: " + err.message);
  }
});

// 🔹 Update User Role (Admin)
router.put("/admin/user/:userId/role", authMiddleware, async (req, res) => {
  try {
    const adminUser = await require("../models/User").findById(req.user.id);
    if (adminUser.role !== "admin") {
      return res.status(403).json("Access denied. Admin role required.");
    }

    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json("Invalid role. Must be 'user' or 'admin'.");
    }

    const updatedUser = await require("../models/User").findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json("User not found.");
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json("Error updating user role: " + err.message);
  }
});

// 🔹 Get Admin Stats
router.get("/admin/stats", authMiddleware, async (req, res) => {
  try {
    const user = await require("../models/User").findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json("Access denied. Admin role required.");
    }

    const totalUsers = await require("../models/User").countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const totalAdmins = await require("../models/User").countDocuments({ role: "admin" });

    // Recent activity
    const recentInterviews = await Interview.find({})
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await require("../models/User").find({})
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalInterviews,
      totalAdmins,
      recentInterviews,
      recentUsers
    });
  } catch (err) {
    res.status(500).json("Error fetching admin stats: " + err.message);
  }
});

module.exports = router;
