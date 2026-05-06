import { useState, useEffect, useRef } from "react";
import axios from "../api";

export default function Profile() {
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    name: "", email: "", bio: "", avatar: "",
    jobTitle: "", company: "", location: "",
    skills: [], interests: [], linkedin: "", github: "",
    portfolio: "", experience: "", education: "",
    achievements: [], profileCompletion: 0, theme: "dark",
    createdAt: null, lastActive: null,
    phone: "", website: "", twitter: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState({ totalInterviews: 0, averageScore: 0, bestScore: 0, totalTime: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          axios.get("/api/auth/profile", { headers: { Authorization: token } }),
          axios.get("/api/interview/stats", { headers: { Authorization: token } })
            .catch(() => ({ data: { totalInterviews: 0, averageScore: 0, bestScore: 0, totalTime: 0 } })),
        ]);
        setUser({ ...profileRes.data, skills: profileRes.data.skills || [], interests: profileRes.data.interests || [], achievements: profileRes.data.achievements || [], phone: profileRes.data.phone || "", website: profileRes.data.website || "", twitter: profileRes.data.twitter || "" });
        setStats(statsRes.data);
      } catch (err) {
        setError("Profile load karne mein error aaya");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUserData();
  }, [token]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Sirf image files allowed hain (JPG, PNG, etc.)"); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Image 2MB se kam honi chahiye"); return; }
    try {
      setUploadingAvatar(true); setError("");
      const base64 = await fileToBase64(file);
      const updatedUser = { ...user, avatar: base64 };
      setUser(updatedUser);
      await axios.put("/api/auth/profile", updatedUser, { headers: { Authorization: token } });
      setSuccess("✅ Profile photo update ho gayi!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Photo upload mein error aaya");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const updatedUser = { ...user, avatar: "" };
      setUser(updatedUser);
      await axios.put("/api/auth/profile", updatedUser, { headers: { Authorization: token } });
      setSuccess("Photo remove ho gayi!"); setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Photo remove karne mein error"); }
  };

  const handleUpdate = async () => {
    try {
      setError(""); setSuccess("");
      const res = await axios.put("/api/auth/profile", user, { headers: { Authorization: token } });
      setUser({ ...res.data, skills: res.data.skills || [], interests: res.data.interests || [], achievements: res.data.achievements || [], phone: user.phone, website: user.website, twitter: user.twitter });
      setSuccess("🎉 Profile update ho gayi!"); setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.response?.data || "Update mein error aaya"); }
  };

  const addSkill = () => { if (newSkill.trim() && !user.skills.includes(newSkill.trim())) { setUser({ ...user, skills: [...user.skills, newSkill.trim()] }); setNewSkill(""); } };
  const removeSkill = (s) => setUser({ ...user, skills: user.skills.filter(x => x !== s) });
  const addInterest = () => { if (newInterest.trim() && !user.interests.includes(newInterest.trim())) { setUser({ ...user, interests: [...user.interests, newInterest.trim()] }); setNewInterest(""); } };
  const removeInterest = (i) => setUser({ ...user, interests: user.interests.filter(x => x !== i) });
  const addAchievement = () => { if (newAchievement.trim() && !user.achievements.includes(newAchievement.trim())) { setUser({ ...user, achievements: [...user.achievements, newAchievement.trim()] }); setNewAchievement(""); } };
  const removeAchievement = (a) => setUser({ ...user, achievements: user.achievements.filter(x => x !== a) });

  const exportProfile = () => {
    const data = { ...user, avatar: user.avatar ? "[Photo Data]" : "", stats, exportedAt: new Date().toISOString() };
    const uri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement("a"); a.href = uri; a.download = `profile-${(user.name || "user").replace(/\s+/g, "-").toLowerCase()}.json`; a.click();
  };

  const getInitials = (n) => n ? n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2) : "?";
  const getGradient = (n) => {
    const g = ["linear-gradient(135deg,#667eea,#764ba2)","linear-gradient(135deg,#f093fb,#f5576c)","linear-gradient(135deg,#4facfe,#00f2fe)","linear-gradient(135deg,#43e97b,#38f9d7)","linear-gradient(135deg,#ff8c00,#ff6b35)"];
    return g[(n ? n.charCodeAt(0) : 0) % g.length];
  };

  const inp = { width:"100%", padding:"12px 15px", borderRadius:"10px", border:"1.5px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.07)", color:"white", fontSize:"15px", outline:"none", boxSizing:"border-box" };
  const card = { background:"rgba(255,255,255,0.05)", borderRadius:"20px", padding:"28px", marginBottom:"22px", border:"1px solid rgba(255,255,255,0.1)" };
  const sh = { fontSize:"20px", fontWeight:"700", marginBottom:"20px", color:"#ff8c00", display:"flex", alignItems:"center", gap:"10px" };

  if (loading) return (
    <div style={{ background:"#090b13", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"60px", height:"60px", border:"4px solid rgba(255,140,0,0.2)", borderTop:"4px solid #ff8c00", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 20px" }}/>
        <div>Profile load ho rahi hai...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:"#090b13", minHeight:"100vh", color:"white" }}>
      {/* COVER */}
      <div style={{ position:"relative", background:"linear-gradient(135deg,#1a0533 0%,#0d1b4b 50%,#090b13 100%)", height:"220px", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 20% 50%,rgba(102,126,234,0.3) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(255,140,0,0.2) 0%,transparent 50%)" }}/>
        <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"200px", height:"200px", border:"2px solid rgba(255,140,0,0.15)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", top:"20px", right:"20px", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,140,0,0.4)", borderRadius:"20px", padding:"8px 16px", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:`conic-gradient(#ff8c00 ${user.profileCompletion*3.6}deg,rgba(255,255,255,0.1) 0deg)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"#0d1b4b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:"bold" }}>{user.profileCompletion}%</div>
          </div>
          <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.8)" }}>Profile Complete</span>
        </div>
      </div>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 20px" }}>
        {/* AVATAR + NAME ROW */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:"24px", marginTop:"-70px", marginBottom:"24px", flexWrap:"wrap" }}>
          {/* Avatar */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              title="Photo upload karein"
              style={{ width:"140px", height:"140px", borderRadius:"50%", background:user.avatar?"transparent":getGradient(user.name), backgroundImage:user.avatar?`url(${user.avatar})`:"none", backgroundSize:"cover", backgroundPosition:"center", border:"5px solid #090b13", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"52px", fontWeight:"bold", color:"white", cursor:"pointer", position:"relative", overflow:"hidden" }}
            >
              {!user.avatar && getInitials(user.name)}
              <div id="av-ov" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:"50%", gap:"4px", transition:"background 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(0,0,0,0.6)"; e.currentTarget.querySelector("span").style.opacity="1"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(0,0,0,0)"; e.currentTarget.querySelector("span").style.opacity="0"; }}
              >
                <span style={{ opacity:0, transition:"opacity 0.3s", textAlign:"center" }}>
                  <div style={{ fontSize:"24px" }}>📷</div>
                  <div style={{ fontSize:"11px", color:"white" }}>Change Photo</div>
                </span>
              </div>
            </div>
            <div onClick={() => fileInputRef.current?.click()} style={{ position:"absolute", bottom:"8px", right:"8px", width:"36px", height:"36px", background:"linear-gradient(135deg,#ff8c00,#ff6b35)", borderRadius:"50%", border:"3px solid #090b13", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"16px", boxShadow:"0 4px 12px rgba(255,140,0,0.4)" }}>
              {uploadingAvatar ? "⏳" : "📷"}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:"none" }}/>
          </div>

          {/* Name block */}
          <div style={{ flex:1, paddingBottom:"8px", minWidth:"200px" }}>
            <h1 style={{ fontSize:"32px", fontWeight:"800", color:"white", marginBottom:"4px" }}>{user.name || "Aapka Naam"}</h1>
            {user.jobTitle && <p style={{ fontSize:"17px", color:"rgba(255,255,255,0.85)", marginBottom:"6px" }}>{user.jobTitle}{user.company && <span style={{ color:"#ff8c00" }}> @ {user.company}</span>}</p>}
            <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", marginTop:"8px" }}>
              {user.location && <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)" }}>📍 {user.location}</span>}
              {user.email && <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)" }}>📧 {user.email}</span>}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", paddingBottom:"8px" }}>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{ padding:"12px 24px", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", borderRadius:"30px", fontSize:"15px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 15px rgba(102,126,234,0.4)" }}>✏️ Edit Profile</button>
            ) : (<>
              <button onClick={handleUpdate} style={{ padding:"12px 24px", background:"linear-gradient(135deg,#4CAF50,#45a049)", color:"white", border:"none", borderRadius:"30px", fontSize:"15px", fontWeight:"700", cursor:"pointer" }}>💾 Save</button>
              <button onClick={() => setEditing(false)} style={{ padding:"12px 20px", background:"rgba(255,255,255,0.1)", color:"white", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"30px", fontSize:"15px", cursor:"pointer" }}>❌ Cancel</button>
            </>)}
            <button onClick={exportProfile} style={{ padding:"12px 20px", background:"rgba(33,150,243,0.2)", color:"#64b5f6", border:"1px solid rgba(33,150,243,0.3)", borderRadius:"30px", fontSize:"15px", cursor:"pointer" }}>📥 Export</button>
          </div>
        </div>

        <style>{`input:focus,textarea:focus{border-color:#ff8c00!important;box-shadow:0 0 0 3px rgba(255,140,0,0.15);}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* MESSAGES */}
        {error && <div style={{ background:"linear-gradient(135deg,#ff4757,#c0392b)", color:"white", padding:"14px 20px", borderRadius:"12px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>❌ {error}<span style={{ marginLeft:"auto", cursor:"pointer" }} onClick={() => setError("")}>×</span></div>}
        {success && <div style={{ background:"linear-gradient(135deg,#2ed573,#17a44a)", color:"white", padding:"14px 20px", borderRadius:"12px", marginBottom:"20px" }}>✅ {success}</div>}

        {/* UPLOAD HINT */}
        {!user.avatar && (
          <div onClick={() => fileInputRef.current?.click()} style={{ background:"linear-gradient(135deg,rgba(255,140,0,0.1),rgba(255,107,53,0.1))", border:"1px solid rgba(255,140,0,0.3)", borderRadius:"12px", padding:"14px 20px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }}>
            <span style={{ fontSize:"28px" }}>📷</span>
            <div>
              <div style={{ fontWeight:"700", color:"#ff8c00", fontSize:"15px" }}>Profile Photo Add Karein</div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px" }}>Apni photo upload karein — JPG ya PNG (max 2MB). Avatar pe ya yahan click karein.</div>
            </div>
            <button style={{ marginLeft:"auto", padding:"8px 18px", background:"linear-gradient(135deg,#ff8c00,#ff6b35)", color:"white", border:"none", borderRadius:"20px", fontSize:"13px", fontWeight:"700", cursor:"pointer", whiteSpace:"nowrap" }}>Upload Photo</button>
          </div>
        )}

        {/* Avatar change row when editing */}
        {user.avatar && editing && (
          <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"14px 20px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"20px" }}>🖼️</span>
            <span style={{ color:"rgba(255,255,255,0.8)", fontSize:"14px" }}>Profile photo change ya remove karein</span>
            <button onClick={() => fileInputRef.current?.click()} style={{ marginLeft:"auto", padding:"8px 16px", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", borderRadius:"20px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>📷 Change</button>
            <button onClick={removeAvatar} style={{ padding:"8px 16px", background:"rgba(255,71,87,0.2)", color:"#ff4757", border:"1px solid rgba(255,71,87,0.3)", borderRadius:"20px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>🗑️ Remove</button>
          </div>
        )}

        {/* TABS */}
        <div style={{ display:"flex", gap:"4px", marginBottom:"24px", background:"rgba(255,255,255,0.05)", borderRadius:"16px", padding:"6px", border:"1px solid rgba(255,255,255,0.08)", overflowX:"auto" }}>
          {[{id:"about",label:"📝 About"},{id:"professional",label:"💼 Professional"},{id:"skills",label:"🛠️ Skills"},{id:"social",label:"🌐 Social"},{id:"stats",label:"📊 Stats"}].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex:1, padding:"10px 16px", background:activeTab===t.id?"linear-gradient(135deg,#ff8c00,#ff6b35)":"transparent", color:activeTab===t.id?"white":"rgba(255,255,255,0.6)", border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:activeTab===t.id?"700":"500", cursor:"pointer", whiteSpace:"nowrap", boxShadow:activeTab===t.id?"0 4px 12px rgba(255,140,0,0.3)":"none" }}>{t.label}</button>
          ))}
        </div>

        {/* GRID */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"24px", alignItems:"start", paddingBottom:"40px" }}>

          {/* LEFT */}
          <div>
            {/* ABOUT */}
            {activeTab==="about" && <div style={card}>
              <h3 style={sh}>📝 About Me</h3>
              {editing ? <textarea value={user.bio} onChange={e=>setUser({...user,bio:e.target.value})} placeholder="Apne baare mein likhein..." rows={5} style={{...inp,minHeight:"130px",resize:"vertical"}}/> : <p style={{color:"rgba(255,255,255,0.8)",lineHeight:"1.7",fontSize:"16px"}}>{user.bio||<span style={{color:"rgba(255,255,255,0.35)",fontStyle:"italic"}}>Abhi tak bio nahi daali. Edit karein!</span>}</p>}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginTop:"24px" }}>
                {[{label:"📧 Email",field:"email",ro:true},{label:"📞 Phone",field:"phone",ph:"+92-300-1234567"},{label:"📍 Location",field:"location",ph:"City, Country"},{label:"🎓 Education",field:"education",ph:"BS CS, FAST"}].map((it,i)=>(
                  <div key={i}>
                    <label style={{display:"block",marginBottom:"6px",fontWeight:"600",fontSize:"13px",color:"rgba(255,255,255,0.6)",textTransform:"uppercase"}}>{it.label}</label>
                    {editing&&!it.ro?<input type="text" value={user[it.field]||""} onChange={e=>setUser({...user,[it.field]:e.target.value})} placeholder={it.ph} style={inp}/>:<p style={{color:user[it.field]?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.3)",fontStyle:user[it.field]?"normal":"italic",fontSize:"15px"}}>{user[it.field]||"Not specified"}</p>}
                  </div>
                ))}
              </div>
            </div>}

            {/* PROFESSIONAL */}
            {activeTab==="professional" && <div style={card}>
              <h3 style={sh}>💼 Professional Info</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
                {[{label:"Job Title",field:"jobTitle",ph:"Software Engineer"},{label:"Company",field:"company",ph:"Google, Meta..."},{label:"Experience",field:"experience",ph:"3+ years"},{label:"Education",field:"education",ph:"BS CS, FAST"}].map((it,i)=>(
                  <div key={i}>
                    <label style={{display:"block",marginBottom:"8px",fontWeight:"600",color:"rgba(255,255,255,0.8)",fontSize:"14px"}}>{it.label}</label>
                    {editing?<input type="text" value={user[it.field]||""} onChange={e=>setUser({...user,[it.field]:e.target.value})} placeholder={it.ph} style={inp}/>:<p style={{color:user[it.field]?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.3)",fontStyle:user[it.field]?"normal":"italic"}}>{user[it.field]||"Not specified"}</p>}
                  </div>
                ))}
              </div>
              <div style={{marginTop:"28px"}}>
                <h4 style={{fontSize:"17px",fontWeight:"700",marginBottom:"16px",color:"#ff8c00"}}>🏆 Achievements</h4>
                <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
                  {(user.achievements||[]).map((a,i)=>(
                    <div key={i} style={{background:"linear-gradient(135deg,rgba(76,175,80,0.15),rgba(69,160,73,0.1))",border:"1px solid rgba(76,175,80,0.3)",color:"white",padding:"12px 16px",borderRadius:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>🏅 {a}</span>
                      {editing&&<span style={{cursor:"pointer",color:"#ff4757",fontSize:"20px",fontWeight:"bold"}} onClick={()=>removeAchievement(a)}>×</span>}
                    </div>
                  ))}
                  {(user.achievements||[]).length===0&&<p style={{color:"rgba(255,255,255,0.3)",fontStyle:"italic",fontSize:"14px"}}>Koi achievement nahi daali abhi tak...</p>}
                </div>
                {editing&&<div style={{display:"flex",gap:"10px"}}><input type="text" value={newAchievement} onChange={e=>setNewAchievement(e.target.value)} placeholder="Achievement add karein..." onKeyPress={e=>e.key==="Enter"&&addAchievement()} style={{...inp,flex:1}}/><button onClick={addAchievement} style={{padding:"12px 20px",background:"linear-gradient(135deg,#FF9800,#f57c00)",color:"white",border:"none",borderRadius:"10px",cursor:"pointer",fontWeight:"700",whiteSpace:"nowrap"}}>+ Add</button></div>}
              </div>
            </div>}

            {/* SKILLS */}
            {activeTab==="skills" && <>
              <div style={card}>
                <h3 style={sh}>🛠️ Technical Skills</h3>
                <div style={{display:"flex",flexWrap:"wrap",gap:"10px",marginBottom:"20px"}}>
                  {(user.skills||[]).map((s,i)=><span key={i} style={{background:"linear-gradient(135deg,rgba(102,126,234,0.3),rgba(118,75,162,0.3))",border:"1px solid rgba(102,126,234,0.5)",color:"white",padding:"8px 18px",borderRadius:"25px",fontSize:"14px",display:"flex",alignItems:"center",gap:"8px"}}>{s}{editing&&<span style={{cursor:"pointer",color:"#ff4757",fontSize:"16px",fontWeight:"bold"}} onClick={()=>removeSkill(s)}>×</span>}</span>)}
                  {(user.skills||[]).length===0&&<p style={{color:"rgba(255,255,255,0.3)",fontStyle:"italic",fontSize:"14px"}}>Abhi koi skill nahi dali...</p>}
                </div>
                {editing&&<div style={{display:"flex",gap:"10px"}}><input type="text" value={newSkill} onChange={e=>setNewSkill(e.target.value)} placeholder="Skill add karein (React, Python)..." onKeyPress={e=>e.key==="Enter"&&addSkill()} style={{...inp,flex:1}}/><button onClick={addSkill} style={{padding:"12px 20px",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",border:"none",borderRadius:"10px",cursor:"pointer",fontWeight:"700",whiteSpace:"nowrap"}}>+ Add</button></div>}
              </div>
              <div style={card}>
                <h3 style={sh}>🎯 Interests</h3>
                <div style={{display:"flex",flexWrap:"wrap",gap:"10px",marginBottom:"20px"}}>
                  {(user.interests||[]).map((it,i)=><span key={i} style={{background:"linear-gradient(135deg,rgba(255,140,0,0.25),rgba(255,107,53,0.2))",border:"1px solid rgba(255,140,0,0.4)",color:"white",padding:"8px 18px",borderRadius:"25px",fontSize:"14px",display:"flex",alignItems:"center",gap:"8px"}}>{it}{editing&&<span style={{cursor:"pointer",color:"#ff4757",fontSize:"16px",fontWeight:"bold"}} onClick={()=>removeInterest(it)}>×</span>}</span>)}
                  {(user.interests||[]).length===0&&<p style={{color:"rgba(255,255,255,0.3)",fontStyle:"italic",fontSize:"14px"}}>Abhi koi interest nahi dala...</p>}
                </div>
                {editing&&<div style={{display:"flex",gap:"10px"}}><input type="text" value={newInterest} onChange={e=>setNewInterest(e.target.value)} placeholder="Interest add karein (AI, Gaming)..." onKeyPress={e=>e.key==="Enter"&&addInterest()} style={{...inp,flex:1}}/><button onClick={addInterest} style={{padding:"12px 20px",background:"linear-gradient(135deg,#ff8c00,#ff6b35)",color:"white",border:"none",borderRadius:"10px",cursor:"pointer",fontWeight:"700",whiteSpace:"nowrap"}}>+ Add</button></div>}
              </div>
            </>}

            {/* SOCIAL */}
            {activeTab==="social" && <div style={card}>
              <h3 style={sh}>🌐 Social Links</h3>
              <div style={{display:"grid",gap:"20px"}}>
                {[{label:"💼 LinkedIn",field:"linkedin",ph:"https://linkedin.com/in/you",color:"#0077B5"},{label:"🐙 GitHub",field:"github",ph:"https://github.com/you",color:"#6e5494"},{label:"🌟 Portfolio",field:"portfolio",ph:"https://yoursite.com",color:"#ff8c00"},{label:"🐦 Twitter / X",field:"twitter",ph:"https://twitter.com/you",color:"#1DA1F2"},{label:"🔗 Website",field:"website",ph:"https://yourwebsite.com",color:"#4CAF50"}].map((it,i)=>(
                  <div key={i}>
                    <label style={{display:"block",marginBottom:"8px",fontWeight:"600",fontSize:"14px",color:"rgba(255,255,255,0.8)"}}>{it.label}</label>
                    {editing?<input type="url" value={user[it.field]||""} onChange={e=>setUser({...user,[it.field]:e.target.value})} placeholder={it.ph} style={inp}/>:user[it.field]?<a href={user[it.field]} target="_blank" rel="noopener noreferrer" style={{color:it.color,textDecoration:"none",display:"flex",alignItems:"center",gap:"8px",fontSize:"15px",padding:"10px 14px",background:`${it.color}15`,borderRadius:"10px",border:`1px solid ${it.color}30`}}>{it.label} — {user[it.field]}</a>:<p style={{color:"rgba(255,255,255,0.3)",fontStyle:"italic",fontSize:"14px"}}>Not connected</p>}
                  </div>
                ))}
              </div>
            </div>}

            {/* STATS */}
            {activeTab==="stats" && <div style={card}>
              <h3 style={sh}>📊 Performance Statistics</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
                {[{label:"Total Interviews",val:stats.totalInterviews,icon:"🎤",color:"#4CAF50",s:""},{label:"Average Score",val:stats.averageScore,icon:"📈",color:"#ff8c00",s:"%"},{label:"Best Score",val:stats.bestScore,icon:"🏆",color:"#2196F3",s:"%"},{label:"Practice Time",val:Math.round((stats.totalTime||0)/60),icon:"⏱️",color:"#9C27B0",s:"m"}].map((st,i)=>(
                  <div key={i} style={{background:`${st.color}15`,border:`1px solid ${st.color}30`,padding:"24px",borderRadius:"16px",textAlign:"center"}}>
                    <div style={{fontSize:"36px",marginBottom:"8px"}}>{st.icon}</div>
                    <div style={{fontSize:"32px",fontWeight:"800",color:st.color}}>{st.val}{st.s}</div>
                    <div style={{color:"rgba(255,255,255,0.6)",fontSize:"14px",marginTop:"4px"}}>{st.label}</div>
                  </div>
                ))}
              </div>
              {stats.averageScore>0&&<div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px",fontSize:"14px",color:"rgba(255,255,255,0.7)"}}><span>Average Performance</span><span style={{color:"#ff8c00",fontWeight:"700"}}>{stats.averageScore}%</span></div>
                <div style={{height:"10px",background:"rgba(255,255,255,0.1)",borderRadius:"5px",overflow:"hidden"}}><div style={{width:`${stats.averageScore}%`,height:"100%",background:"linear-gradient(90deg,#ff8c00,#ff6b35)",borderRadius:"5px"}}/></div>
              </div>}
            </div>}
          </div>

          {/* RIGHT SIDEBAR */}
          <div>
            {/* Profile Card Preview */}
            <div style={{...card,background:"linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.1))",border:"1px solid rgba(102,126,234,0.25)",textAlign:"center"}}>
              <div style={{width:"80px",height:"80px",borderRadius:"50%",background:user.avatar?"transparent":getGradient(user.name),backgroundImage:user.avatar?`url(${user.avatar})`:"none",backgroundSize:"cover",backgroundPosition:"center",margin:"0 auto 12px",border:"3px solid rgba(255,140,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",fontWeight:"bold",color:"white"}}>{!user.avatar&&getInitials(user.name)}</div>
              <div style={{fontWeight:"700",fontSize:"16px",marginBottom:"4px"}}>{user.name||"Your Name"}</div>
              {user.jobTitle&&<div style={{fontSize:"13px",color:"rgba(255,255,255,0.6)",marginBottom:"4px"}}>{user.jobTitle}</div>}
              {user.location&&<div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)"}}>📍 {user.location}</div>}
              <div style={{display:"flex",justifyContent:"center",gap:"8px",marginTop:"14px",flexWrap:"wrap"}}>
                {user.linkedin&&<a href={user.linkedin} target="_blank" rel="noopener noreferrer" style={{background:"#0077B520",border:"1px solid #0077B540",color:"#0077B5",padding:"6px 10px",borderRadius:"20px",fontSize:"12px",textDecoration:"none"}}>💼 LinkedIn</a>}
                {user.github&&<a href={user.github} target="_blank" rel="noopener noreferrer" style={{background:"#6e549420",border:"1px solid #6e549440",color:"#a78be0",padding:"6px 10px",borderRadius:"20px",fontSize:"12px",textDecoration:"none"}}>🐙 GitHub</a>}
                {user.portfolio&&<a href={user.portfolio} target="_blank" rel="noopener noreferrer" style={{background:"#ff8c0020",border:"1px solid #ff8c0040",color:"#ff8c00",padding:"6px 10px",borderRadius:"20px",fontSize:"12px",textDecoration:"none"}}>🌟 Portfolio</a>}
              </div>
            </div>

            {/* Profile Completion */}
            <div style={card}>
              <h3 style={{...sh,fontSize:"16px"}}>✅ Profile Completion</h3>
              <div style={{fontSize:"40px",fontWeight:"800",color:user.profileCompletion>=80?"#4CAF50":user.profileCompletion>=50?"#ff8c00":"#ff4757",textAlign:"center",marginBottom:"12px"}}>{user.profileCompletion}%</div>
              <div style={{height:"8px",background:"rgba(255,255,255,0.1)",borderRadius:"4px",overflow:"hidden",marginBottom:"16px"}}><div style={{width:`${user.profileCompletion}%`,height:"100%",background:user.profileCompletion>=80?"linear-gradient(90deg,#4CAF50,#43e97b)":user.profileCompletion>=50?"linear-gradient(90deg,#ff8c00,#ffb300)":"linear-gradient(90deg,#ff4757,#ff6b81)",borderRadius:"4px",transition:"width 0.8s ease"}}/></div>
              {[{l:"Name",d:!!user.name},{l:"Bio",d:!!user.bio},{l:"Profile Photo 📷",d:!!user.avatar},{l:"Job Title",d:!!user.jobTitle},{l:"Skills",d:(user.skills||[]).length>0},{l:"Location",d:!!user.location},{l:"Education",d:!!user.education},{l:"LinkedIn",d:!!user.linkedin}].map((it,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px",fontSize:"13px",color:it.d?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.35)"}}>
                  <span style={{color:it.d?"#4CAF50":"#ff4757"}}>{it.d?"✅":"○"}</span>{it.l}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={card}>
              <h3 style={{...sh,fontSize:"16px"}}>⚡ Quick Actions</h3>
              <div style={{display:"grid",gap:"12px"}}>
                <button onClick={()=>fileInputRef.current?.click()} style={{padding:"12px",background:"linear-gradient(135deg,#ff8c00,#ff6b35)",color:"white",border:"none",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px"}}>📷 Profile Photo Upload</button>
                <button onClick={()=>{setEditing(true);setActiveTab("about");}} style={{padding:"12px",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",border:"none",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px"}}>✏️ Profile Edit Karein</button>
                <button onClick={exportProfile} style={{padding:"12px",background:"rgba(33,150,243,0.15)",color:"#64b5f6",border:"1px solid rgba(33,150,243,0.3)",borderRadius:"12px",fontSize:"14px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px"}}>📥 Profile Export</button>
              </div>
            </div>

            {/* Member since */}
            <div style={{...card,padding:"18px 24px",textAlign:"center"}}>
              <div style={{fontSize:"28px",marginBottom:"8px"}}>🗓️</div>
              <div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"4px"}}>Member Since</div>
              <div style={{fontWeight:"700",fontSize:"15px"}}>{user.createdAt?new Date(user.createdAt).toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"}):"—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
