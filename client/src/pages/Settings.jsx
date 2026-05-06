import { useState, useEffect, useRef } from "react";

const defaultSettings = {
  difficulty: "medium",
  language: "en",
  micVolume: 100,
  speakerVolume: 80,
  autoPlay: true,
  theme: "system",
  notifications: {
    interviewReminders: true,
    featureUpdates: true,
    weeklySummary: false
  },
  interviewMode: "timed",
  voiceStyle: "friendly",
  privacy: {
    shareUsageData: false,
    personalizedContent: true
  }
};

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" }
];

const voiceStyles = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "coach", label: "Coach" },
  { value: "mentor", label: "Mentor" }
];

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("aiInterviewSettings") || "null");
      if (stored) {
        setSettings({ ...defaultSettings, ...stored });
      }
    } catch (err) {
      setSettings(defaultSettings);
    }
  }, []);

  const saveSettings = (nextSettings) => {
    const merged = { ...settings, ...nextSettings };
    setSettings(merged);
    localStorage.setItem("aiInterviewSettings", JSON.stringify(merged));
    setSuccess("Settings saved successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSave = () => {
    saveSettings(settings);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem("aiInterviewSettings", JSON.stringify(defaultSettings));
    setSuccess("Settings reset to defaults.");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleExport = () => {
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-interview-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      setSettings({ ...defaultSettings, ...imported });
      localStorage.setItem("aiInterviewSettings", JSON.stringify({ ...defaultSettings, ...imported }));
      setSuccess("Settings imported successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setSuccess("Failed to import settings. Please use a valid JSON file.");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const updateNested = (path, value) => {
    const next = { ...settings };
    const keys = path.split(".");
    let current = next;
    keys.slice(0, -1).forEach((key) => {
      current[key] = { ...current[key] };
      current = current[key];
    });
    current[keys[keys.length - 1]] = value;
    saveSettings(next);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "30px 20px", background: "radial-gradient(circle at top, #1e1f38, #090a15 60%)", color: "#f5f7ff" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 450px", minWidth: "320px", background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "30px", boxShadow: "0 30px 80px rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 style={{ marginBottom: "10px", fontSize: "34px" }}>⚙️ Advanced Settings</h2>
            <p style={{ color: "rgba(245,247,255,0.75)", lineHeight: "1.8" }}>
              Customize your AI interview experience with precision. Configure behavior, audio, notifications, and privacy preferences in one powerful panel.
            </p>

            {success && (
              <div style={{ marginTop: "20px", padding: "15px 18px", background: "rgba(76, 175, 80, 0.15)", border: "1px solid rgba(76, 175, 80, 0.25)", borderRadius: "14px", color: "#d8ffd6" }}>
                {success}
              </div>
            )}

            <div style={{ display: "grid", gap: "18px", marginTop: "30px" }}>
              <div style={{ display: "grid", gap: "10px" }}>
                <label style={{ fontWeight: 600 }}>🎯 Interview Mode</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {[
                    { value: "timed", label: "Timed" },
                    { value: "untimed", label: "Untimed" },
                    { value: "challenge", label: "Challenge" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => saveSettings({ ...settings, interviewMode: option.value })}
                      style={{
                        flex: "1 1 120px",
                        padding: "14px 16px",
                        borderRadius: "16px",
                        border: settings.interviewMode === option.value ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.12)",
                        background: settings.interviewMode === option.value ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                        color: "#f5f7ff",
                        cursor: "pointer"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <label style={{ fontWeight: 600 }}>✨ Voice Assistant Style</label>
                <select
                  value={settings.voiceStyle}
                  onChange={(e) => saveSettings({ ...settings, voiceStyle: e.target.value })}
                  style={{ padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#f5f7ff" }}
                >
                  {voiceStyles.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <label style={{ fontWeight: 600 }}>🎨 Theme Preference</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                    { value: "system", label: "System" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => saveSettings({ ...settings, theme: option.value })}
                      style={{
                        flex: "1 1 100px",
                        padding: "14px 16px",
                        borderRadius: "16px",
                        border: settings.theme === option.value ? "2px solid #06b6d4" : "1px solid rgba(255,255,255,0.12)",
                        background: settings.theme === option.value ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.04)",
                        color: "#f5f7ff",
                        cursor: "pointer"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 320px", minWidth: "320px", background: "rgba(255,255,255,0.03)", borderRadius: "24px", padding: "28px", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
            <h3 style={{ marginBottom: "18px", fontSize: "26px" }}>Quick Summary</h3>
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ padding: "18px", background: "rgba(255,255,255,0.05)", borderRadius: "18px" }}>
                <div style={{ fontSize: "14px", color: "rgba(245,247,255,0.7)" }}>Current Mode</div>
                <div style={{ marginTop: "8px", fontSize: "18px", fontWeight: 700 }}>{settings.interviewMode}</div>
              </div>
              <div style={{ padding: "18px", background: "rgba(255,255,255,0.05)", borderRadius: "18px" }}>
                <div style={{ fontSize: "14px", color: "rgba(245,247,255,0.7)" }}>Voice Style</div>
                <div style={{ marginTop: "8px", fontSize: "18px", fontWeight: 700 }}>{settings.voiceStyle}</div>
              </div>
              <div style={{ padding: "18px", background: "rgba(255,255,255,0.05)", borderRadius: "18px" }}>
                <div style={{ fontSize: "14px", color: "rgba(245,247,255,0.7)" }}>Theme</div>
                <div style={{ marginTop: "8px", fontSize: "18px", fontWeight: 700 }}>{settings.theme}</div>
              </div>
            </div>

            <div style={{ marginTop: "28px", padding: "18px", background: "rgba(255,255,255,0.06)", borderRadius: "18px" }}>
              <div style={{ fontSize: "14px", color: "rgba(245,247,255,0.7)", marginBottom: "12px" }}>Manage Settings</div>
              <button
                onClick={handleSave}
                className="login-button"
                style={{ width: "100%", marginBottom: "10px", padding: "14px 16px", background: "#4f46e5" }}
              >
                💾 Save Now
              </button>
              <button
                onClick={handleReset}
                className="login-button"
                style={{ width: "100%", marginBottom: "10px", padding: "14px 16px", background: "#f97316" }}
              >
                ♻️ Reset Defaults
              </button>
              <button
                onClick={handleExport}
                className="login-button"
                style={{ width: "100%", marginBottom: "10px", padding: "14px 16px", background: "#0ea5e9" }}
              >
                📤 Export Settings
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="login-button"
                style={{ width: "100%", padding: "14px 16px", background: "#10b981" }}
              >
                📥 Import Settings
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "24px", marginTop: "30px", gridTemplateColumns: "1fr 1fr" }}>
          <section style={{ background: "rgba(255,255,255,0.05)", padding: "26px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: "18px", fontSize: "24px" }}>Interview Personalization</h3>
            <div style={{ display: "grid", gap: "18px" }}>
              <div style={{ display: "grid", gap: "10px" }}>
                <label style={{ fontWeight: 600 }}>Difficulty Level</label>
                <select
                  value={settings.difficulty}
                  onChange={(e) => saveSettings({ ...settings, difficulty: e.target.value })}
                  style={{ padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#f5f7ff" }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <label style={{ fontWeight: 600 }}>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => saveSettings({ ...settings, language: e.target.value })}
                  style={{ padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#f5f7ff" }}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <label style={{ fontWeight: 600 }}>Question Preview</label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", padding: "12px 16px", borderRadius: "16px" }}>
                  <input
                    type="checkbox"
                    checked={settings.privacy.personalizedContent}
                    onChange={(e) => updateNested("privacy.personalizedContent", e.target.checked)}
                  />
                  Show question hints and preview
                </label>
              </div>
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.05)", padding: "26px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: "18px", fontSize: "24px" }}>Notifications & Privacy</h3>
            <div style={{ display: "grid", gap: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.04)" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.interviewReminders}
                  onChange={(e) => updateNested("notifications.interviewReminders", e.target.checked)}
                />
                Interview reminder alerts
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.04)" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.featureUpdates}
                  onChange={(e) => updateNested("notifications.featureUpdates", e.target.checked)}
                />
                New feature & product updates
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.04)" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklySummary}
                  onChange={(e) => updateNested("notifications.weeklySummary", e.target.checked)}
                />
                Weekly progress summary
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.04)" }}>
                <input
                  type="checkbox"
                  checked={settings.privacy.shareUsageData}
                  onChange={(e) => updateNested("privacy.shareUsageData", e.target.checked)}
                />
                Share usage data for smarter recommendations
              </label>
            </div>
          </section>
        </div>

        <section style={{ marginTop: "30px", background: "rgba(255,255,255,0.04)", padding: "26px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ marginBottom: "18px", fontSize: "24px" }}>Audio Controls</h3>
          <div style={{ display: "grid", gap: "18px" }}>
            <div>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "10px" }}>Microphone Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.micVolume}
                onChange={(e) => saveSettings({ ...settings, micVolume: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ marginTop: "10px", color: "rgba(245,247,255,0.75)" }}>{settings.micVolume}%</p>
            </div>
            <div>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "10px" }}>Speaker Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.speakerVolume}
                onChange={(e) => saveSettings({ ...settings, speakerVolume: parseInt(e.target.value) })}
                style={{ width: "100%", cursor: "pointer" }}
              />
              <p style={{ marginTop: "10px", color: "rgba(245,247,255,0.75)" }}>{settings.speakerVolume}%</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
