# 🎯 AI Interview - Complete Interview Practice Platform

A full-featured AI-powered interview platform with real-time feedback, resume analysis, and performance tracking.

## ✨ Features

- ✅ **User Authentication** - Secure JWT-based login/registration
- ✅ **AI Interview Practice** - Generate questions using Groq AI
- ✅ **Multiple Topics** - Practice on JavaScript, React, Python, Java, etc.
- ✅ **Voice Support** - Speech recognition and text-to-speech feedback
- ✅ **Resume Analysis** - Upload PDF/DOCX resume to get personalized questions
- ✅ **Performance Dashboard** - Track scores with charts and analytics
- ✅ **Interview History** - Detailed history of all practice sessions
- ✅ **User Profile** - Edit name and view account info
- ✅ **Settings** - Difficulty levels, language, mic volume preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- MongoDB running locally (mongodb://localhost:27017)
- Groq API Key (get from https://console.groq.com)

### Setup & Run

**1. Clone and install dependencies:**
```bash
cd c:\Users\Dell\OneDrive\Desktop\AI Interview Webapp
npm install  # Install root dependencies (if any)
```

**2. Setup Server:**
```bash
cd server
npm install
# Update .env with your Groq API key
echo GROQ_API_KEY=your_groq_api_key >> .env
npm start
# Server will run on http://localhost:5000
```

**3. Setup Client (in NEW terminal):**
```bash
cd client
npm install
npm start
# App will open at http://localhost:3000
```

### Run Both Simultaneously (Quick Method)

**Terminal 1 - Start Server:**
```bash
cd server && npm start
```

**Terminal 2 - Start Client:**
```bash
cd client && npm start
```

## 📋 Environment Files

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-interview
JWT_SECRET=my_secret_key12345
GROQ_API_KEY=your_groq_api_key_here
```

### Client (.env)
```
# No special env variables needed - using JWT auth
```

## 🎯 Navigation

Once logged in, you can:
- **Dashboard** - View performance stats and charts
- **Topics** - Choose interview topic (JavaScript, React, Python, etc.)
- **Interview** - Practice with AI-generated questions
- **Resume** - Upload resume and get personalized questions
- **History** - View all past interviews with feedback
- **Profile** - View and edit user information
- **Settings** - Configure difficulty, language, preferences

## 🔧 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Interview
- `POST /api/interview/generate` - Generate question
- `POST /api/interview/evaluate` - Get AI feedback
- `POST /api/interview/resume` - Upload and analyze resume
- `GET /api/interview/history` - Get interview history

## 💡 Usage Examples

### 1. Register new user:
```
Email: test@example.com
Password: password123
Name: John Doe
```

### 2. Start interview:
- Go to Topics
- Select "React"
- Click "Start Interview"
- Click "Generate Question"
- Answer using microphone or text
- Get instant AI feedback

### 3. Upload resume:
- Go to Resume
- Upload PDF or DOCX
- Get 5 personalized questions

## 🛠️ Tech Stack

- **Frontend:** React, React Router, Axios, Chart.js
- **Backend:** Express.js, MongoDB, Mongoose
- **AI:** Groq API (Llama 3)
- **Auth:** JWT
- **File Upload:** Multer
- **Document Parsing:** pdf-parse, mammoth

## 📦 Deployment

To deploy on Vercel:

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
3. Vercel will auto-deploy on push

## 🐛 Troubleshooting

**Port 3000/5000 already in use:**
```bash
# Kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**MongoDB connection error:**
```bash
# Make sure MongoDB is running
mongod
# Or check connection string in .env
```

**Groq API error:**
- Verify API key in `.env`
- Check Groq dashboard for quota/limits

## 📄 License

MIT

## 🎓 Learn More

- [Groq API Docs](https://console.groq.com/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)

---

**Made with ❤️ for interview practice**
