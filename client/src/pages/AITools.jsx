import { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "";

const COMPANY_COLORS = { Google: "#4285F4", Amazon: "#FF9900", TCS: "#003087", Infosys: "#007CC3", Microsoft: "#00A4EF" };
const CATEGORIES = ["HR", "Technical", "Puzzle", "Managerial"];

export default function AITools() {
  const [tab, setTab] = useState("ats");
  const token = localStorage.getItem("token");

  // ATS
  const [atsFile, setAtsFile] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);

  // JD Match
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [jdResult, setJdResult] = useState(null);
  const [jdLoading, setJdLoading] = useState(false);

  // Answer Improver
  const [impQuestion, setImpQuestion] = useState("");
  const [impAnswer, setImpAnswer] = useState("");
  const [impResult, setImpResult] = useState(null);
  const [impLoading, setImpLoading] = useState(false);

  // Question Bank
  const [qbCompany, setQbCompany] = useState("Google");
  const [qbCategory, setQbCategory] = useState("HR");
  const [qbQuestions, setQbQuestions] = useState([]);
  const [qbLoading, setQbLoading] = useState(false);
  const [qbAI, setQbAI] = useState([]);
  const [qbAILoading, setQbAILoading] = useState(false);

  const uploadATS = async () => {
    if (!atsFile) return alert("Please upload resume");
    setAtsLoading(true); setAtsResult(null);
    const fd = new FormData(); fd.append("resume", atsFile);
    try {
      const r = await axios.post(`${API}/api/features/ats-score`, fd, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setAtsResult(r.data);
    } catch (e) { alert("Error: " + (e.response?.data?.error || e.message)); }
    setAtsLoading(false);
  };

  const runJDMatch = async () => {
    if (!jdFile || !jdText.trim()) return alert("Upload resume and paste job description");
    setJdLoading(true); setJdResult(null);
    const fd = new FormData(); fd.append("resume", jdFile); fd.append("jobDescription", jdText);
    try {
      const r = await axios.post(`${API}/api/features/jd-match`, fd, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setJdResult(r.data);
    } catch (e) { alert("Error: " + (e.response?.data?.error || e.message)); }
    setJdLoading(false);
  };

  const improveAnswer = async () => {
    if (!impQuestion.trim() || !impAnswer.trim()) return alert("Fill both question and answer");
    setImpLoading(true); setImpResult(null);
    try {
      const r = await axios.post(`${API}/api/features/improve-answer`, { question: impQuestion, answer: impAnswer }, { headers: { Authorization: `Bearer ${token}` } });
      setImpResult(r.data);
    } catch (e) { alert("Error: " + (e.response?.data?.error || e.message)); }
    setImpLoading(false);
  };

  const loadQB = async () => {
    setQbLoading(true); setQbQuestions([]); setQbAI([]);
    try {
      const r = await axios.get(`${API}/api/features/question-bank?company=${qbCompany}&category=${qbCategory}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.data.questions && r.data.questions[qbCategory]) setQbQuestions(r.data.questions[qbCategory]);
      else if (Array.isArray(r.data.questions)) setQbQuestions(r.data.questions);
    } catch {}
    setQbLoading(false);
  };

  const generateAIQuestions = async () => {
    setQbAILoading(true);
    try {
      const r = await axios.post(`${API}/api/features/question-bank/generate`, { company: qbCompany, category: qbCategory }, { headers: { Authorization: `Bearer ${token}` } });
      setQbAI(r.data.questions || []);
    } catch {}
    setQbAILoading(false);
  };

  const scoreColor = (s) => s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

  const tabs = [
    ["ats", "📊 ATS Score"],
    ["jd", "🎯 JD Match"],
    ["improve", "✨ Improve Answer"],
    ["qbank", "🏢 Question Bank"]
  ];

  const FileUploadBox = ({ file, setFile, id }) => (
    <div style={{ border: "2px dashed #4b5563", borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer", marginBottom: 16, background: file ? "rgba(124,58,237,0.1)" : "transparent" }}
      onClick={() => document.getElementById(id).click()}>
      <input id={id} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
      {file ? <div style={{ color: "#34d399" }}>✅ {file.name}</div> : <div style={{ color: "#6b7280" }}>📎 Click to upload Resume (PDF/DOCX)</div>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <h1 style={{ color: "#a78bfa", fontSize: 28, textAlign: "center", marginBottom: 8 }}>🤖 AI-Powered Tools</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: 24 }}>Resume ATS, Job Match, Answer Improvement & Question Bank</p>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                background: tab === key ? "linear-gradient(90deg,#7c3aed,#a21caf)" : "transparent",
                color: tab === key ? "#fff" : "#9ca3af" }}>
              {label}
            </button>
          ))}
        </div>

        {/* ATS SCORE */}
        {tab === "ats" && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ color: "#f3f4f6", marginTop: 0 }}>📊 Resume ATS Score</h2>
            <p style={{ color: "#9ca3af", marginBottom: 16 }}>Upload your resume and see how ATS-friendly it is</p>
            <FileUploadBox file={atsFile} setFile={setAtsFile} id="ats-file" />
            <button onClick={uploadATS} disabled={atsLoading}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(90deg,#7c3aed,#a21caf)", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              {atsLoading ? "🔍 Scanning..." : "🔍 Analyze ATS Score"}
            </button>
            {atsResult && (
              <div style={{ marginTop: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", border: `5px solid ${scoreColor(atsResult.atsScore)}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: scoreColor(atsResult.atsScore) }}>{atsResult.atsScore}%</span>
                  </div>
                  <div style={{ color: scoreColor(atsResult.atsScore), fontSize: 16, fontWeight: 700, marginTop: 8 }}>ATS Friendly</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 12, padding: 14 }}>
                    <div style={{ color: "#34d399", fontWeight: 700, marginBottom: 8 }}>✅ Keywords Found</div>
                    {atsResult.keywordsFound?.map((k, i) => <span key={i} style={{ display: "inline-block", background: "rgba(34,197,94,0.2)", color: "#86efac", padding: "2px 10px", borderRadius: 20, fontSize: 12, margin: "2px" }}>{k}</span>)}
                  </div>
                  <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 12, padding: 14 }}>
                    <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 8 }}>⚠️ Missing Keywords</div>
                    {atsResult.missingKeywords?.map((k, i) => <span key={i} style={{ display: "inline-block", background: "rgba(239,68,68,0.2)", color: "#fca5a5", padding: "2px 10px", borderRadius: 20, fontSize: 12, margin: "2px" }}>{k}</span>)}
                  </div>
                </div>
                {atsResult.improvements?.length > 0 && (
                  <div style={{ background: "rgba(124,58,237,0.1)", borderRadius: 12, padding: 14, marginTop: 14 }}>
                    <div style={{ color: "#c4b5fd", fontWeight: 700, marginBottom: 8 }}>💡 Improvements</div>
                    {atsResult.improvements.map((t, i) => <div key={i} style={{ color: "#f3f4f6", fontSize: 13, marginBottom: 6 }}>• {t}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* JD MATCH */}
        {tab === "jd" && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ color: "#f3f4f6", marginTop: 0 }}>🎯 Job Description Match</h2>
            <p style={{ color: "#9ca3af", marginBottom: 16 }}>See how well your resume fits the job</p>
            <FileUploadBox file={jdFile} setFile={setJdFile} id="jd-file" />
            <label style={{ color: "#c4b5fd", fontSize: 14, display: "block", marginBottom: 8 }}>📋 Paste Job Description</label>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={6}
              placeholder="Copy and paste the job description here..."
              style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #4b5563", background: "#1f2937", color: "#f9fafb", fontSize: 14, resize: "vertical", marginBottom: 16, boxSizing: "border-box" }} />
            <button onClick={runJDMatch} disabled={jdLoading}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(90deg,#7c3aed,#a21caf)", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              {jdLoading ? "🔍 Matching..." : "🎯 Check Fit Score"}
            </button>
            {jdResult && (
              <div style={{ marginTop: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", border: `5px solid ${scoreColor(jdResult.fitScore)}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: scoreColor(jdResult.fitScore) }}>{jdResult.fitScore}%</span>
                  </div>
                  <div style={{ color: "#f3f4f6", marginTop: 10, fontSize: 16 }}>{jdResult.verdict}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 12, padding: 14 }}>
                    <div style={{ color: "#34d399", fontWeight: 700, marginBottom: 8 }}>✅ Matched Skills</div>
                    {jdResult.matchedSkills?.map((k, i) => <span key={i} style={{ display: "inline-block", background: "rgba(34,197,94,0.2)", color: "#86efac", padding: "2px 10px", borderRadius: 20, fontSize: 12, margin: "2px" }}>{k}</span>)}
                  </div>
                  <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 12, padding: 14 }}>
                    <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 8 }}>⚠️ Missing Skills</div>
                    {jdResult.missingSkills?.map((k, i) => <span key={i} style={{ display: "inline-block", background: "rgba(239,68,68,0.2)", color: "#fca5a5", padding: "2px 10px", borderRadius: 20, fontSize: 12, margin: "2px" }}>{k}</span>)}
                  </div>
                </div>
                {jdResult.tips?.length > 0 && (
                  <div style={{ background: "rgba(124,58,237,0.1)", borderRadius: 12, padding: 14 }}>
                    <div style={{ color: "#c4b5fd", fontWeight: 700, marginBottom: 8 }}>💡 Tips to Improve Your Fit</div>
                    {jdResult.tips.map((t, i) => <div key={i} style={{ color: "#f3f4f6", fontSize: 13, marginBottom: 6 }}>• {t}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ANSWER IMPROVER */}
        {tab === "improve" && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ color: "#f3f4f6", marginTop: 0 }}>✨ Answer Improvement Suggester</h2>
            <p style={{ color: "#9ca3af", marginBottom: 16 }}>Submit your answer — AI rewrites it better!</p>
            <label style={{ color: "#c4b5fd", fontSize: 14, display: "block", marginBottom: 8 }}>❓ Question</label>
            <input value={impQuestion} onChange={e => setImpQuestion(e.target.value)}
              placeholder="e.g. What is your greatest weakness?"
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #4b5563", background: "#1f2937", color: "#fff", fontSize: 14, marginBottom: 16, boxSizing: "border-box" }} />
            <label style={{ color: "#c4b5fd", fontSize: 14, display: "block", marginBottom: 8 }}>💬 Your Answer</label>
            <textarea value={impAnswer} onChange={e => setImpAnswer(e.target.value)} rows={5}
              placeholder="Paste your original answer here..."
              style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #4b5563", background: "#1f2937", color: "#f9fafb", fontSize: 14, resize: "vertical", marginBottom: 16, boxSizing: "border-box" }} />
            <button onClick={improveAnswer} disabled={impLoading}
              style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(90deg,#7c3aed,#a21caf)", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              {impLoading ? "✨ Improving..." : "✨ Improve My Answer"}
            </button>
            {impResult && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ background: "#1f2937", borderRadius: 12, padding: 16, borderLeft: "4px solid #6b7280" }}>
                    <div style={{ color: "#9ca3af", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📝 Your Original Answer <span style={{ color: "#ef4444" }}>(Score: {impResult.score}/10)</span></div>
                    <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{impAnswer}</p>
                  </div>
                  <div style={{ background: "#1f2937", borderRadius: 12, padding: 16, borderLeft: "4px solid #22c55e" }}>
                    <div style={{ color: "#34d399", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>⭐ Improved Answer</div>
                    <p style={{ color: "#f3f4f6", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{impResult.improvedAnswer}</p>
                  </div>
                </div>
                {impResult.whatWasImproved?.length > 0 && (
                  <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 12, padding: 14 }}>
                    <div style={{ color: "#34d399", fontWeight: 700, marginBottom: 8 }}>🔑 What Was Improved</div>
                    {impResult.whatWasImproved.map((t, i) => <div key={i} style={{ color: "#d1fae5", fontSize: 13, marginBottom: 6 }}>• {t}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* QUESTION BANK */}
        {tab === "qbank" && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ color: "#f3f4f6", marginTop: 0 }}>🏢 Company-wise Question Bank</h2>

            {/* Company selector */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {Object.keys(COMPANY_COLORS).map(c => (
                <button key={c} onClick={() => setQbCompany(c)}
                  style={{ padding: "8px 18px", borderRadius: 20, border: `2px solid ${qbCompany === c ? COMPANY_COLORS[c] : "#374151"}`, background: qbCompany === c ? `${COMPANY_COLORS[c]}22` : "transparent", color: qbCompany === c ? COMPANY_COLORS[c] : "#9ca3af", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Category selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setQbCategory(cat)}
                  style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${qbCategory === cat ? "#7c3aed" : "#374151"}`, background: qbCategory === cat ? "rgba(124,58,237,0.2)" : "transparent", color: qbCategory === cat ? "#c4b5fd" : "#9ca3af", cursor: "pointer", fontSize: 13 }}>
                  {cat === "HR" ? "🏢" : cat === "Technical" ? "💻" : cat === "Puzzle" ? "🧩" : "💼"} {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button onClick={loadQB} disabled={qbLoading}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#7c3aed,#a21caf)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {qbLoading ? "Loading..." : "📚 Load Questions"}
              </button>
              <button onClick={generateAIQuestions} disabled={qbAILoading}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#059669,#0ea5e9)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {qbAILoading ? "Generating..." : "🤖 AI Generate More"}
              </button>
            </div>

            {/* Static questions */}
            {qbQuestions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, textTransform: "uppercase" }}>Top {qbCompany} {qbCategory} Questions</div>
                {qbQuestions.map((q, i) => (
                  <div key={i} style={{ background: "#1f2937", borderRadius: 10, padding: 14, marginBottom: 8, borderLeft: `4px solid ${COMPANY_COLORS[qbCompany]}` }}>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Q{i + 1}.</span>
                    <p style={{ color: "#f3f4f6", margin: "6px 0 0", lineHeight: 1.6, fontSize: 14 }}>{q}</p>
                  </div>
                ))}
              </div>
            )}

            {/* AI questions */}
            {qbAI.length > 0 && (
              <div>
                <div style={{ color: "#a78bfa", fontSize: 12, marginBottom: 8, textTransform: "uppercase" }}>🤖 AI Generated Questions</div>
                {qbAI.map((q, i) => (
                  <div key={i} style={{ background: "rgba(124,58,237,0.1)", borderRadius: 10, padding: 14, marginBottom: 8, border: "1px solid #7c3aed" }}>
                    <p style={{ color: "#f3f4f6", margin: 0, lineHeight: 1.6, fontSize: 14 }}>{typeof q === "string" ? q : JSON.stringify(q)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
