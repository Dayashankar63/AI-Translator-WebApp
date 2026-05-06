import { useState, useEffect } from "react";
import axios from "../api";


export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("challenge"); // challenge | leaderboard
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const t = localStorage.getItem("token");
    axios.get(`${API}/api/features/daily-challenge`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => setChallenge(r.data)).catch(() => {});
    axios.get(`${API}/api/features/leaderboard`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => setLeaderboard(r.data.leaderboard || [])).catch(() => {});
  }, []);

  // Countdown
  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) { setTimerActive(false); setTimeUp(true); return; }
    const id = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(id); setTimerActive(false); setTimeUp(true); return 0; } return t - 1; }), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const startTimer = () => { setTimer(60); setTimerActive(true); setTimeUp(false); };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true); setFeedback("");
    try {
      const res = await axios.post(`${API}/api/interview/evaluate`,
        { question: challenge?.question, answer },
        { headers: { Authorization: `Bearer ${token}` } });
      setFeedback(res.data.feedback);
    } catch { setFeedback("Could not evaluate. Please try again."); }
    setSubmitting(false); setTimerActive(false);
  };

  const timerColor = timer > 30 ? "#22c55e" : timer > 15 ? "#f59e0b" : "#ef4444";
  const streakMsg = (s) => s === 0 ? "Start your streak today! 🚀" : s === 1 ? "1 day streak! Keep going! 🔥" : `${s} day streak! You're on fire! 🔥`;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: "#a78bfa", fontSize: 28, textAlign: "center", marginBottom: 8 }}>🏆 Daily Challenge & Leaderboard</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: 24 }}>Practice daily, climb the ranks, stay sharp!</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {[["challenge", "🎯 Daily Challenge"], ["leaderboard", "🏆 Leaderboard"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
                background: tab === key ? "linear-gradient(90deg,#7c3aed,#a21caf)" : "transparent",
                color: tab === key ? "#fff" : "#9ca3af" }}>
              {label}
            </button>
          ))}
        </div>

        {/* DAILY CHALLENGE TAB */}
        {tab === "challenge" && (
          <div>
            {challenge && (
              <>
                {/* Streak */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 40 }}>🔥</div>
                  <div style={{ color: "#f59e0b", fontSize: 18, fontWeight: 700 }}>{streakMsg(challenge.streak)}</div>
                </div>

                {/* Question */}
                <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ color: "#c4b5fd", fontSize: 13, fontWeight: 700 }}>📅 TODAY'S CHALLENGE</span>
                    <span style={{ color: "#6b7280", fontSize: 12 }}>{new Date().toDateString()}</span>
                  </div>
                  <p style={{ color: "#f3f4f6", fontSize: 17, margin: 0, lineHeight: 1.6 }}>{challenge.question}</p>
                </div>

                {/* Timer */}
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", border: `4px solid ${timerColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: timerColor, flexShrink: 0 }}>
                    {timer}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 6, background: "#374151", borderRadius: 4 }}>
                      <div style={{ width: `${(timer / 60) * 100}%`, height: "100%", background: timerColor, borderRadius: 4, transition: "width 1s linear, background 0.5s" }} />
                    </div>
                    {timeUp && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 4 }}>⏰ Time's up! Submit your answer.</div>}
                  </div>
                  <button onClick={startTimer} style={{ padding: "8px 16px", borderRadius: 8, background: "#374151", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}>
                    ⏱ {timerActive ? "Timing..." : "Start Timer"}
                  </button>
                </div>

                {/* Answer */}
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={5}
                  placeholder="Type your answer here..."
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #4b5563", background: "#1f2937", color: "#f9fafb", fontSize: 15, resize: "vertical", boxSizing: "border-box", marginBottom: 12 }} />

                <button onClick={submitAnswer} disabled={submitting || !answer.trim()}
                  style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(90deg,#7c3aed,#a21caf)", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
                  {submitting ? "⏳ Evaluating..." : "📤 Submit Answer"}
                </button>

                {feedback && (
                  <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: 16 }}>
                    <div style={{ color: "#34d399", fontWeight: 700, marginBottom: 8 }}>🤖 AI Feedback</div>
                    <p style={{ color: "#f3f4f6", margin: 0, lineHeight: 1.7 }}>{feedback}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && (
          <div>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
                <div style={{ fontSize: 50, marginBottom: 12 }}>🏆</div>
                <p>No leaderboard data yet. Complete interviews to appear here!</p>
              </div>
            ) : leaderboard.map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 12, marginBottom: 8,
                background: entry.isCurrentUser ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${entry.isCurrentUser ? "#7c3aed" : "#374151"}` }}>
                <div style={{ fontSize: 24, minWidth: 40, textAlign: "center" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${entry.rank}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#f3f4f6", fontWeight: 700 }}>{entry.name} {entry.isCurrentUser && <span style={{ color: "#a78bfa", fontSize: 12 }}>(You)</span>}</div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>{entry.totalInterviews} interviews completed</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#22c55e", fontWeight: 800, fontSize: 18 }}>{entry.avgScore}/10</div>
                  <div style={{ color: "#6b7280", fontSize: 11 }}>avg score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
