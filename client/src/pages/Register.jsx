import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "../api";

export default function Register({ setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/register", {
        name, email, password
      });
      const loginRes = await axios.post("/api/auth/login", {
        email, password
      });
      localStorage.setItem("token", loginRes.data.token);
      setToken(loginRes.data.token);
      navigate(redirectPath);
    } catch (err) {
      const message = err.response?.data || err.response?.data?.message || err.message || "Registration failed";
      setError(typeof message === "string" ? message : "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join AI Interview Platform</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text"
            placeholder="Enter your name" 
            onChange={e=>setName(e.target.value)} 
            className="register-input"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email"
            placeholder="Enter your email" 
            onChange={e=>setEmail(e.target.value)} 
            className="register-input"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            onChange={e=>setPassword(e.target.value)} 
            className="register-input"
          />
        </div>

        <button 
          onClick={register} 
          className={`register-button ${loading ? 'disabled' : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <div className="login-link">
          Already have an account? <Link to="/" state={{ from: redirectPath }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
}