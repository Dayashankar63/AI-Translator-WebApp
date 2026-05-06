# 🚀 Vercel Deploy — Step by Step

## Ek ZIP se Deploy karna (Recommended)

### Step 1: MongoDB Atlas (Free Cloud Database)
1. https://cloud.mongodb.com → Sign Up (Free)
2. New Project → Create Cluster → Free Tier select karo
3. Database Access → Add User → Username + Password note karo
4. Network Access → Add IP → `0.0.0.0/0` (Allow from anywhere)
5. Connect → Drivers → Connection string copy karo:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-interview
   ```

### Step 2: GROQ API Key
1. https://console.groq.com → Sign Up
2. API Keys → Create → Copy karo

### Step 3: Vercel pe Deploy (Backend Server)
1. https://vercel.com → New Project
2. **"Upload" option** select karo → `AI_Interview_Deploy.zip` upload karo
3. **Root Directory** → `AI_Interview_Responsive/server` set karo
4. **Environment Variables** add karo:
   ```
   MONGO_URI     = mongodb+srv://...  (Step 1 ka connection string)
   GROQ_API_KEY  = gsk_...            (Step 2 ka key)
   JWT_SECRET    = MyStr0ngS3cr3t!    (koi bhi strong string)
   CLIENT_URL    = (baad mein frontend URL dalenge)
   ```
5. Deploy → **Backend URL copy karo** (e.g. `https://ai-interview-abc123.vercel.app`)

### Step 4: Vercel pe Deploy (Frontend Client)
1. Vercel → New Project → Same ZIP upload karo
2. **Root Directory** → `AI_Interview_Responsive/client` set karo
3. **Environment Variables** add karo:
   ```
   REACT_APP_API_URL = https://ai-interview-abc123.vercel.app  (Step 3 ka URL)
   ```
4. Deploy → **Frontend URL copy karo**

### Step 5: Backend mein CLIENT_URL update karo
1. Vercel → Backend project → Settings → Environment Variables
2. `CLIENT_URL` = Frontend URL (Step 4 se)
3. Redeploy karo

---

## ✅ Saari Errors Jo Fix Hui Hain
- favicon.ico 404 → Fixed
- TypeError: Cannot read properties of null (reading 'width') → Fixed  
- Console.log spam → Removed
- CORS Vercel ke liye → Fixed
- Axios baseURL auto-switch → Fixed

## 🧪 Local Test Karna (Optional)
```bash
# Server start karo
cd server
npm install
# .env.example ko copy karke .env banao aur values bharo
cp .env.example .env
npm start

# Client start karo (naya terminal)
cd client
npm install
npm start
```
