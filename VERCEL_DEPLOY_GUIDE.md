# 🚀 Vercel Deployment Guide — AI Interview Preparation System

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup (Free)
- Go to https://cloud.mongodb.com → Sign up/Login
- Create a free **M0 Cluster**
- Add a Database User (username + password)
- Network Access → Add IP → **0.0.0.0/0** (allow all)
- Get connection string: `mongodb+srv://<user>:<pass>@cluster.mongodb.net/ai-interview`

### 2. Groq API Key (Free)
- Go to https://console.groq.com → Sign up
- API Keys → Create new key
- Copy it (starts with `gsk_...`)

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - AI Interview App"
git remote add origin https://github.com/YOUR_USERNAME/ai-interview.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com → Login with GitHub
2. Click **"Add New Project"**
3. Import your `ai-interview` repository
4. **Framework Preset**: Other
5. **Root Directory**: `.` (keep as root)
6. **Build Command**: `cd client && npm install && npm run build`
7. **Output Directory**: `client/build`
8. Click **"Environment Variables"** — add these:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/ai-interview` |
| `JWT_SECRET` | `any_random_long_string_here` |
| `GROQ_API_KEY` | `gsk_your_groq_key_here` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-app-name.vercel.app` (fill after first deploy) |

9. Click **"Deploy"** 🎉

### Step 3: After First Deploy
- Copy your Vercel URL (e.g. `https://ai-interview-abc123.vercel.app`)
- Go to Vercel → Project Settings → Environment Variables
- Update `CLIENT_URL` with your actual URL
- Redeploy

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| MongoDB connection error | Check MONGO_URI, whitelist IP 0.0.0.0/0 in Atlas |
| Groq API error | Verify GROQ_API_KEY is correct in Vercel env vars |
| 404 on page refresh | Already fixed via vercel.json rewrites |
| CORS error | Add CLIENT_URL env var with your Vercel URL |
| Build fails | Check Vercel build logs, usually a missing dependency |

---

## 📁 Project Structure (Vercel Ready)
```
ai-interview/
├── vercel.json          ← Vercel routing config
├── .gitignore           ← Excludes .env, node_modules
├── package.json         ← Root build scripts
├── server/
│   ├── server.js        ← Express API (serverless function)
│   ├── .env.example     ← Template for env vars
│   └── ...
└── client/
    ├── vercel.json      ← SPA routing (React Router)
    ├── .env.production  ← Frontend env (REACT_APP_API_URL)
    └── ...
```

---

## 🔑 Environment Variables Summary

### Vercel Dashboard mein set karo (Server):
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Koi bhi random string (secret key)
- `GROQ_API_KEY` — Groq API key (gsk_...)
- `NODE_ENV` — `production`
- `CLIENT_URL` — Your Vercel app URL

### Client Side (.env.production):
- `REACT_APP_API_URL` — Blank rakho agar same Vercel project hai

---

**App URL format after deploy:** `https://ai-interview-XXXXX.vercel.app`
