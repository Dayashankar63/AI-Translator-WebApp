import { useState, useEffect } from "react";
import axios from "../api";


export default function Replay() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const token = localStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    axios.get(`${API}/api/features/replay-list`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setList(r.data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const openReplay = async (id) => {
    setSelected(id); setDetailLoading(true);
    try {
      const r = await axios.get(`${API}/api/features/replay/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setDetail(r.data);
    } catch {}
    setDetailLoading(false);
  };

  const scoreColor = (s) => s >= 7 ? "#22c55e" : s >= 5 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: "#a78bfa", fontSize: 28, textAlign: "center", marginBottom: 8 }}>🎬 Interview Replay</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: 30 }}>Review your past interviews with questions, answers and AI feedback</p>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
          {/* List */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 12, textTransform: "uppercase" }}>Past Interviews ({list.length})</div>
            {loading ? (
              <div style={{ color: "#6b7280", textAlign: "center", padding: 20 }}>Loading...</div>
            ) : list.length === 0 ? (
              <div style={{ color: "#6b7280", textAlign: "center", padding: 20 }}>No interviews yet. Complete some interviews first!</div>
            ) : list.map(iv => (
              <div key={iv._id} onClick={() => openReplay(iv._id)}
                style={{ padding: 12, borderRadius: 10, marginBottom: 8, cursor: "pointer", border: `1px solid ${selected === iv._id ? "#7c3aed" : "#374151"}`, background: selected === iv._id ? "rgba(124,58,237,0.15)" : "transparent", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ color: "#f3f4f6", fontSize: 13, flex: 1, marginRight: 8 }}>{iv.question?.slice(0, 60)}...</div>
                  <div style={{ color: scoreColor(iv.score), fontWeight: 700, fontSize: 14, minWidth: 30 }}>{iv.score}/10</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <span style={{ background: "rgba(124,58,237,0.2)", color: "#c4b5fd", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{iv.topic || "General"}</span>
                  <span style={{ color: "#6b7280", fontSize: 11 }}>{new Date(iv.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 20 }}>
            {!selected && (
              <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
                <div style={{ fontSize: 50, marginBottom: 12 }}>🎬</div>
                <p>Select an interview from the left to replay it</p>
              </div>
            )}
            {detailLoading && <div style={{ textAlign: "center", padding: 60, color: "#a78bfa" }}>Loading replay...</div>}
            {detail && !detailLoading && (
              <>
                {/* Timeline */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, color: "#9ca3af", fontSize: 13 }}>
                  <span>📅 {new Date(detail.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>🏷️ {detail.topic || "General"}</span>
                  <span>•</span>
                  <span style={{ color: scoreColor(detail.score), fontWeight: 700 }}>Score: {detail.score}/10</span>
                </div>

                {/* Score bar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#9ca3af", fontSize: 13 }}>Score</span>
                    <span style={{ color: scoreColor(detail.score), fontWeight: 700 }}>{detail.score}/10</span>
                  </div>
                  <div style={{ height: 8, background: "#374151", borderRadius: 4 }}>
                    <div style={{ width: `${detail.score * 10}%`, height: "100%", background: scoreColor(detail.score), borderRadius: 4 }} />
                  </div>
                </div>

                {/* Q → A → Feedback timeline */}
                {[
                  { label: "❓ Question", content: detail.question, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
                  { label: "💬 Your Answer", content: detail.answer, color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
                  { label: "🤖 AI Feedback", content: detail.feedback, color: "#22c55e", bg: "rgba(34,197,94,0.1)" }
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, marginTop: 4, flexShrink: 0 }} />
                      {i < 2 && <div style={{ width: 2, flex: 1, background: "#374151", marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: item.color, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{item.label}</div>
                      <div style={{ background: item.bg, border: `1px solid ${item.color}33`, borderRadius: 10, padding: 14 }}>
                        <p style={{ color: "#f3f4f6", margin: 0, lineHeight: 1.7, fontSize: 14 }}>{item.content || "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
