import { useState, useEffect } from "react";
import axios from "../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, interviewsRes] = await Promise.all([
        axios.get("/api/interview/admin/stats"),
        axios.get("/api/interview/admin/users"),
        axios.get("/api/interview/admin/interviews")
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setInterviews(interviewsRes.data);
    } catch (err) {
      setError("Failed to load admin data. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/interview/admin/user/${userId}/role`, { role: newRole });
      // Reload users
      const usersRes = await axios.get("/api/interview/admin/users");
      setUsers(usersRes.data);
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🔧 Admin Dashboard</h1>
        <p>Manage users, interviews, and system analytics</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({stats?.totalUsers || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          🎤 Interviews ({stats?.totalInterviews || 0})
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="admin-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>👥 Total Users</h3>
              <div className="stat-number">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <h3>🎤 Total Interviews</h3>
              <div className="stat-number">{stats.totalInterviews}</div>
            </div>
            <div className="stat-card">
              <h3>👑 Admins</h3>
              <div className="stat-number">{stats.totalAdmins}</div>
            </div>
            <div className="stat-card">
              <h3>📈 Avg Interviews/User</h3>
              <div className="stat-number">
                {stats.totalUsers > 0 ? Math.round(stats.totalInterviews / stats.totalUsers) : 0}
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <div className="activity-section">
              <h3>🕒 Recent Interviews</h3>
              <div className="activity-list">
                {stats.recentInterviews.map((interview, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <strong>{interview.userId?.name || 'Unknown User'}</strong>
                      <span>Topic: {interview.topic || 'General'}</span>
                      <span>Score: {interview.score}/10</span>
                    </div>
                    <div className="activity-time">
                      {formatDate(interview.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="activity-section">
              <h3>🆕 Recent Users</h3>
              <div className="activity-list">
                {stats.recentUsers.map((user, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="activity-time">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users">
          <div className="users-table">
            <div className="table-header">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Joined</div>
              <div>Actions</div>
            </div>
            {users.map(user => (
              <div key={user._id} className="table-row">
                <div>{user.name}</div>
                <div>{user.email}</div>
                <div>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>{formatDate(user.createdAt)}</div>
                <div>
                  <button className="action-btn">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="admin-interviews">
          <div className="interviews-table">
            <div className="table-header">
              <div>User</div>
              <div>Topic</div>
              <div>Score</div>
              <div>Duration</div>
              <div>Date</div>
              <div>Actions</div>
            </div>
            {interviews.map(interview => (
              <div key={interview._id} className="table-row">
                <div>{interview.userId?.name || 'Unknown'}</div>
                <div>{interview.topic || 'General'}</div>
                <div>{interview.score}/10</div>
                <div>{interview.recordingDuration ? `${Math.floor(interview.recordingDuration / 60)}:${(interview.recordingDuration % 60).toString().padStart(2, '0')}` : 'N/A'}</div>
                <div>{formatDate(interview.createdAt)}</div>
                <div>
                  {interview.recordingUrl && (
                    <button className="action-btn">🎥 View Recording</button>
                  )}
                  <button className="action-btn">📄 View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}