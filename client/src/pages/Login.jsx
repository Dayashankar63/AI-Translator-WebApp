import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "../api";

export default function Login({ setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", {
        email, password
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      navigate(redirectPath);
    } catch (err) {
      const message = err.response?.data || err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      setError(typeof message === "string" ? message : "Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your AI Interview Account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email"
            placeholder="Enter your email" 
            onChange={e=>setEmail(e.target.value)} 
            className="login-input"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            onChange={e=>setPassword(e.target.value)} 
            className="login-input"
          />
        </div>

        <button 
          onClick={login} 
          className={`login-button ${loading ? 'disabled' : ''}`}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="signup-link">
          Don't have an account? <Link to="/register" state={{ from: redirectPath }}>Sign up here</Link>
        </div>
      </div>
    </div>
  );
}