const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashed
    });

    await user.save();
    res.json("User Registered");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/test", (req, res) => {
  res.json({ status: "ok", message: "Auth route is working" });
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json("User not found");

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    // Calculate profile completion
    const profileFields = [
      'name', 'bio', 'jobTitle', 'company', 'location',
      'skills', 'interests', 'experience', 'education'
    ];
    const filledFields = profileFields.filter(field => {
      if (Array.isArray(user[field])) return user[field].length > 0;
      return user[field] && user[field].trim() !== '';
    });
    const completion = Math.round((filledFields.length / profileFields.length) * 100);

    // Update completion if changed
    if (user.profileCompletion !== completion) {
      user.profileCompletion = completion;
      await user.save();
    }

    res.json({
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      jobTitle: user.jobTitle,
      company: user.company,
      location: user.location,
      skills: user.skills || [],
      interests: user.interests || [],
      linkedin: user.linkedin,
      github: user.github,
      portfolio: user.portfolio,
      experience: user.experience,
      education: user.education,
      achievements: user.achievements || [],
      profileCompletion: completion,
      theme: user.theme,
      role: user.role,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name, bio, avatar, jobTitle, company, location,
      skills, interests, linkedin, github, portfolio,
      experience, education, achievements, theme
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        bio,
        avatar,
        jobTitle,
        company,
        location,
        skills: skills || [],
        interests: interests || [],
        linkedin,
        github,
        portfolio,
        experience,
        education,
        achievements: achievements || [],
        theme: theme || 'dark',
        lastActive: new Date()
      },
      { new: true }
    );

    // Recalculate profile completion
    const profileFields = [
      'name', 'bio', 'jobTitle', 'company', 'location',
      'skills', 'interests', 'experience', 'education'
    ];
    const filledFields = profileFields.filter(field => {
      if (Array.isArray(user[field])) return user[field].length > 0;
      return user[field] && user[field].trim() !== '';
    });
    const completion = Math.round((filledFields.length / profileFields.length) * 100);
    user.profileCompletion = completion;
    await user.save();

    res.json({
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      jobTitle: user.jobTitle,
      company: user.company,
      location: user.location,
      skills: user.skills,
      interests: user.interests,
      linkedin: user.linkedin,
      github: user.github,
      portfolio: user.portfolio,
      experience: user.experience,
      education: user.education,
      achievements: user.achievements,
      profileCompletion: completion,
      theme: user.theme,
      role: user.role,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;