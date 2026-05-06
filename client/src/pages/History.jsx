import { useEffect, useState } from "react";
import axios from "../api";

export default function History() {
  const token = localStorage.getItem("token");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get("/api/interview/history", {
          headers: { Authorization: token }
        });
        setInterviews(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  if (loading) return <div className="p-6">⏳ Loading interview history...</div>;

  const averageScore = interviews.length > 0
    ? (interviews.reduce((sum, i) => sum + i.score, 0) / interviews.length).toFixed(1)
    : 0;

  const getScoreColor = (score) => {
    if (score >= 8) return "#28a745"; // green
    if (score >= 6) return "#ffc107"; // yellow
    return "#dc3545"; // red
  };

  return (
    <div className="history-page">
      <div className="history-hero-panel">
        <h2 className="history-title">📋 Interview History</h2>
        {error && <div className="error-message">{error}</div>}
        <p className="history-intro">
          Review your past interview performance with smart metrics, insights, and deep question history—all in one premium dashboard.
        </p>
      </div>

      {interviews.length > 0 ? (
        <>
          <div className="history-summary-grid">
            <div className="history-summary-card history-summary-blue">
              <div className="summary-label">📝 Total Interviews</div>
              <div className="summary-value">{interviews.length}</div>
            </div>
            <div className="history-summary-card history-summary-gold">
              <div className="summary-label">⭐ Average Score</div>
              <div className="summary-value">{averageScore}/10</div>
            </div>
            <div className="history-summary-card history-summary-purple">
              <div className="summary-label">🏆 Excellent (8+)</div>
              <div className="summary-value">{interviews.filter(i => i.score >= 8).length}</div>
            </div>
          </div>

          <h3 className="history-section-heading">Interview Details</h3>
          <div className="history-list">
            {interviews.map((interview, idx) => (
              <div
                key={idx}
                className={`history-card ${expandedId === idx ? 'expanded' : ''}`}
                onClick={() => setExpandedId(expandedId === idx ? null : idx)}
              >
                <div className="history-card-header">
                  <div>
                    <h4>Interview #{interviews.length - idx}</h4>
                    <p className="history-meta">📅 {new Date(interview.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="history-score" style={{ background: getScoreColor(interview.score) }}>
                    {interview.score}/10
                  </div>
                </div>

                {expandedId === idx && (
                  <div className="history-card-details">
                    <div className="history-detail-block">
                      <h5>❓ Question:</h5>
                      <p>{interview.question}</p>
                    </div>

                    <div className="history-detail-block">
                      <h5>💬 Your Answer:</h5>
                      <p>{interview.answer}</p>
                    </div>

                    <div className="history-detail-block">
                      <h5>📊 Feedback:</h5>
                      <p>{interview.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="history-empty-state">
          <h3>📭 No interviews yet</h3>
          <p>Start practicing interviews to see your history come alive with smart insights.</p>
          <a href="/interview" className="history-start-button">🎤 Start Interview</a>
        </div>
      )}
    </div>
  );
}
