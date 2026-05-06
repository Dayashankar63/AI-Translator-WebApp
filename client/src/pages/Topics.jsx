import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Topics() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    { id: 1, name: "Resume-Based Questions", icon: "📄", color: "#ff9f1c", description: "Resume-driven questions tailored to your experience" },
    { id: 2, name: "AI Video Interview", icon: "📹", color: "#ff7f50", description: "Simulated AI video interview practice" },
    { id: 3, name: "Real-Time Feedback", icon: "💬", color: "#00b894", description: "Instant feedback on responses and delivery" },
    { id: 4, name: "Performance Analytics", icon: "📊", color: "#6c5ce7", description: "Track your progress with AI-powered metrics" },
    { id: 5, name: "Unlimited Practice", icon: "♾️", color: "#00cec9", description: "Practice interviews again and again without limits" },
    { id: 6, name: "Smart Insights", icon: "💡", color: "#fdcb6e", description: "Get AI-driven improvement recommendations" },
    { id: 7, name: "JavaScript", icon: "📘", color: "#f7df1e", description: "JS fundamentals, ES6+, async/await" },
    { id: 8, name: "React", icon: "⚛️", color: "#61dafb", description: "Hooks, state, props, lifecycle" },
    { id: 9, name: "Node.js", icon: "🟢", color: "#68a063", description: "Backends, APIs, Express, MongoDB" },
    { id: 10, name: "Python", icon: "🐍", color: "#3776ab", description: "Django, Flask, data structures" },
    { id: 11, name: "Java", icon: "☕", color: "#007396", description: "OOP, Spring, design patterns" },
    { id: 12, name: "CSS", icon: "🎨", color: "#264de4", description: "Layouts, flexbox, grid, animations" },
    { id: 13, name: "Database", icon: "🗄️", color: "#336791", description: "SQL, NoSQL, optimization" },
    { id: 14, name: "System Design", icon: "🏗️", color: "#ff6b6b", description: "Architecture, scalability, trade-offs" },
  ];

  const handleStartInterview = (topic) => {
    localStorage.setItem("selectedTopic", topic);
    navigate("/interview");
  };

  return (
    <div className="p-6">
      <h2>📚 Select Interview Topic</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>Choose a topic to start practicing interviews</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px"
      }}>
        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            style={{
              background: selectedTopic === topic.id ? topic.color : "white",
              border: `3px solid ${topic.color}`,
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: selectedTopic === topic.id ? "scale(1.05)" : "scale(1)",
              color: selectedTopic === topic.id ? "white" : "black"
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>{topic.icon}</div>
            <h3>{topic.name}</h3>
            <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "15px" }}>
              {topic.description}
            </p>
            {selectedTopic === topic.id && (
              <button
                onClick={() => handleStartInterview(topic.name)}
                style={{
                  background: "white",
                  color: topic.color,
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                🎤 Start Interview
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedTopic && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={() => handleStartInterview(topics.find(t => t.id === selectedTopic).name)}
            className="login-button"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: "18px",
              padding: "15px 40px"
            }}
          >
            ▶️ Start Interview with {topics.find(t => t.id === selectedTopic)?.name}
          </button>
        </div>
      )}
    </div>
  );
}
