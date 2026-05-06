import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api";

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [userName, setUserName]     = useState("User");
  const [loading, setLoading]       = useState(true);
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const [h, p] = await Promise.all([
          axios.get("/api/interview/history",  { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/auth/profile",       { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setInterviews(h.data || []);
        setUserName(p.data.name || "User");
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  const total     = interviews.length;
  const completed = interviews.filter(i => (i.score||0) >= 5).length;
  const avgScore  = total > 0 ? Math.round(interviews.reduce((s,i) => s + (i.score||0), 0) / total * 10) : 0;
  const bestScore = total > 0 ? Math.max(...interviews.map(i => (i.score||0)*10)) : 0;
  const recent    = interviews.slice(0, 4);
  const sc        = (s) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444";
  const colors    = ["#667eea","#f59e0b","#22c55e","#ec4899","#8b5cf6","#06b6d4"];

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",color:"white",fontSize:16 }}>⏳ Loading...</div>
  );

  /* ── MOBILE ── */
  if (isMobile) return (
    <div style={{ background:"#090b13",minHeight:"100vh",color:"white",paddingBottom:80 }}>

      {/* Welcome */}
      <div style={{ padding:"20px 16px 4px" }}>
        <div style={{ fontSize:20,fontWeight:700,color:"rgba(255,255,255,0.8)" }}>Welcome back,</div>
        <div style={{ fontSize:28,fontWeight:900,color:"#a78bfa",marginBottom:4 }}>{userName} 👋</div>
        <div style={{ color:"rgba(255,255,255,0.45)",fontSize:14 }}>Let's start your interview journey</div>
      </div>

      {/* Stats 2x2 */}
      <div style={{ padding:"16px 16px 8px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        {[
          { label:"Total Interviews", value:total,         icon:"👤", color:"#667eea", trend:"↑ 12%" },
          { label:"Completed",        value:completed,      icon:"✅", color:"#22c55e", trend:"↑ 8%"  },
          { label:"Success Rate",     value:`${avgScore}%`, icon:"🎯", color:"#f59e0b", trend:"↑ 10%" },
          { label:"Best Score",       value:`${bestScore}%`,icon:"🏆", color:"#8b5cf6", trend:"↑ 15%" },
        ].map((s,i) => (
          <div key={i} style={{ background:`${s.color}18`,borderRadius:20,padding:"16px 14px",border:`1px solid ${s.color}25`,minHeight:110 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
              <div style={{ color:"rgba(255,255,255,0.55)",fontSize:12,fontWeight:600,lineHeight:1.3 }}>{s.label}</div>
              <div style={{ width:30,height:30,borderRadius:8,background:`${s.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize:30,fontWeight:900,color:"white",lineHeight:1,marginBottom:6 }}>{s.value}</div>
            <div style={{ fontSize:12,color:s.color,fontWeight:700 }}>{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Recent Interviews */}
      <div style={{ padding:"8px 16px 8px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{ fontSize:17,fontWeight:800,color:"white" }}>Recent Interviews</div>
          <Link to="/history" style={{ color:"#a78bfa",fontSize:14,fontWeight:600,textDecoration:"none" }}>View all</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign:"center",padding:"28px 20px",background:"rgba(255,255,255,0.03)",borderRadius:16,color:"rgba(255,255,255,0.35)",fontSize:14 }}>No interviews yet.<br/>Start practicing! 🎤</div>
        ) : recent.map((iv,i) => {
          const score = (iv.score||0)*10;
          return (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px",background:"rgba(255,255,255,0.04)",borderRadius:16,marginBottom:8,border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width:44,height:44,borderRadius:12,background:`${colors[i%colors.length]}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🎤</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ color:"white",fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{iv.topic||"Interview"}</div>
                <div style={{ color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:2 }}>{new Date(iv.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                <span style={{ background:`${sc(score)}18`,color:sc(score),padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:700 }}>Completed</span>
                <span style={{ color:sc(score),fontWeight:800,fontSize:14 }}>{score}%</span>
                <span style={{ color:"rgba(255,255,255,0.25)",fontSize:16 }}>›</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Interview */}
      <div style={{ padding:"0 16px 12px" }}>
        <div style={{ fontSize:17,fontWeight:800,color:"white",marginBottom:12 }}>Upcoming Interview</div>
        <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:18,padding:"14px 16px",border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:"rgba(102,126,234,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>📅</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"white",fontWeight:700,fontSize:14 }}>Practice Session</div>
            <div style={{ color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:2 }}>Start anytime • AI Interview</div>
          </div>
          <Link to="/interview" style={{ textDecoration:"none" }}>
            <button style={{ padding:"10px 14px",borderRadius:12,background:"linear-gradient(135deg,#667eea,#764ba2)",border:"none",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap" }}>Start Interview</button>
          </Link>
        </div>
      </div>

    </div>
  );

  /* ── DESKTOP ── */
  return (
    <div style={{ background:"#090b13",minHeight:"100vh",color:"white",padding:"32px 28px" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:32,fontWeight:900,margin:"0 0 4px" }}>Welcome back, <span style={{ color:"#a78bfa" }}>{userName}</span> 👋</h1>
        <p style={{ color:"rgba(255,255,255,0.5)",margin:0 }}>Let's continue your interview journey</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:28 }}>
        {[
          { label:"Total",     value:total,         color:"#667eea", icon:"📊" },
          { label:"Completed", value:completed,      color:"#22c55e", icon:"✅" },
          { label:"Avg Score", value:`${avgScore}%`, color:"#f59e0b", icon:"🎯" },
          { label:"Best",      value:`${bestScore}%`,color:"#8b5cf6", icon:"🏆" },
        ].map((s,i) => (
          <div key={i} style={{ background:`${s.color}15`,borderRadius:18,padding:"24px",border:`1px solid ${s.color}25` }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ color:"rgba(255,255,255,0.6)",fontSize:14 }}>{s.label}</div>
              <span style={{ fontSize:22 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize:36,fontWeight:900,color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:20 }}>
        <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:20,padding:24,border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:20 }}>
            <div style={{ fontWeight:800,fontSize:18 }}>Recent Interviews</div>
            <Link to="/history" style={{ color:"#a78bfa",textDecoration:"none" }}>View all</Link>
          </div>
          {recent.length===0 ? (
            <div style={{ textAlign:"center",padding:30,color:"rgba(255,255,255,0.4)" }}>No interviews yet. Start practicing!</div>
          ) : recent.map((iv,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:i<recent.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
              <div style={{ width:40,height:40,borderRadius:10,background:`${colors[i%colors.length]}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🎤</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{iv.topic||"Interview"}</div>
                <div style={{ color:"rgba(255,255,255,0.4)",fontSize:13 }}>{new Date(iv.createdAt).toLocaleDateString()}</div>
              </div>
              <span style={{ color:sc((iv.score||0)*10),fontWeight:800 }}>{(iv.score||0)*10}%</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Link to="/interview" style={{ textDecoration:"none" }}>
            <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)",borderRadius:18,padding:"20px",textAlign:"center",cursor:"pointer" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>🎤</div>
              <div style={{ color:"white",fontWeight:800,fontSize:15 }}>Start Interview</div>
            </div>
          </Link>
          <Link to="/resume" style={{ textDecoration:"none" }}>
            <div style={{ background:"rgba(245,158,11,0.15)",borderRadius:18,padding:"20px",textAlign:"center",border:"1px solid rgba(245,158,11,0.3)",cursor:"pointer" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>📄</div>
              <div style={{ color:"#fde68a",fontWeight:800,fontSize:15 }}>Upload Resume</div>
            </div>
          </Link>
          <Link to="/analytics" style={{ textDecoration:"none" }}>
            <div style={{ background:"rgba(139,92,246,0.15)",borderRadius:18,padding:"20px",textAlign:"center",border:"1px solid rgba(139,92,246,0.3)",cursor:"pointer" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>📈</div>
              <div style={{ color:"#c4b5fd",fontWeight:800,fontSize:15 }}>Analytics</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
