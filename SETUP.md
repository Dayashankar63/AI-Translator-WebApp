# 🚀 AI Interview App - Complete Setup Guide

## Step-by-Step Setup Instructions

### ✅ Prerequisites Check

Before you start, make sure you have:

1. **Node.js** installed (v14 or higher)
   ```bash
   node --version
   ```

2. **MongoDB** running locally
   - Windows: Install from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Or use MongoDB Atlas cloud (update MONGO_URI in .env)

3. **Groq API Key** from https://console.groq.com
   - Sign up for free account
   - Go to API Keys
   - Copy your API key

---

## 📦 Installation

### 1. Navigate to Project Directory

```bash
cd c:\Users\Dell\OneDrive\Desktop\AI Interview Webapp
```

### 2. Install Root Dependencies (if any)

```bash
npm install
```

### 3. Setup Server

```bash
cd server

# Install dependencies
npm install

# Create/Update .env file with:
echo PORT=5000 > .env
echo MONGO_URI=mongodb://127.0.0.1:27017/ai-interview >> .env
echo JWT_SECRET=my_secret_key12345 >> .env
echo GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE >> .env
```

**Replace `YOUR_GROQ_API_KEY_HERE` with your actual key from Groq**

### 4. Setup Client

```bash
cd ../client

# Install dependencies
npm install

# The .env file is already configured (JWT only, no external auth)
```

---

## 🎯 Running the Application

### Option 1: Run Both in VS Code (Recommended)

**Terminal 1 - Start Server:**
```bash
cd server
npm start
```
You should see:
```
Server running on port 5000
MongoDB Connected
```

**Terminal 2 (New) - Start Client:**
```bash
cd client
npm start
```
Browser will open at `http://localhost:3000`

### Option 2: One-Click Start (Windows)

From project root, double-click:
```
start.bat
```

This will open both server and client in separate windows.

### Option 3: Command Line Start (Windows)

```bash
# Terminal 1
cd server && npm start

# Terminal 2 (New terminal)
cd client && npm start
```

---

## 🧪 Testing the App

### 1. Create an Account

**On Login Page:**
- Click "Sign up here"
- Fill in:
  - Full Name: `John Doe`
  - Email: `test@example.com`
  - Password: `password123`
- Click "Sign Up"

### 2. Login

- Email: `test@example.com`
- Password: `password123`
- Click "Sign In"

### 3. Practice Interview

1. **Go to Topics:**
   - Click "📚 Topics" in navbar
   - Select "React" (or any topic)
   - Click "Start Interview"

2. **Practice Question:**
   - Click "Generate Question"
   - AI generates a React question
   - Answer using your microphone (or type)
   - Click "Submit"
   - Get instant AI feedback

### 4. Upload Resume

1. Click "📄 Resume" in navbar
2. Upload a PDF or DOCX resume
3. Get 5 personalized interview questions

### 5. View History

1. Click "📋 History" in navbar
2. See all past interviews
3. Click to expand and see detailed feedback

### 6. View Profile

1. Click "👤 Profile" in navbar
2. Edit your name
3. See account info

### 7. Adjust Settings

1. Click "⚙️ Settings" in navbar
2. Change:
   - Difficulty level
   - Language
   - Microphone volume
   - Auto-play questions

---

## 📁 Project Structure

```
AI Interview Webapp/
├── server/
│   ├── .env                 ← Configure here
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Interview.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── interview.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── package.json
│
├── client/
│   ├── .env                 ← Already configured
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Interview.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── ResumeUpload.jsx
│   │       ├── Profile.jsx
│   │       ├── Settings.jsx
│   │       ├── Topics.jsx
│   │       └── History.jsx
│   └── package.json
│
├── README.md                ← Full documentation
├── start.bat                ← Windows quick start
├── start.sh                 ← Linux/Mac quick start
└── SETUP.md                 ← This file
```

---

## 🔑 Key Features Checklist

- ✅ User Registration & Login (JWT)
- ✅ Topic Selection (8 topics)
- ✅ AI Interview Questions (Groq Llama 3)
- ✅ Speech Recognition (Web Speech API)
- ✅ Text-to-Speech Feedback
- ✅ Resume Upload & Analysis (PDF/DOCX)
- ✅ Performance Dashboard (Charts)
- ✅ Interview History (All sessions)
- ✅ User Profile Management
- ✅ Settings & Preferences
- ✅ Mobile Responsive UI

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

### Port 5000 Already in Use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Error

1. Check if MongoDB is running:
   ```bash
   mongosh
   ```

2. If not running, start it:
   - **Windows:** Run MongoDB from Services
   - **Mac:** `brew services start mongodb-community`
   - **Linux:** `sudo service mongod start`

### Groq API Error

- Check your API key in `server/.env`
- Make sure it's valid at https://console.groq.com
- Check your API quota/limits
- API rate limits: 30 requests per minute (free tier)

### "Cannot find module" Error

```bash
# In server folder
npm install

# In client folder  
npm install
```

### Camera Permission Denied

- Browser will ask for camera access on first Interview page visit
- Click "Allow" when prompted
- If denied, check browser settings and allow camera access

---

## 🌐 API Documentation

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create new account |
| POST | `/api/auth/login` | ❌ | Login & get JWT |
| GET | `/api/auth/profile` | ✅ | Get user profile |
| PUT | `/api/auth/profile` | ✅ | Update user profile |

### Interview Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/interview/generate` | ✅ | Generate AI question |
| POST | `/api/interview/evaluate` | ✅ | Evaluate answer |
| POST | `/api/interview/resume` | ✅ | Upload & analyze resume |
| GET | `/api/interview/history` | ✅ | Get all interviews |

**✅ = Requires Authorization header with JWT token**

---

## 📊 Performance Tips

### Optimize for Production

Before deploying to Vercel:

1. **Build client for production:**
   ```bash
   cd client
   npm run build
   ```

2. **Set environment variables in Vercel dashboard**

3. **Connect MongoDB Atlas** instead of local MongoDB:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview
   ```

4. **Use production Groq API key**

---

## 🚀 Deployment to Vercel

### Step 1: Prepare for Deployment

1. Push code to GitHub
2. Make sure `server/.env` is in `.gitignore` (don't commit secrets!)

### Step 2: Deploy on Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. Set environment variables:
   - `MONGO_URI` (MongoDB Atlas URL)
   - `JWT_SECRET` (secure random string)
   - `GROQ_API_KEY` (your Groq API key)
5. Deploy!

### Step 3: Configure Backend

For Vercel serverless backend, you'll need to restructure. Contact for help with this step.

---

## 📞 Support & Help

### Common Questions

**Q: Why do I need MongoDB?**
A: Store user accounts, interview history, and feedback

**Q: Why Groq API?**
A: Free, fast AI for generating interview questions

**Q: Can I use a different AI?**
A: Yes, change in `server/routes/interview.js`

**Q: How many interviews can I practice?**
A: Unlimited (Groq free tier: 30 req/min, 14,400 req/day)

**Q: Is my data private?**
A: Yes, local MongoDB or your own Atlas cluster

---

## 📈 Next Steps After Setup

1. ✅ Test with sample interview
2. ✅ Upload your resume
3. ✅ Change settings to your preference
4. ✅ Practice multiple topics
5. ✅ Review your history for improvements
6. ✅ Deploy to Vercel when ready

---

**Happy practicing! 🎯**
