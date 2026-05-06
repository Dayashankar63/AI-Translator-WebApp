import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import ResumeUpload from "./pages/ResumeUpload";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Topics from "./pages/Topics";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import AICoach from "./pages/AICoach";
import ResumeMatch from "./pages/ResumeMatch";
import Replay from "./pages/Replay";
import Scorecard from "./pages/Scorecard";
import DailyChallenge from "./pages/DailyChallenge";
import AITools from "./pages/AITools";
import { useState, useEffect } from "react";

function useScreenSize() {
  const getSize = () => ({
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
    width: window.innerWidth,
  });
  const [size, setSize] = useState(getSize);
  useEffect(() => {
    const h = () => setSize(getSize());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return size;
}

function AppLayout({ token, onLogout, onThemeToggle, theme }) {
  const location = useLocation();
  const { isMobile, isTablet } = useScreenSize();
  const publicRoutes = ["/login", "/register"];
  const showNav = token && !publicRoutes.includes(location.pathname);
  const isPublicPage = !token || publicRoutes.includes(location.pathname) || location.pathname === "/";

  // Sidebar width: desktop=240, collapsed handled inside Navbar
  const sidebarW = showNav && !isMobile ? 240 : 0;
  // Top bar height
  const topBarH  = showNav ? (isMobile ? 62 : 72) : 0;
  // Bottom tab height on mobile
  const bottomH  = showNav && isMobile ? 66 : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#090b13", position: "relative" }}>
      {showNav && (
        <Navbar onLogout={onLogout} onThemeToggle={onThemeToggle} theme={theme} />
      )}

      {/* Page content */}
      <main style={{
        marginLeft:    sidebarW,
        marginTop:     topBarH,
        paddingBottom: bottomH,
        minHeight:     `calc(100vh - ${topBarH}px)`,
        width:         sidebarW > 0 ? `calc(100% - ${sidebarW}px)` : "100%",
        transition:    "margin-left 0.25s ease, width 0.25s ease",
        overflowX:     "hidden",
        boxSizing:     "border-box",
      }}>
        <Routes>
          <Route path="/"              element={token ? <Dashboard /> : <Home />} />
          <Route path="/login"         element={<Login    setToken={(t) => { localStorage.setItem("token", t); window.location.href = "/"; }} />} />
          <Route path="/register"      element={<Register setToken={(t) => { localStorage.setItem("token", t); window.location.href = "/"; }} />} />
          <Route path="/interview"     element={<Interview />} />
          {token && <Route path="/dashboard"       element={<Dashboard />} />}
          {token && <Route path="/topics"          element={<Topics />} />}
          {token && <Route path="/resume"          element={<ResumeUpload />} />}
          {token && <Route path="/history"         element={<History />} />}
          {token && <Route path="/analytics"       element={<Analytics />} />}
          {token && <Route path="/profile"         element={<Profile />} />}
          {token && <Route path="/settings"        element={<Settings />} />}
          {token && <Route path="/admin"           element={<AdminDashboard />} />}
          {token && <Route path="/ai-coach"        element={<AICoach />} />}
          {token && <Route path="/resume-match"    element={<ResumeMatch />} />}
          {token && <Route path="/replay"          element={<Replay />} />}
          {token && <Route path="/scorecard"       element={<Scorecard />} />}
          {token && <Route path="/daily-challenge" element={<DailyChallenge />} />}
          {token && <Route path="/ai-tools"        element={<AITools />} />}
          <Route path="*" element={token ? <Dashboard /> : <Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AppLayout
        token={token}
        onLogout={() => { localStorage.removeItem("token"); setToken(null); window.location.href = "/login"; }}
        onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
        theme={theme}
      />
      <SpeedInsights />
    </BrowserRouter>
  );
}
