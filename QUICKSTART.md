# 🚀 QUICK START GUIDE

## ⚡ 3-Minute Setup

### Step 1: Configure Groq API Key
```bash
# Edit: server\.env
# Add your Groq API key from https://console.groq.com

GROQ_API_KEY=your_key_here
```

### Step 2: Start Server (Terminal 1)
```bash
cd server
npm start
# Wait for: "MongoDB Connected" ✅
```

### Step 3: Start Client (Terminal 2)
```bash
cd client
npm start
# Browser opens at http://localhost:3000
```

### Step 4: Test It Out
1. Click "Sign up here"
2. Create account with any email
3. Go to "📚 Topics"
4. Select a topic
5. Click "Start Interview"
6. Click "Generate Question"
7. Answer with mic or text
8. Get instant feedback!

---

## 📋 File Locations

```
AI Interview Webapp/
├── server/
│   └── .env                    ← PUT GROQ KEY HERE
├── client/
│   └── src/pages/              ← All 9 pages built
└── README.md, FEATURES.md      ← Full docs
```

---

## ✅ Features Included

✨ 9 Complete Pages:
- Login / Register
- Dashboard with charts
- Interview practice
- Topic selection (8 topics)
- Resume upload
- Interview history
- User profile
- Settings
- Navbar with all links

🎯 Core Features:
- JWT Authentication
- AI Questions (Groq)
- Speech Recognition
- Text-to-Speech
- Resume Analysis
- Performance Tracking
- History Review
- Profile Management

---

## 🎮 How to Use

1. **Register** → Create new account
2. **Select Topic** → Choose from 8 topics
3. **Practice Interview** → Answer AI questions
4. **Get Feedback** → See instant evaluation
5. **Upload Resume** → Get personalized questions
6. **Track Progress** → View history & stats

---

## 🐛 If Something Breaks

**Server won't start:**
```bash
# Check MongoDB is running
# Check Groq API key in .env
# Check port 5000 is free
```

**Client won't start:**
```bash
# Delete node_modules and reinstall
rm -rf client/node_modules
cd client && npm install && npm start
```

**Camera/Mic issues:**
- Allow browser permissions
- Check browser settings
- Try different browser

---

## 📱 Test Credentials

Create any account during registration!
Example:
```
Email: user@example.com
Password: anything123
Name: Your Name
```

---

## ✨ Your App Is Ready!

All features built, tested, and ready to run.
Just add your Groq API key and start the servers! 🎉

Need help? Check:
- README.md - Full documentation
- SETUP.md - Detailed setup guide
- FEATURES.md - Complete feature list
