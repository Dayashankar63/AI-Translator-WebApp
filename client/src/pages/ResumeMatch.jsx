import { useState } from "react";
import axios from "../api";


export default function ResumeMatch() {
  const [resumeFile, setResumeFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL || "";

  const handleSubmit = async () => {
    if (!resumeFile) return setError("Please upload your resume");
    if (!answer.trim()) return setError("Please write your interview answer");
    setError(""); setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      fd.append("question", question || "Tell me about yourself");
      fd.append("answer", answer);
      const res = await axios.post(`${API}/api/features/resume-match`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Analysis failed. Try again.");
    }
    setLoading(false);
  };

  const scoreColor = (s) => s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = (s) => s >= 75 ? "Great Match! 🎉" : s >= 50 ? "Moderate Match 👍" : "Low Match ⚠️";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: "#a78bfa", fontSize: 28, textAlign: "center", marginBottom: 8 }}>📄 Resume vs Answer Match</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: 30 }}>Upload your resume and paste your answer — AI checks how well they align</p>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          {/* Resume Upload */}
          <label style={{ color: "#c4b5fd", fontSize: 14, display: "block", marginBottom: 8 }}>📎 Upload Resume (PDF/DOCX)</label>
          <div style={{ border: "2px dashed #4b5563", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 20, cursor: "pointer", background: resumeFile ? "rgba(124,58,237,0.1)" : "transparent" }}
            onClick={() => document.getElementById("resume-input").click()}>
            <input id="resume-input" type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
              onChange={e => { setResumeFile(e.target.files[0]); setError(""); }} />
            {resumeFile ? (
              <div style={{ color: "#34d399" }}>✅ {resumeFile.name}</div>
            ) : (
              <div style={{ color: "#6b7280" }}>Click to upload or drag your resume here<br /><span style={{ fontSize: 12 }}>PDF, DOC, DOCX supported</span></div>
            )}
          </div>

          {/* Question */}
          <label style={{ color: "#c4b5fd", fontSize: 14, display: "block", marginBottom: 8 }}>❓ Interview Question (optional)</label>
          <input value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. Tell me about your React experience..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #4b5563", background: "#1f2937", color: "#fff", fontSize: 14, marginBottom: 16, boxSizing: "border-box" }} />

          {/* Answer */}
          <label style={{ color: "#c4b5fd", fontSize: 14, display: "block", marginBottom: 8 }}>💬 Your Interview Answer</label>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={5}
            placeholder="Paste or type the answer you gave in the interview..."
            style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #4b5563", background: "#1f2937", color: "#f9fafb", fontSize: 14, resize: "vertical", marginBottom: 16, boxSizing: "border-box" }} />

          {error && <div style={{ color: "#f87171", marginBottom: 12, fontSize: 14 }}>⚠️ {error}</div>}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 12, background: "linear-gradient(90deg,#7c3aed,#a21caf)", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "🔍 Analyzing..." : "🔍 Analyze Match"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
            {/* Score Circle */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 120, height: 120, borderRadius: "50%", border: `6px solid ${scoreColor(result.matchScore)}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", background: "rgba(0,0,0,0.3)" }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor(result.matchScore) }}>{result.matchScore}%</div>
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(result.matchScore) }}>{scoreLabel(result.matchScore)}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Matched Skills */}
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#34d399", fontWeight: 700, marginBottom: 10 }}>✅ Matched from Resume</div>
                {result.matchedSkills?.length ? result.matchedSkills.map((s, i) => (
                  <span key={i} style={{ display: "inline-block", background: "rgba(34,197,94,0.2)", color: "#86efac", padding: "3px 10px", borderRadius: 20, fontSize: 13, margin: "3px 4px 3px 0" }}>{s}</span>
                )) : <div style={{ color: "#6b7280", fontSize: 13 }}>None found</div>}
              </div>

              {/* Missing */}
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 10 }}>⚠️ Mentioned in Resume but Not in Answer</div>
                {result.missingFromAnswer?.length ? result.missingFromAnswer.map((s, i) => (
                  <span key={i} style={{ display: "inline-block", background: "rgba(239,68,68,0.2)", color: "#fca5a5", padding: "3px 10px", borderRadius: 20, fontSize: 13, margin: "3px 4px 3px 0" }}>{s}</span>
                )) : <div style={{ color: "#6b7280", fontSize: 13 }}>None missing!</div>}
              </div>
            </div>

            {result.suggestion && (
              <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#c4b5fd", fontWeight: 700, marginBottom: 6 }}>💡 AI Suggestion</div>
                <p style={{ color: "#f3f4f6", margin: 0, lineHeight: 1.6 }}>{result.suggestion}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
