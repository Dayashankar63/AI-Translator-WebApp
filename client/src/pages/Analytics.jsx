import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from "chart.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend as RechartsLegend,
  Cell
} from "recharts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

export default function Analytics() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    improvementRate: 0,
    totalTime: 0,
    topicBreakdown: {},
    weeklyProgress: [],
    strengths: [],
    weaknesses: []
  });

  const loadAnalyticsFromStorage = () => {
    const savedAnalytics = localStorage.getItem("interviewAnalytics");
    const savedPerformance = localStorage.getItem("interviewPerformance");

    if (savedAnalytics) {
      setAnalytics(prev => ({ ...prev, ...JSON.parse(savedAnalytics) }));
      return;
    }

    if (savedPerformance) {
      setAnalytics(prev => ({ ...prev, ...JSON.parse(savedPerformance) }));
    }
  };

  useEffect(() => {
    loadAnalyticsFromStorage();
    window.addEventListener("storage", loadAnalyticsFromStorage);
    window.addEventListener("focus", loadAnalyticsFromStorage);

    return () => {
      window.removeEventListener("storage", loadAnalyticsFromStorage);
      window.removeEventListener("focus", loadAnalyticsFromStorage);
    };
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Calculate AI Score color based on value
  const getAIScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    if (score >= 40) return '#FF9800'; // Orange
    return '#FF5722'; // Red
  };

  // Calculate AI Score from analytics
  const calculateAIScore = () => {
    if (analytics.averageScore === 0) return 0;
    return analytics.averageScore;
  };

  // Get topic difficulty level
  const getTopicDifficulty = (score) => {
    if (score >= 80) return { level: 'Expert', color: '#4CAF50', icon: '🏆' };
    if (score >= 65) return { level: 'Advanced', color: '#2196F3', icon: '💪' };
    if (score >= 50) return { level: 'Intermediate', color: '#FF9800', icon: '📈' };
    if (score >= 35) return { level: 'Beginner', color: '#FF5722', icon: '🎯' };
    return { level: 'Novice', color: '#9C27B0', icon: '🌱' };
  };

  // Get performance trend
  const getPerformanceTrend = (score, previousScore = null) => {
    if (!previousScore) return { trend: 'stable', icon: '➡️', color: '#9E9E9E' };
    const diff = score - previousScore;
    if (diff > 5) return { trend: 'improving', icon: '📈', color: '#4CAF50' };
    if (diff < -5) return { trend: 'declining', icon: '📉', color: '#FF5722' };
    return { trend: 'stable', icon: '➡️', color: '#9E9E9E' };
  };

  // Get topic recommendations
  const getTopicRecommendations = (topic, score) => {
    const recommendations = {
      'React': score < 70 ? ['Practice component lifecycle', 'Learn hooks deeply', 'Build complex UIs'] : ['Master advanced patterns', 'Explore performance optimization'],
      'Node.js': score < 70 ? ['Study async programming', 'Learn Express.js', 'Practice API design'] : ['Explore microservices', 'Master database integration'],
      'Data Structures': score < 70 ? ['Review basic algorithms', 'Practice problem solving', 'Learn time complexity'] : ['Master advanced structures', 'Focus on optimization'],
      'System Design': score < 70 ? ['Study design patterns', 'Learn scalability concepts', 'Practice architecture design'] : ['Explore distributed systems', 'Master high availability']
    };
    return recommendations[topic] || ['Continue practicing', 'Focus on fundamentals', 'Seek mentorship'];
  };

  // Generate dynamic AI feedback
  const generateAIFeedback = () => {
    const feedbackMessages = [];
    const score = calculateAIScore();
    const improvement = analytics.improvementRate;

    // Communication feedback
    if (analytics.totalInterviews > 0) {
      if (score >= 85) {
        feedbackMessages.push({
          text: "You improved in communication 👍",
          type: "positive",
          emoji: "💬"
        });
      } else if (score >= 70) {
        feedbackMessages.push({
          text: "Communication skills are developing well 📈",
          type: "good",
          emoji: "💬"
        });
      } else {
        feedbackMessages.push({
          text: "Work on communication clarity ⚠️",
          type: "warning",
          emoji: "💬"
        });
      }

      // Technical skills feedback
      if (score >= 80) {
        feedbackMessages.push({
          text: "Strong technical answers 💪",
          type: "positive",
          emoji: "⚡"
        });
      } else if (score >= 60) {
        feedbackMessages.push({
          text: "Technical knowledge is solid 🎯",
          type: "good",
          emoji: "⚡"
        });
      } else {
        feedbackMessages.push({
          text: "Focus on technical depth 📚",
          type: "warning",
          emoji: "⚡"
        });
      }

      // Confidence feedback
      if (improvement > 10) {
        feedbackMessages.push({
          text: "Your confidence is improving rapidly 🚀",
          type: "positive",
          emoji: "🎯"
        });
      } else if (improvement > 0) {
        feedbackMessages.push({
          text: "Keep building your confidence 💪",
          type: "good",
          emoji: "🎯"
        });
      } else if (score < 50) {
        feedbackMessages.push({
          text: "Work on confidence in interviews ⚠️",
          type: "warning",
          emoji: "🎯"
        });
      } else {
        feedbackMessages.push({
          text: "Confidence levels are stable ✓",
          type: "good",
          emoji: "🎯"
        });
      }

      // Practice frequency feedback
      if (analytics.totalInterviews >= 10) {
        feedbackMessages.push({
          text: "Excellent practice consistency! 🏆",
          type: "positive",
          emoji: "📊"
        });
      } else if (analytics.totalInterviews >= 5) {
        feedbackMessages.push({
          text: "Good practice routine established 📈",
          type: "good",
          emoji: "📊"
        });
      } else {
        feedbackMessages.push({
          text: "Increase practice frequency for faster improvement 🎯",
          type: "warning",
          emoji: "📊"
        });
      }
    }

    return feedbackMessages;
  };

  const score = calculateAIScore();

  const weeklyProgressData = analytics.weeklyProgress.length > 0 ? analytics.weeklyProgress : [
    { label: 'Week 1', score: 58 },
    { label: 'Week 2', score: 64 },
    { label: 'Week 3', score: 72 },
    { label: 'Week 4', score: 78 },
    { label: 'Week 5', score: 84 }
  ];

  const topicData = Object.keys(analytics.topicBreakdown).length > 0
    ? Object.entries(analytics.topicBreakdown).map(([topic, data]) => ({
        topic,
        score: data?.averageScore ?? data?.score ?? 0
      }))
    : [
        { topic: 'React', score: 82 },
        { topic: 'Node.js', score: 74 },
        { topic: 'Data Structures', score: 68 },
        { topic: 'System Design', score: 59 }
      ];

  const lineChartData = {
    labels: weeklyProgressData.map((item) => item.label),
    datasets: [
      {
        label: 'AI Score',
        data: weeklyProgressData.map((item) => item.score),
        fill: true,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.18)',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4CAF50',
        borderWidth: 3
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.08)'
        },
        ticks: { color: 'rgba(255,255,255,0.8)' }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255,255,255,0.08)'
        },
        ticks: { color: 'rgba(255,255,255,0.8)' }
      }
    }
  };

  const radarChartData = {
    labels: topicData.map(item => item.topic),
    datasets: [
      {
        label: 'Performance Score',
        data: topicData.map(item => item.score),
        fill: true,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4CAF50',
        borderWidth: 3,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4CAF50',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 20, 38, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.r}%`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: 'rgba(255,255,255,0.6)',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(255,255,255,0.08)'
        },
        angleLines: {
          color: 'rgba(255,255,255,0.08)'
        },
        pointLabels: {
          color: 'rgba(255,255,255,0.8)',
          font: {
            size: 12,
            weight: '600'
          }
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, rgba(253, 113, 113, 0.15), transparent 25%), radial-gradient(circle at 20% 10%, rgba(255, 165, 0, 0.12), transparent 18%), #090b13',
      padding: '80px 20px 40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '16px' }}>
            📊 Performance Analytics
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>
            Track your interview preparation progress and identify areas for improvement
          </p>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              {analytics.totalInterviews}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Total Interviews</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              {analytics.averageScore}%
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Average Score</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              {analytics.bestScore}%
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Best Score</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            padding: '24px',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              {formatTime(analytics.totalTime)}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Practice Time</div>
          </div>
        </div>

        {/* AI Score Meter - Advanced Gauge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(40, 43, 88, 0.75), rgba(10, 15, 40, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '28px',
          padding: '40px',
          marginBottom: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(14px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <style>{`
            @keyframes meterGlow {
              0% { transform: scale(1); opacity: 0.95; }
              50% { transform: scale(1.02); opacity: 1; }
              100% { transform: scale(1); opacity: 0.95; }
            }
            .meter-flicker {
              animation: pulse 1.6s ease-in-out infinite;
            }
            @keyframes pulse {
              0% { opacity: 0.8; transform: scale(0.96); }
              50% { opacity: 1; transform: scale(1.02); }
              100% { opacity: 0.8; transform: scale(0.96); }
            }
          `}</style>

          <h2 style={{
            color: 'white',
            marginBottom: '30px',
            fontSize: '28px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px'
          }}>
            <span>🚀</span> AI Score Meter
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '30px',
            position: 'relative'
          }}>
            <svg width="120" height="320" viewBox="0 0 120 320">
              <defs>
                <linearGradient id="verticalMeterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#FF5252" />
                  <stop offset="45%" stopColor="#FFB74D" />
                  <stop offset="100%" stopColor="#4CAF50" />
                </linearGradient>
                <filter id="verticalGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background bar */}
              <rect
                x="40"
                y="20"
                width="40"
                height="280"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
                rx="20"
              />

              {/* Progress bar */}
              <rect
                x="40"
                y={20 + (280 - (280 * score / 100))}
                width="40"
                height={280 * score / 100}
                fill="url(#verticalMeterGradient)"
                stroke="none"
                rx="20"
                filter="url(#verticalGlow)"
                style={{ transition: 'all 1.8s ease-in-out' }}
              />

              {/* Tick marks */}
              {[...Array(11)].map((_, index) => {
                const y = 20 + (index * 28);
                return (
                  <g key={index}>
                    <line
                      x1="30"
                      y1={y}
                      x2="40"
                      y2={y}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="2"
                    />
                    <text
                      x="20"
                      y={y + 4}
                      fill="rgba(255,255,255,0.6)"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {100 - (index * 10)}
                    </text>
                  </g>
                );
              })}

              {/* Current level indicator */}
              <rect
                x="35"
                y={20 + (280 - (280 * score / 100)) - 3}
                width="50"
                height="6"
                fill={getAIScoreColor(score)}
                rx="3"
                className="meter-flicker"
                style={{
                  filter: `drop-shadow(0 0 8px ${getAIScoreColor(score)})`,
                  animation: 'pulse 1.6s ease-in-out infinite'
                }}
              />
            </svg>

            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                fontSize: '64px',
                fontWeight: '900',
                color: getAIScoreColor(score),
                textShadow: `0 0 24px ${getAIScoreColor(score)}`
              }}>
                {score}
              </div>
              <div style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.75)',
                marginTop: '6px',
                fontWeight: '600'
              }}>%</div>
              <div style={{
                marginTop: '12px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                letterSpacing: '0.08em'
              }}>
                {score >= 80 ? 'Elite' : score >= 60 ? 'Strong' : score >= 40 ? 'Growing' : 'Needs Boost'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 87, 34, 0.2)',
              border: '1px solid rgba(255, 87, 34, 0.4)',
              borderRadius: '10px',
              padding: '12px',
              color: '#FF5722'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>0-40</div>
              <div style={{ fontSize: '11px' }}>Needs Work</div>
            </div>

            <div style={{
              background: 'rgba(255, 152, 0, 0.2)',
              border: '1px solid rgba(255, 152, 0, 0.4)',
              borderRadius: '10px',
              padding: '12px',
              color: '#FF9800'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>40-60</div>
              <div style={{ fontSize: '11px' }}>Good Start</div>
            </div>

            <div style={{
              background: 'rgba(255, 193, 7, 0.2)',
              border: '1px solid rgba(255, 193, 7, 0.4)',
              borderRadius: '10px',
              padding: '12px',
              color: '#FFC107'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>60-80</div>
              <div style={{ fontSize: '11px' }}>Very Good</div>
            </div>

            <div style={{
              background: 'rgba(76, 175, 80, 0.2)',
              border: '1px solid rgba(76, 175, 80, 0.4)',
              borderRadius: '10px',
              padding: '12px',
              color: '#4CAF50'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>80-100</div>
              <div style={{ fontSize: '11px' }}>Excellent</div>
            </div>
          </div>

          {/* Score description */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0',
              fontSize: '14px'
            }}>
              {calculateAIScore() === 0
                ? '🚀 Complete your first interview to generate your AI Score!'
                : calculateAIScore() >= 80
                ? '🏆 Excellent! You\'re performing at an elite level. Keep practicing to maintain your skills!'
                : calculateAIScore() >= 60
                ? '💪 Very Good! You\'re on the right track. Focus on areas needing improvement!'
                : calculateAIScore() >= 40
                ? '📈 Good Start! Continue practicing to improve your interview skills.'
                : '🎯 Keep practicing! Each interview brings you closer to mastery.'}
            </p>
          </div>
        </div>

        {/* Live AI Feedback Box */}
        {analytics.totalInterviews > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(103, 58, 183, 0.1) 100%)',
            border: '2px solid rgba(33, 150, 243, 0.3)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '40px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <style>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateX(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
              .feedback-item {
                animation: slideIn 0.5s ease-out forwards;
              }
            `}</style>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '28px' }}>🤖</span>
              <h2 style={{
                color: 'white',
                margin: '0',
                fontSize: '24px',
                fontWeight: '700'
              }}>
                Live AI Feedback
              </h2>
              <div style={{
                display: 'inline-block',
                background: 'rgba(76, 175, 80, 0.3)',
                border: '1px solid rgba(76, 175, 80, 0.6)',
                color: '#4CAF50',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                marginLeft: 'auto'
              }}>
                ● Live
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              {generateAIFeedback().map((feedback, index) => {
                const bgColor = 
                  feedback.type === 'positive' 
                    ? 'rgba(76, 175, 80, 0.15)' 
                    : feedback.type === 'good' 
                    ? 'rgba(33, 150, 243, 0.15)' 
                    : 'rgba(255, 152, 0, 0.15)';
                
                const borderColor = 
                  feedback.type === 'positive' 
                    ? 'rgba(76, 175, 80, 0.4)' 
                    : feedback.type === 'good' 
                    ? 'rgba(33, 150, 243, 0.4)' 
                    : 'rgba(255, 152, 0, 0.4)';

                const textColor = 
                  feedback.type === 'positive' 
                    ? '#81C784' 
                    : feedback.type === 'good' 
                    ? '#64B5F6' 
                    : '#FFB74D';

                return (
                  <div
                    key={index}
                    className="feedback-item"
                    style={{
                      background: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '14px',
                      padding: '18px',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      animationDelay: `${index * 0.1}s`
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 10px 30px ${textColor}33`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontSize: '24px',
                      marginBottom: '10px'
                    }}>
                      {feedback.emoji}
                    </div>
                    <div style={{
                      color: textColor,
                      fontWeight: '600',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {feedback.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feedback Footer */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0',
                fontSize: '13px'
              }}>
                Based on {analytics.totalInterviews} interview{analytics.totalInterviews !== 1 ? 's' : ''}, our AI has identified these insights. Keep practicing to see personalized recommendations!
              </p>
            </div>
          </div>
        )}

        {/* Detailed Analytics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
        {/* Comprehensive Performance Analytics */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(40, 43, 88, 0.8), rgba(10, 15, 40, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '40px',
          backdropFilter: 'blur(16px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <style>{`
            @keyframes radarPulse {
              0% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); opacity: 0.8; }
            }
            @keyframes cardHover {
              0% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-8px) scale(1.02); }
              100% { transform: translateY(0) scale(1); }
            }
            @keyframes skillPulse {
              0% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); opacity: 0.9; }
            }
            @keyframes progressFill {
              0% { width: 0%; }
              100% { width: var(--progress-width); }
            }
            @keyframes cardSlideIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .topic-card {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
            }
            .topic-card:hover {
              animation: cardHover 0.6s ease-in-out;
            }
            .skill-card {
              animation: cardSlideIn 0.6s ease-out forwards;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .skill-card:hover {
              transform: translateY(-8px) scale(1.02);
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .progress-bar {
              position: relative;
              height: 8px;
              background: rgba(255,255,255,0.1);
              border-radius: 4px;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #4CAF50, #66BB6A);
              border-radius: 4px;
              animation: progressFill 1.5s ease-out forwards;
              width: 0%;
            }
            .improvement-card {
              animation: cardSlideIn 0.6s ease-out forwards;
              border-left: 4px solid #FF5722;
              background: linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 87, 34, 0.05));
            }
            .radar-container {
              animation: radarPulse 3s ease-in-out infinite;
            }
          `}</style>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <span style={{ fontSize: '32px' }}>🎯</span>
            <h2 style={{
              color: 'white',
              margin: '0',
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(90deg, #64B5F6, #42A5F5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Comprehensive Performance Analytics
            </h2>
            <div style={{
              display: 'inline-block',
              background: 'rgba(100, 181, 246, 0.2)',
              border: '1px solid rgba(100, 181, 246, 0.4)',
              color: '#64B5F6',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              marginLeft: 'auto'
            }}>
              🤖 AI-Powered Insights
            </div>
          </div>

          {/* Topic Performance Section */}
          <div style={{
            marginBottom: '48px'
          }}>
            <h3 style={{
              color: 'white',
              marginBottom: '24px',
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📊</span> Topic Performance Analysis
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              alignItems: 'start'
            }}>
              {/* Radar Chart */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                minHeight: '400px'
              }}>
                <h4 style={{
                  color: 'white',
                  marginBottom: '20px',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🎯</span> Performance Radar
                </h4>
                <div className="radar-container" style={{ height: '320px' }}>
                  <Radar data={radarChartData} options={radarChartOptions} />
                </div>
              </div>

              {/* Topic Details */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                minHeight: '400px'
              }}>
                <h4 style={{
                  color: 'white',
                  marginBottom: '20px',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔍</span> Topic Insights
                </h4>

                {selectedTopic ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <h5 style={{
                        color: 'white',
                        margin: '0',
                        fontSize: '20px',
                        fontWeight: '600'
                      }}>
                        {selectedTopic.topic}
                      </h5>
                      <button
                        onClick={() => setSelectedTopic(null)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#4CAF50'
                        }}>
                          {selectedTopic.score}%
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                          Current Score
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(100, 181, 246, 0.1)',
                        border: '1px solid rgba(100, 181, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#64B5F6'
                        }}>
                          {getTopicDifficulty(selectedTopic.score).icon}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                          {getTopicDifficulty(selectedTopic.score).level}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <h6 style={{
                        color: 'white',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        💡 Recommendations:
                      </h6>
                      <ul style={{
                        color: 'rgba(255,255,255,0.8)',
                        paddingLeft: '20px',
                        fontSize: '13px'
                      }}>
                        {getTopicRecommendations(selectedTopic.topic, selectedTopic.score).map((rec, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '12px',
                    maxHeight: '320px',
                    overflowY: 'auto'
                  }}>
                    {topicData.map((topic, index) => {
                      const difficulty = getTopicDifficulty(topic.score);
                      const trend = getPerformanceTrend(topic.score);

                      return (
                        <div
                          key={topic.topic}
                          className="topic-card"
                          onClick={() => setSelectedTopic(topic)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${difficulty.color}20, ${difficulty.color}40)`,
                              border: `2px solid ${difficulty.color}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px'
                            }}>
                              {difficulty.icon}
                            </div>
                            <div>
                              <div style={{
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                              }}>
                                {topic.topic}
                              </div>
                              <div style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '12px'
                              }}>
                                {difficulty.level} Level
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              color: difficulty.color,
                              fontWeight: 'bold',
                              fontSize: '18px'
                            }}>
                              {topic.score}%
                            </div>
                            <div style={{
                              color: trend.color,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span>{trend.icon}</span>
                              <span>{trend.trend}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Heatmap */}
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '24px'
            }}>
              <h4 style={{
                color: 'white',
                marginBottom: '20px',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🔥</span> Performance Heatmap
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${topicData.length}, 1fr)`,
                gap: '8px',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                {topicData.map((topic, index) => {
                  const intensity = topic.score / 100;
                  const color = intensity > 0.8 ? '#4CAF50' :
                               intensity > 0.6 ? '#8BC34A' :
                               intensity > 0.4 ? '#FFC107' :
                               intensity > 0.2 ? '#FF9800' : '#FF5722';

                  return (
                    <div key={topic.topic} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${color}80, ${color}CC)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: `0 4px 12px ${color}40`,
                        transition: 'all 0.3s ease'
                      }}
                      title={`${topic.topic}: ${topic.score}%`}>
                        {topic.score}
                      </div>
                      <div style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '11px',
                        textAlign: 'center',
                        fontWeight: '500'
                      }}>
                        {topic.topic}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Strengths & Improvement Analysis Section */}
          <div>
            <h3 style={{
              color: 'white',
              marginBottom: '24px',
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🧠</span> Personal Performance Analysis
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              alignItems: 'start'
            }}>
              {/* Strengths Analysis */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h4 style={{
                  color: 'white',
                  marginBottom: '20px',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>💪</span> Core Strengths
                </h4>

                {analytics.strengths.length > 0 ? (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {analytics.strengths.map((strength, index) => {
                      const strengthScore = Math.floor(Math.random() * 30) + 70; // Mock score for demo
                      return (
                        <div
                          key={index}
                          className="skill-card"
                          style={{
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            borderRadius: '12px',
                            padding: '16px',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                              }}>
                                💪
                              </div>
                              <div>
                                <div style={{
                                  color: 'white',
                                  fontWeight: '600',
                                  fontSize: '14px'
                                }}>
                                  {strength}
                                </div>
                                <div style={{
                                  color: 'rgba(255,255,255,0.6)',
                                  fontSize: '12px'
                                }}>
                                  Strength #{index + 1}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              textAlign: 'right'
                            }}>
                              <div style={{
                                color: '#4CAF50',
                                fontWeight: 'bold',
                                fontSize: '18px'
                              }}>
                                {strengthScore}%
                              </div>
                              <div style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '11px'
                              }}>
                                Proficiency
                              </div>
                            </div>
                          </div>

                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                '--progress-width': `${strengthScore}%`,
                                background: 'linear-gradient(90deg, #4CAF50, #66BB6A)'
                              }}
                            ></div>
                          </div>

                          <div style={{
                            marginTop: '12px',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '12px'
                          }}>
                            💡 Leverage this strength in technical discussions and problem-solving scenarios.
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      opacity: 0.5
                    }}>
                      🎯
                    </div>
                    <div style={{
                      fontSize: '16px',
                      marginBottom: '8px',
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      Ready to Discover Your Strengths!
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: '1.5'
                    }}>
                      Complete your first interview to unlock AI-powered analysis of your technical strengths and communication skills.
                    </div>
                    <div style={{
                      marginTop: '20px',
                      padding: '12px',
                      background: 'rgba(76, 175, 80, 0.1)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#81C784'
                    }}>
                      🚀 Your strengths will be automatically identified and visualized here
                    </div>
                  </div>
                )}
              </div>

              {/* Areas for Improvement */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h4 style={{
                  color: 'white',
                  marginBottom: '20px',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🚀</span> Growth Opportunities
                </h4>

                {analytics.weaknesses.length > 0 ? (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {analytics.weaknesses.map((weakness, index) => {
                      const improvementScore = Math.floor(Math.random() * 40) + 30; // Mock score for demo
                      const priority = improvementScore < 50 ? 'High' : improvementScore < 70 ? 'Medium' : 'Low';
                      const priorityColor = priority === 'High' ? '#FF5722' : priority === 'Medium' ? '#FF9800' : '#4CAF50';

                      return (
                        <div
                          key={index}
                          className="improvement-card"
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FF5722, #FF8A65)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)'
                              }}>
                                🎯
                              </div>
                              <div>
                                <div style={{
                                  color: 'white',
                                  fontWeight: '600',
                                  fontSize: '14px'
                                }}>
                                  {weakness}
                                </div>
                                <div style={{
                                  color: priorityColor,
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  background: `${priorityColor}20`,
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  display: 'inline-block',
                                  marginTop: '4px'
                                }}>
                                  {priority} Priority
                                </div>
                              </div>
                            </div>
                            <div style={{
                              textAlign: 'right'
                            }}>
                              <div style={{
                                color: '#FF5722',
                                fontWeight: 'bold',
                                fontSize: '18px'
                              }}>
                                {improvementScore}%
                              </div>
                              <div style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '11px'
                              }}>
                                Current Level
                              </div>
                            </div>
                          </div>

                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                '--progress-width': `${improvementScore}%`,
                                background: 'linear-gradient(90deg, #FF5722, #FF8A65)'
                              }}
                            ></div>
                          </div>

                          <div style={{
                            marginTop: '12px',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '12px'
                          }}>
                            💡 Focus on targeted practice and study resources to improve this area significantly.
                          </div>

                          <div style={{
                            marginTop: '12px',
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <span style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.6)',
                              background: 'rgba(255,255,255,0.1)',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}>
                              📚 Study Plan
                            </span>
                            <span style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.6)',
                              background: 'rgba(255,255,255,0.1)',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}>
                              🎯 Practice Drills
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      opacity: 0.5
                    }}>
                      🚀
                    </div>
                    <div style={{
                      fontSize: '16px',
                      marginBottom: '8px',
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      Growth Analysis Coming Soon!
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: '1.5'
                    }}>
                      Take your first interview to receive personalized improvement recommendations powered by AI analysis.
                    </div>
                    <div style={{
                      marginTop: '20px',
                      padding: '12px',
                      background: 'rgba(255, 152, 0, 0.1)',
                      border: '1px solid rgba(255, 152, 0, 0.3)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#FFB74D'
                    }}>
                      🎯 AI will identify specific areas for improvement with actionable recommendations
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Insights Summary */}
            {(analytics.strengths.length > 0 || analytics.weaknesses.length > 0) && (
              <div style={{
                gridColumn: '1 / -1',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                marginTop: '24px'
              }}>
                <h4 style={{
                  color: 'white',
                  marginBottom: '20px',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🧠</span> AI Performance Insights
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#4CAF50',
                      marginBottom: '8px'
                    }}>
                      {analytics.strengths.length}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '14px'
                    }}>
                      Identified Strengths
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 87, 34, 0.05))',
                    border: '1px solid rgba(255, 87, 34, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#FF5722',
                      marginBottom: '8px'
                    }}>
                      {analytics.weaknesses.length}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '14px'
                    }}>
                      Growth Areas
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(100, 181, 246, 0.05))',
                    border: '1px solid rgba(100, 181, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#64B5F6',
                      marginBottom: '8px'
                    }}>
                      {Math.round((analytics.strengths.length / (analytics.strengths.length + analytics.weaknesses.length)) * 100) || 0}%
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '14px'
                    }}>
                      Strength Ratio
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(156, 39, 176, 0.05))',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#9C27B0',
                      marginBottom: '8px'
                    }}>
                      🧠
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '14px'
                    }}>
                      AI Analysis
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Analytics Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            minHeight: '400px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '20px' }}>
              📈 Progress Over Time
            </h3>
            <div style={{ height: '320px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            minHeight: '400px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '20px' }}>
              🎯 Quick Stats
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              height: '320px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {analytics.improvementRate > 0 ? '+' : ''}{analytics.improvementRate}%
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Improvement Rate</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {Math.round(analytics.totalTime / analytics.totalInterviews) || 0}m
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Avg. Session</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {topicData.length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Topics Covered</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {topicData.filter(t => t.score >= 70).length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Strong Topics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Interview Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => navigate('/interview')}
            style={{
              background: 'linear-gradient(90deg, #ff8c00, #ffa500)',
              color: '#090b13',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🎤 Back to Interview Practice
          </button>
        </div>
      </div>
    </div>
  );
}