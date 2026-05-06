import { useState, useEffect, useRef } from "react";
import axios from "../api";


export default function AICoach() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tip, setTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("JavaScript");
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeUp, setTimeUp] = useState(false);
  const tipTimerRef = useRef(null);
  const timerRef = useRef(null);
  const token = localStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL || "";

  const topics = ["JavaScript", "React", "Python", "Java", "Node.js", "System Design", "HR Round", "Managerial Round"];

  const generateQuestion = async () => {
    setGenerating(true);
    setAnswer("");
    setTip("");
    setTimeUp(false);
    setTimer(timeLimit);
    try {
      const res = await axios.post(`${API}/api/interview/generate`, { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestion(res.data.question);
      setTimerActive(true);
    } catch (err) {
      setQuestion("Tell me about a challenging project you worked on and how you solved it.");
      setTimerActive(true);
    }
    setGenerating(false);
  };

  // Auto fetch coaching tip when answer changes (debounced)
  useEffect(() => {
    if (!question || answer.length < 20) { setTip(""); return; }
    clearTimeout(tipTimerRef.current);
    tipTimerRef.current = setTimeout(() => fetchTip(), 1500);
    return () => clearTimeout(tipTimerRef.current);
  }, [answer]);

  const fetchTip = async () => {
    setTipLoading(true);
    try {
      const res = await axios.post(`${API}/api/features/coach-tip`, { question, partialAnswer: answer }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTip(res.data.tip);
    } catch {}
    setTipLoading(false);
  };

  // Countdown timer
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setTimerActive(false); setTimeUp(true); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const timerColor = timer > timeLimit * 0.5 ? "#22c55e" : timer > timeLimit * 0.25 ? "#f59e0b" : "#ef4444";
  const timerPct = Math.round((timer / timeLimit) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: "#a78bfa", fontSize: 28, textAlign: "center", marginBottom: 8 }}>🎯 AI Interview Coach</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: 30 }}>Real-time AI tips as you type your answer</p>

        {/* Settings Row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <select value={topic} onChange={e => setTopic(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #4b5563", background: "#1f2937", color: "#fff", fontSize: 14 }}>
            {topics.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={timeLimit} onChange={e => { setTimeLimit(Number(e.target.value)); setTimer(Number(e.target.value)); }}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #4b5563", background: "#1f2937", color: "#fff", fontSize: 14 }}>
            <option value={30}>30s (Hard)</option>
            <option value={60}>60s (Medium)</option>
            <option value={120}>2 min (Easy)</option>
            <option value={180}>3 min (Relax)</option>
          </select>
          <button onClick={generateQuestion} disabled={generating}
            style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(90deg,#7c3aed,#a21caf)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
            {generating ? "⏳ Generating..." : "🎲 New Question"}
          </button>
        </div>

        {/* Timer */}
        {question && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: timerColor }}>{timer}s</div>
            <div style={{ height: 6, background: "#374151", borderRadius: 4, overflow: "hidden", maxWidth: 400, margin: "0 auto" }}>
              <div style={{ width: `${timerPct}%`, height: "100%", background: timerColor, transition: "width 1s linear, background 0.5s" }} />
            </div>
            {timeUp && <div style={{ marginTop: 8, color: "#ef4444", fontWeight: 700, fontSize: 18 }}>⏰ Time's Up!</div>}
          </div>
        )}

        {/* Question Box */}
        {question && (
          <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 6 }}>❓ QUESTION</div>
            <p style={{ color: "#f3f4f6", fontSize: 17, margin: 0 }}>{question}</p>
          </div>
        )}

        {/* Answer + Live Coach Tip side by side */}
        {question && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 6 }}>📝 YOUR ANSWER</label>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={8}
                placeholder="Start typing your answer here... AI will coach you in real-time!"
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #4b5563", background: "#1f2937", color: "#f9fafb", fontSize: 15, resize: "vertical", boxSizing: "border-box" }} />
              <div style={{ color: "#6b7280", fontSize: 12, textAlign: "right" }}>{answer.split(/\s+/).filter(Boolean).length} words</div>
            </div>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 6 }}>🤖 AI COACH TIP</label>
              <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 12, padding: 14, minHeight: 160 }}>
                {tipLoading ? (
                  <div style={{ color: "#a78bfa", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span> Analyzing...
                  </div>
                ) : tip ? (
                  <>
                    <div style={{ color: "#34d399", fontSize: 13, marginBottom: 8 }}>💡 Live Tip</div>
                    <p style={{ color: "#f3f4f6", margin: 0, lineHeight: 1.6 }}>{tip}</p>
                  </>
                ) : (
                  <p style={{ color: "#6b7280", margin: 0 }}>Type at least 20 characters and I'll start coaching you automatically!</p>
                )}
              </div>

              {/* Word count tips */}
              <div style={{ marginTop: 12, background: "#111827", borderRadius: 10, padding: 12 }}>
                <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>Quick Tips</div>
                {[
                  { ok: answer.length > 50, text: "Answer is long enough" },
                  { ok: /example|instance|time when|situation/i.test(answer), text: "Includes an example" },
                  { ok: answer.split(/\s+/).length > 30, text: "Good word count (30+ words)" },
                  { ok: !/um|uh|like,|you know/i.test(answer), text: "No filler words" }
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: c.ok ? "#22c55e" : "#6b7280" }}>{c.ok ? "✅" : "⭕"}</span>
                    <span style={{ color: c.ok ? "#d1fae5" : "#9ca3af", fontSize: 13 }}>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!question && (
          <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎯</div>
            <p style={{ fontSize: 18 }}>Select a topic and click "New Question" to start your coached interview session!</p>
          </div>
        )}
      </div>
    </div>
  );
}
