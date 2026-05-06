import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/interview' } });
    } else {
      navigate('/interview');
    }
  };
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-logo">
          <div className="logo-main">
            Interview<span className="logo-accent">Pro</span> <span className="logo-ai"><span className="logo-ai-a">A</span><span className="logo-ai-i">I</span></span>
          </div>
          <div className="logo-badge">
            <span className="logo-badge-text">𝓓𝓪𝔂𝓪</span>
          </div>
        </div>
        <nav className="home-nav-links">
          <a href="#features">🚀 Powers</a>
          <button onClick={handleStartInterview} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>🎬 Start Interview with AI</button>
          <a href="#how-it-works">⚡ Get Started</a>
          <a href="#insights">💎 Results</a>
        </nav>
        <div className="home-action-buttons">
          <Link to="/login" className="home-login-button">Login</Link>
          <Link to="/register" className="home-signup-button">Sign Up</Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-badge">Smart AI Interviewing System</span>
          <h1>Your Personal AI Interview Coach</h1>
          <p>
            Practice real-time AI interviews based on your resume and get instant feedback.
            Build confidence and land your dream job.
          </p>

          <div className="hero-buttons">
            <button onClick={handleStartInterview} className="hero-cta primary">Start Interview</button>
            <Link to="/login" className="hero-cta secondary">Go to Dashboard</Link>
          </div>
        </div>
      </section>

      <section className="how-it-works-section" id="how-it-works">
        <div className="how-it-works-header">
          <h2>Get <span className="accent-text">Started</span></h2>
          <p>Kickstart your AI-driven interview journey in just a few smart steps.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">🤖</div>
            <h3>AI Resume Intelligence</h3>
            <p>👉 Your resume is analyzed using advanced AI to map skills, identify gaps, and personalize your interview experience.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🎯</div>
            <h3>Real-Time Smart Interviews</h3>
            <p>👉 Engage in dynamic AI interviews that evolve based on your answers and performance.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">📈</div>
            <h3>Data-Driven Feedback</h3>
            <p>👉 Receive deep insights, performance analytics, and improvement strategies powered by AI.</p>
          </div>
        </div>
      </section>

      <section className="feature-section" id="features">
        <div className="feature-section-header">
          <h2>AI-Driven Tools to Help You Get <span className="accent-text">Hired Faster</span></h2>
          <p>A next-generation AI platform that prepares you with realistic interviews and data-driven feedback.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-inner">
              <div className="feature-icon">📄</div>
              <h3>AI-Driven Resume Intelligence</h3>
              <p>Advanced AI analyzes your resume to extract key skills, identify patterns, and generate highly personalized interview questions.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-card-inner">
              <div className="feature-icon">📹</div>
              <h3>Adaptive AI Video Interviews</h3>
              <p>Engage in immersive, real-time interviews where AI dynamically adjusts questions based on your responses and performance.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-card-inner">
              <div className="feature-icon">💬</div>
              <h3>Live Behavioral & Communication Feedback</h3>
              <p>Receive instant insights on your answers, speaking style, confidence, and non-verbal cues during the interview.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-card-inner">
              <div className="feature-icon">📊</div>
              <h3>Deep Performance Analytics</h3>
              <p>Access detailed performance reports, scoring metrics, and progress tracking to continuously refine your interview skills.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-card-inner">
              <div className="feature-icon">♾️</div>
              <h3>Unlimited Smart Practice Sessions</h3>
              <p>Practice anytime with AI-driven sessions that evolve with your performance to build confidence and mastery.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-card-inner">
              <div className="feature-icon">💡</div>
              <h3>Personalized AI Growth Insights</h3>
              <p>Discover your strengths, uncover improvement areas, and follow AI-generated strategies tailored to your success.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="insights-section" id="insights">
        <div className="insights-section-header">
          <h2><span className="accent-text">Results</span></h2>
          <p>Unlock peak performance with AI-powered analytics and personalized improvement strategies.</p>
        </div>

        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-card-inner">
              <div className="insight-icon">🎯</div>
              <h3>Weak Areas</h3>
              <p>Pinpoint exactly where you need improvement with detailed question-by-question analysis.</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-card-inner">
              <div className="insight-icon">💪</div>
              <h3>Improve Confidence</h3>
              <p>Build rock-solid confidence through repeated practice sessions with realistic scenarios.</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-card-inner">
              <div className="insight-icon">🤖</div>
              <h3>AI Feedback</h3>
              <p>Receive AI-generated insights tailored to your unique strengths and areas for growth.</p>
            </div>
          </div>

          <div className="insight-card performance-card">
            <div className="insight-card-inner">
              <div className="insight-icon">📈</div>
              <h3>Final Interview Score</h3>
              <p>Get a comprehensive performance overview with detailed percentages for communication, skills, and confidence.</p>
              <div className="score-preview">
                <div className="score-item">
                  <span className="score-label">Communication</span>
                  <span className="score-value">85%</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Skills</span>
                  <span className="score-value">92%</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Confidence</span>
                  <span className="score-value">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Start Interview with AI</h2>
          <p>Join a new generation of candidates mastering interviews with intelligent AI.</p>
          <button onClick={handleStartInterview} className="cta-button primary">
            Get Started Free
          </button>
          <p className="cta-subtitle">Your success story starts here</p>
        </div>
      </section>
    </div>
  );
}
