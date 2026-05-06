import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const NAV_ITEMS = [
  { to: "/",                icon: "▣",  label: "Dashboard",      section: "main" },
  { to: "/interview",       icon: "🎤", label: "Interview",       section: "main" },
  { to: "/topics",          icon: "📚", label: "Topics",          section: "main" },
  { to: "/resume",          icon: "📄", label: "Resume",          section: "main" },
  { to: "/history",         icon: "🕐", label: "History",         section: "main" },
  { to: "/analytics",       icon: "📊", label: "Analytics",       section: "main" },
  { to: "/profile",         icon: "👤", label: "Profile",         section: "main" },
  { to: "/settings",        icon: "⚙️",  label: "Settings",        section: "main" },
  { to: "/ai-coach",        icon: "🎯", label: "AI Coach",        section: "premium" },
  { to: "/daily-challenge", icon: "🔥", label: "Daily Challenge", section: "premium" },
  { to: "/ai-tools",        icon: "🤖", label: "AI Tools",        section: "premium" },
  { to: "/replay",          icon: "🎬", label: "Replay",          section: "premium" },
  { to: "/scorecard",       icon: "🏆", label: "Scorecard",       section: "premium" },
  { to: "/resume-match",    icon: "🔍", label: "Resume Match",    section: "premium" },
];

const BOTTOM_TABS = [
  { to: "/",          icon: "▣",  label: "Dashboard" },
  { to: "/interview", icon: "🎤", label: "Interview"  },
  { to: "/topics",    icon: "📚", label: "Topics"     },
  { to: "/profile",   icon: "👤", label: "Profile"    },
];

export default function Navbar({ onLogout, onThemeToggle, theme }) {
  const location = useLocation();
  const [userName, setUserName]     = useState("User");
  const [userRole, setUserRole]     = useState("user");
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handle = () => {
      const m = window.innerWidth <= 768;
      setIsMobile(m);
      if (!m) setMobileOpen(false);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } });
        setUserName(res.data.name || "User");
        setUserRole(res.data.role || "user");
      } catch {}
    };
    load();
  }, []);

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/" || location.pathname === "/dashboard";
    return location.pathname.startsWith(to);
  };

  const mainItems    = NAV_ITEMS.filter(n => n.section === "main");
  const premiumItems = NAV_ITEMS.filter(n => n.section === "premium");
  const sidebarW     = collapsed ? 72 : 240;
  const isCol        = collapsed && !isMobile;

  if (isMobile) return (
    <>
      {/* Top bar */}
      <div style={{ position:"fixed",top:0,left:0,right:0,height:62,background:"#13152a",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",zIndex:1100 }}>
        <button onClick={() => setMobileOpen(o => !o)} style={{ width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"white",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center" }}>☰</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:"white",fontWeight:900,fontSize:18,lineHeight:1.1 }}>Interview<span style={{ color:"#a78bfa" }}>Pro</span></div>
          <div style={{ color:"#a78bfa",fontWeight:800,fontSize:11 }}>AI</div>
        </div>
        <button style={{ width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"white",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>🔔</button>
      </div>

      {/* Overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1199,backdropFilter:"blur(4px)" }} />}

      {/* Drawer */}
      <div style={{ position:"fixed",top:0,left:mobileOpen?0:-300,width:270,height:"100vh",background:"#13152a",display:"flex",flexDirection:"column",transition:"left 0.3s cubic-bezier(0.4,0,0.2,1)",zIndex:1200,overflowY:"auto",boxShadow:mobileOpen?"12px 0 40px rgba(0,0,0,0.6)":"none" }}>
        {/* Drawer header */}
        <div style={{ padding:"20px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🎯</div>
            <div>
              <div style={{ color:"white",fontWeight:900,fontSize:17 }}>Interview<span style={{ color:"#a78bfa" }}>Pro</span></div>
              <div style={{ color:"#a78bfa",fontWeight:700,fontSize:12 }}>AI</div>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex:1,padding:"12px 10px",overflowY:"auto" }}>
          <div style={{ color:"rgba(255,255,255,0.3)",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",padding:"6px 10px 8px" }}>MAIN MENU</div>
          {mainItems.map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration:"none" }}>
              <div style={{ display:"flex",alignItems:"center",gap:14,padding:"13px 14px",borderRadius:12,marginBottom:2,background:isActive(item.to)?"linear-gradient(135deg,rgba(102,126,234,0.3),rgba(118,75,162,0.2))":"transparent",border:isActive(item.to)?"1px solid rgba(102,126,234,0.35)":"1px solid transparent",color:isActive(item.to)?"white":"rgba(255,255,255,0.6)",fontWeight:isActive(item.to)?700:500,fontSize:15 }}>
                <span style={{ fontSize:20,width:26,textAlign:"center" }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {isActive(item.to) && <div style={{ width:7,height:7,borderRadius:"50%",background:"#a78bfa" }} />}
              </div>
            </Link>
          ))}

          <div style={{ height:1,background:"rgba(255,255,255,0.07)",margin:"10px 0" }} />
          <div style={{ color:"rgba(255,255,255,0.3)",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",padding:"6px 10px 8px" }}>THEME</div>

          {/* Theme toggle */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 14px",borderRadius:12,background:"rgba(255,255,255,0.04)",marginBottom:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <span style={{ fontSize:20 }}>☀️</span>
              <span style={{ color:"rgba(255,255,255,0.8)",fontSize:15,fontWeight:500 }}>Light Mode</span>
            </div>
            <div onClick={onThemeToggle} style={{ width:50,height:28,borderRadius:99,cursor:"pointer",background:theme==="light"?"linear-gradient(135deg,#667eea,#764ba2)":"rgba(255,255,255,0.12)",position:"relative",transition:"background 0.3s",flexShrink:0 }}>
              <div style={{ position:"absolute",top:4,left:theme==="light"?26:4,width:20,height:20,borderRadius:"50%",background:"white",transition:"left 0.3s",boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }} />
            </div>
          </div>

          {/* User */}
          <Link to="/profile" style={{ textDecoration:"none" }} onClick={() => setMobileOpen(false)}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 14px",borderRadius:12,background:"rgba(255,255,255,0.04)",marginBottom:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:17 }}>{userName.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ color:"white",fontWeight:700,fontSize:15 }}>{userName}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)",fontSize:12 }}>Free Plan</div>
                </div>
              </div>
              <span style={{ color:"rgba(255,255,255,0.35)",fontSize:20 }}>›</span>
            </div>
          </Link>

          {/* Logout */}
          <button onClick={onLogout} style={{ width:"100%",padding:"13px 14px",borderRadius:12,background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",color:"#fca5a5",cursor:"pointer",fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:20 }}>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div style={{ position:"fixed",bottom:0,left:0,right:0,height:66,background:"#13152a",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"stretch",zIndex:1100 }}>
        {BOTTOM_TABS.map(tab => {
          const active = isActive(tab.to);
          return (
            <Link key={tab.to} to={tab.to} style={{ flex:1,textDecoration:"none" }}>
              <div style={{ height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,position:"relative" }}>
                {active && <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:36,height:3,borderRadius:"0 0 99px 99px",background:"linear-gradient(90deg,#667eea,#a78bfa)" }} />}
                <span style={{ fontSize:24,filter:active?"none":"grayscale(1) opacity(0.4)" }}>{tab.icon}</span>
                <span style={{ fontSize:11,fontWeight:active?700:500,color:active?"white":"rgba(255,255,255,0.38)" }}>{tab.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <div style={{ position:"fixed",top:0,left:0,height:"100vh",width:sidebarW,background:"#0f1120",borderRight:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",transition:"width 0.25s ease",zIndex:1000,overflowY:"auto",overflowX:"hidden" }}>
        <div style={{ padding:isCol?"20px 0":"20px 20px",display:"flex",alignItems:"center",justifyContent:isCol?"center":"space-between",borderBottom:"1px solid rgba(255,255,255,0.07)",minHeight:72 }}>
          {!isCol && <div><span style={{ color:"white",fontWeight:900,fontSize:20 }}>Interview<span style={{ color:"#a78bfa" }}>Pro</span></span><br /><span style={{ background:"linear-gradient(90deg,#667eea,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontWeight:900,fontSize:14 }}>AI</span></div>}
          <button onClick={() => setCollapsed(c => !c)} style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{collapsed?"▶":"◀"}</button>
        </div>
        <div style={{ flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto" }}>
          {!isCol && <div style={{ color:"rgba(255,255,255,0.3)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",padding:"8px 12px 4px" }}>MAIN MENU</div>}
          {mainItems.map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration:"none" }}>
              <div title={isCol?item.label:""} style={{ display:"flex",alignItems:"center",gap:12,padding:isCol?"11px 0":"11px 14px",justifyContent:isCol?"center":"flex-start",borderRadius:10,background:isActive(item.to)?"linear-gradient(135deg,rgba(102,126,234,0.25),rgba(118,75,162,0.2))":"transparent",border:isActive(item.to)?"1px solid rgba(102,126,234,0.3)":"1px solid transparent",color:isActive(item.to)?"white":"rgba(255,255,255,0.55)",fontWeight:isActive(item.to)?700:500,fontSize:14,cursor:"pointer" }}>
                <span style={{ fontSize:18,flexShrink:0 }}>{item.icon}</span>
                {!isCol && <span>{item.label}</span>}
                {!isCol && isActive(item.to) && <div style={{ marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:"#a78bfa" }} />}
              </div>
            </Link>
          ))}
          {!isCol && <div style={{ color:"rgba(255,255,255,0.3)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",padding:"12px 12px 4px",marginTop:8 }}>✨ PREMIUM</div>}
          {isCol && <div style={{ height:1,background:"rgba(255,255,255,0.06)",margin:"8px 12px" }} />}
          {premiumItems.map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration:"none" }}>
              <div title={isCol?item.label:""} style={{ display:"flex",alignItems:"center",gap:12,padding:isCol?"11px 0":"11px 14px",justifyContent:isCol?"center":"flex-start",borderRadius:10,background:isActive(item.to)?"linear-gradient(135deg,rgba(167,139,250,0.2),rgba(124,58,237,0.15))":"transparent",border:isActive(item.to)?"1px solid rgba(167,139,250,0.3)":"1px solid transparent",color:isActive(item.to)?"white":"rgba(255,255,255,0.5)",fontWeight:isActive(item.to)?700:500,fontSize:14,cursor:"pointer" }}>
                <span style={{ fontSize:18,flexShrink:0 }}>{item.icon}</span>
                {!isCol && <span>{item.label}</span>}
              </div>
            </Link>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)",padding:isCol?"12px 8px":"16px 12px",display:"flex",flexDirection:"column",gap:8 }}>
          <button onClick={onThemeToggle} style={{ width:"100%",padding:isCol?"10px 0":"10px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8,justifyContent:isCol?"center":"flex-start" }}><span style={{ fontSize:18 }}>{theme==="dark"?"☀️":"🌙"}</span>{!isCol && <span>{theme==="dark"?"Light Mode":"Dark Mode"}</span>}</button>
          {!isCol && <div style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)" }}><div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:14,flexShrink:0 }}>{userName.charAt(0).toUpperCase()}</div><div style={{ flex:1,overflow:"hidden" }}><div style={{ color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{userName}</div><div style={{ color:"rgba(255,255,255,0.35)",fontSize:11 }}>{userRole==="admin"?"👑 Admin":"Free Plan"}</div></div></div>}
          <button onClick={onLogout} style={{ width:"100%",padding:isCol?"10px 0":"10px 14px",borderRadius:10,border:"1px solid rgba(239,68,68,0.25)",background:"rgba(239,68,68,0.1)",color:"#fca5a5",cursor:"pointer",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,justifyContent:isCol?"center":"flex-start" }}><span style={{ fontSize:18 }}>🚪</span>{!isCol && <span>Logout</span>}</button>
        </div>
      </div>
      <div style={{ position:"fixed",top:0,left:sidebarW,right:0,height:72,background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",zIndex:999,boxShadow:"0 2px 20px rgba(0,0,0,0.3)",transition:"left 0.25s ease" }}>
        <div style={{ color:"white" }}><div style={{ fontWeight:900,fontSize:22 }}>{NAV_ITEMS.find(n => isActive(n.to))?.icon} {NAV_ITEMS.find(n => isActive(n.to))?.label||"Dashboard"}</div><div style={{ fontSize:13,opacity:0.75 }}>AI-Powered Interview Platform</div></div>
        <div style={{ display:"flex",gap:12 }}><button onClick={onThemeToggle} style={{ width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",color:"white",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center" }}>{theme==="dark"?"☀️":"🌙"}</button><button onClick={onLogout} style={{ padding:"10px 22px",borderRadius:10,background:"rgba(239,68,68,0.85)",border:"none",color:"white",cursor:"pointer",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>🚪 Logout</button></div>
      </div>
    </>
  );
}
