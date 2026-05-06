const router = require("express").Router();
const Interview = require("../models/Interview");
const User = require("../models/User");
const Groq = require("groq-sdk");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

let pdfParse;
try { pdfParse = require("pdf-parse"); } catch (e) {}
let mammoth;
try { mammoth = require("mammoth"); } catch (e) {}

const upload = multer({ storage: multer.memoryStorage() });

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const groqChat = async (prompt, maxTokens = 500) => {
  const res = await client.chat.completions.create({
    model: "llama3-8b-8192",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }]
  });
  return res.choices[0].message.content.trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. AI INTERVIEW COACH — Real-time tips for an answer-in-progress
// ─────────────────────────────────────────────────────────────────────────────
router.post("/coach-tip", authMiddleware, async (req, res) => {
  try {
    const { question, partialAnswer } = req.body;
    if (!question) return res.status(400).json({ error: "question required" });

    const prompt = `You are an expert interview coach. The candidate is answering this question:
"${question}"

Their answer so far: "${partialAnswer || "(nothing yet)"}"

Give ONE short, actionable coaching tip (max 2 sentences) in the same language as their answer.
Focus on: length, examples, confidence, clarity, or missing keywords.
Respond with ONLY the tip, no preamble.`;

    const tip = await groqChat(prompt, 120);
    res.json({ tip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. RESUME vs ANSWER MATCH SCORE
// ─────────────────────────────────────────────────────────────────────────────
router.post("/resume-match", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    const { answer, question } = req.body;

    let resumeText = "";
    if (req.file) {
      if (req.file.mimetype === "application/pdf" && pdfParse) {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } else if (mammoth) {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = result.value;
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    if (!resumeText) return res.status(400).json({ error: "Resume text required" });

    const prompt = `You are an HR expert. Compare this resume with the interview answer.

RESUME (first 1500 chars):
${resumeText.slice(0, 1500)}

QUESTION: "${question}"
ANSWER: "${answer}"

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "matchScore": <0-100 integer>,
  "matchedSkills": ["skill1", "skill2"],
  "missingFromAnswer": ["item mentioned in resume but not in answer"],
  "suggestion": "one sentence suggestion"
}`;

    const raw = await groqChat(prompt, 300);
    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { matchScore: 60, matchedSkills: [], missingFromAnswer: [], suggestion: raw };
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. INTERVIEW REPLAY — fetch past interview with Q+A+feedback
// ─────────────────────────────────────────────────────────────────────────────
router.get("/replay/:id", authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: "Not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/replay-list", authMiddleware, async (req, res) => {
  try {
    const list = await Interview.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("question score topic createdAt feedback")
      .limit(50);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PDF SCORECARD — generate scorecard data (PDF generated on frontend)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/scorecard/:interviewId", authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.interviewId, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: "Not found" });

    const user = await User.findById(req.user.id).select("name email");

    // Generate strengths/weaknesses via AI
    const prompt = `Based on this interview feedback, list 3 strengths and 3 weaknesses in JSON.
Feedback: "${interview.feedback}"
Score: ${interview.score}/10
Respond ONLY with JSON: {"strengths":["..."],"weaknesses":["..."]}`;

    let aiInsights = { strengths: [], weaknesses: [] };
    try {
      const raw = await groqChat(prompt, 200);
      const clean = raw.replace(/```json|```/g, "").trim();
      aiInsights = JSON.parse(clean);
    } catch {}

    res.json({
      user: { name: user.name, email: user.email },
      interview: {
        id: interview._id,
        question: interview.question,
        answer: interview.answer,
        feedback: interview.feedback,
        score: interview.score,
        topic: interview.topic,
        date: interview.createdAt
      },
      insights: aiInsights
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. DAILY CHALLENGE — one question per day + streak tracking
// ─────────────────────────────────────────────────────────────────────────────
const dailyChallenges = [
  "Explain the difference between synchronous and asynchronous programming.",
  "What is the STAR method in interviews and give an example?",
  "Describe a time you handled a conflict with a team member.",
  "What is your greatest professional achievement?",
  "How do you handle tight deadlines and pressure?",
  "What motivates you to do your best work?",
  "Describe your ideal work environment.",
  "Tell me about a project where you had to learn a new technology quickly.",
  "How do you prioritize tasks when everything seems urgent?",
  "What is your biggest weakness and how are you working on it?"
];

router.get("/daily-challenge", authMiddleware, async (req, res) => {
  try {
    // Deterministic question per day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const question = dailyChallenges[dayOfYear % dailyChallenges.length];

    // Calculate streak from user's interview history
    const interviews = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const seenDays = new Set();
    for (const iv of interviews) {
      const d = new Date(iv.createdAt); d.setHours(0,0,0,0);
      seenDays.add(d.getTime());
    }
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      if (seenDays.has(d.getTime())) streak++;
      else break;
    }

    res.json({ question, streak, dayOfYear });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$userId", avgScore: { $avg: "$score" }, totalInterviews: { $sum: 1 } } },
      { $sort: { avgScore: -1 } },
      { $limit: 20 }
    ];
    const data = await Interview.aggregate(pipeline);
    const ids = data.map(d => d._id);
    const users = await User.find({ _id: { $in: ids } }).select("name");
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u.name; });

    const leaderboard = data.map((d, i) => ({
      rank: i + 1,
      name: userMap[d._id] || "Anonymous",
      avgScore: Math.round(d.avgScore * 10) / 10,
      totalInterviews: d.totalInterviews,
      isCurrentUser: d._id === req.user.id
    }));

    // Current user rank
    const myEntry = leaderboard.find(e => e.isCurrentUser);

    res.json({ leaderboard, myRank: myEntry?.rank || null, total: leaderboard.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. RESUME ATS SCORE
// ─────────────────────────────────────────────────────────────────────────────
router.post("/ats-score", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || "";
    if (req.file) {
      if (req.file.mimetype === "application/pdf" && pdfParse) {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } else if (mammoth) {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = result.value;
      }
    }
    if (!resumeText) return res.status(400).json({ error: "Resume required" });

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume and return ONLY valid JSON:
{
  "atsScore": <0-100 integer>,
  "keywordsFound": ["keyword1","keyword2"],
  "missingKeywords": ["keyword1","keyword2"],
  "formatIssues": ["issue1","issue2"],
  "improvements": ["tip1","tip2","tip3"]
}

Resume (first 2000 chars):
${resumeText.slice(0, 2000)}`;

    const raw = await groqChat(prompt, 400);
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { atsScore: 65, keywordsFound: [], missingKeywords: [], formatIssues: [], improvements: [raw] };
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. JOB DESCRIPTION MATCH
// ─────────────────────────────────────────────────────────────────────────────
router.post("/jd-match", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ error: "Job description required" });

    let resumeText = req.body.resumeText || "";
    if (req.file) {
      if (req.file.mimetype === "application/pdf" && pdfParse) {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } else if (mammoth) {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = result.value;
      }
    }
    if (!resumeText) return res.status(400).json({ error: "Resume required" });

    const prompt = `Compare this resume with the job description. Return ONLY valid JSON:
{
  "fitScore": <0-100 integer>,
  "matchedSkills": ["skill1","skill2"],
  "missingSkills": ["skill1","skill2"],
  "verdict": "one sentence summary",
  "tips": ["tip1","tip2"]
}

JOB DESCRIPTION:
${jobDescription.slice(0, 800)}

RESUME (first 1500 chars):
${resumeText.slice(0, 1500)}`;

    const raw = await groqChat(prompt, 400);
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { fitScore: 60, matchedSkills: [], missingSkills: [], verdict: raw, tips: [] };
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. ANSWER IMPROVEMENT SUGGESTER
// ─────────────────────────────────────────────────────────────────────────────
router.post("/improve-answer", authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ error: "question and answer required" });

    const prompt = `You are an expert interview coach. Improve this candidate's answer.

Question: "${question}"
Original Answer: "${answer}"

Return ONLY valid JSON:
{
  "improvedAnswer": "the improved version of the answer",
  "whatWasImproved": ["point1","point2","point3"],
  "score": <original score 0-10>
}`;

    const raw = await groqChat(prompt, 500);
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { improvedAnswer: raw, whatWasImproved: [], score: 5 };
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. COMPANY-WISE QUESTION BANK
// ─────────────────────────────────────────────────────────────────────────────
const questionBank = {
  Google: {
    HR: ["Why do you want to work at Google?", "Describe a time you failed and what you learned.", "How do you handle ambiguity?"],
    Technical: ["Implement a function to detect a cycle in a linked list.", "Design a URL shortener system.", "Explain how Google's PageRank works."],
    Puzzle: ["How many golf balls fit in a school bus?", "How would you weigh an elephant without a scale?"],
    Managerial: ["How do you prioritize features for a product?", "Tell me about a time you led a cross-functional team."]
  },
  Amazon: {
    HR: ["Tell me about a time you had to take ownership of a project.", "Describe a situation where you had to deliver results under pressure."],
    Technical: ["Design an e-commerce recommendation system.", "Implement LRU Cache.", "How would you design Amazon's order management system?"],
    Puzzle: ["How would you handle 1 million requests per second?"],
    Managerial: ["How do you ensure customer obsession in your team?", "Describe a time you had to make a decision with incomplete data."]
  },
  TCS: {
    HR: ["Why do you want to join TCS?", "Tell me about yourself.", "Where do you see yourself in 5 years?"],
    Technical: ["What is the difference between process and thread?", "Explain OOPS concepts.", "What is normalization in databases?"],
    Puzzle: ["If you had to test a pen, how would you do it?"],
    Managerial: ["How do you manage multiple projects simultaneously?"]
  },
  Infosys: {
    HR: ["What are your strengths and weaknesses?", "Why did you choose your field of study?"],
    Technical: ["Explain RESTful web services.", "What is the difference between abstract class and interface?", "Explain MVC architecture."],
    Puzzle: ["You have 8 balls, one is heavier. Find it in 2 weighings."],
    Managerial: ["How do you handle a difficult team member?"]
  },
  Microsoft: {
    HR: ["What makes you a good fit for Microsoft?", "Describe your biggest professional challenge."],
    Technical: ["Design a distributed cache system.", "Implement a binary search tree.", "How does garbage collection work in .NET?"],
    Puzzle: ["How would you design an elevator system?"],
    Managerial: ["How do you mentor junior developers?", "Tell me about a time you drove a culture change."]
  }
};

router.get("/question-bank", authMiddleware, async (req, res) => {
  try {
    const { company, category } = req.query;
    if (company && questionBank[company]) {
      if (category && questionBank[company][category]) {
        return res.json({ company, category, questions: questionBank[company][category] });
      }
      return res.json({ company, questions: questionBank[company] });
    }
    // Return all company names and categories
    const summary = Object.keys(questionBank).map(c => ({
      company: c,
      categories: Object.keys(questionBank[c]),
      totalQuestions: Object.values(questionBank[c]).reduce((s, a) => s + a.length, 0)
    }));
    res.json({ companies: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate AI question for a company
router.post("/question-bank/generate", authMiddleware, async (req, res) => {
  try {
    const { company, category } = req.body;
    const prompt = `Generate 3 unique ${category || "interview"} questions that ${company || "a top tech company"} would ask. Return ONLY a JSON array of strings.`;
    const raw = await groqChat(prompt, 300);
    let questions;
    try {
      questions = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      questions = [raw];
    }
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
