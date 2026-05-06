import { useEffect, useRef, useState } from "react";
import axios from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [startInterviewAfterAuth, setStartInterviewAfterAuth] = useState(false);
  const redirectPath = location.state?.from || "/interview";
  const selectedTopic = location.state?.topic || localStorage.getItem("selectedTopic") || "Java";
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem("interviewLanguage") || "en-US");

  const LANGUAGES = [
    { code: "en-US",  flag: "🇺🇸", label: "English (US)" },
    { code: "hi-IN",  flag: "🇮🇳", label: "Hindi" },
    { code: "es-ES",  flag: "🇪🇸", label: "Spanish" },
    { code: "fr-FR",  flag: "🇫🇷", label: "French" },
    { code: "de-DE",  flag: "🇩🇪", label: "German" },
    { code: "ar-SA",  flag: "🇸🇦", label: "Arabic" },
    { code: "zh-CN",  flag: "🇨🇳", label: "Chinese" },
    { code: "ja-JP",  flag: "🇯🇵", label: "Japanese" },
    { code: "pt-BR",  flag: "🇧🇷", label: "Portuguese" },
    { code: "ru-RU",  flag: "🇷🇺", label: "Russian" },
  ];
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  // Advanced Features States
  const [realTimeScore, setRealTimeScore] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    improvementRate: 0,
    totalTime: 0
  });
  const [voiceAnalysis, setVoiceAnalysis] = useState({
    pace: 0,
    clarity: 0,
    fillerWords: 0,
    enthusiasm: 0
  });

  // Final Interview Score States
  const [finalScores, setFinalScores] = useState({
    communication: 85,
    skills: 92,
    confidence: 78
  });

  // ── Eye Contact Tracker States & Refs ──
  const eyeCanvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const mpCameraRef = useRef(null);
  const eyeContactFramesRef = useRef(0);
  const eyeTotalFramesRef = useRef(0);
  const eyeStatusRef = useRef("inactive");
  const eyeStreaksRef = useRef([]);
  const eyeCurrStreakRef = useRef(0);
  const eyeLastContactRef = useRef(false);
  const [eyeContactOn, setEyeContactOn] = useState(false);
  const [eyeContactStatus, setEyeContactStatus] = useState("inactive");
  const [eyeContactScore, setEyeContactScore] = useState(0);
  const [eyeContactFrames, setEyeContactFrames] = useState(0);
  const [eyeTotalFrames, setEyeTotalFrames] = useState(0);

  // Recording states
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Authentication states
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const fallbackQuestions = {
    "Resume-Based Questions": [
      "Tell me about a time when you used your resume experience to solve a difficult problem.",
      "Which resume achievement are you most proud of and why?",
      "How does your resume reflect your strongest interview skills?"
    ],
    "AI Video Interview": [
      "Describe how you would prepare for an AI-driven video interview.",
      "What makes you confident when speaking in front of a camera?",
      "How do you ensure clear communication during a virtual interview?"
    ],
    "Real-Time Feedback": [
      "How do you adapt when you receive feedback during a live interview?",
      "Explain a time when feedback helped you improve your answer instantly.",
      "What would you change in your interview style after receiving real-time feedback?"
    ],
    "Performance Analytics": [
      "How do you use analytics to track your interview preparation progress?",
      "Describe a time when metrics helped you improve your performance.",
      "What performance data do you think is most useful for interview preparation?"
    ],
    "Unlimited Practice": [
      "Why is practicing interviews repeatedly important for success?",
      "Tell me how you stay motivated to practice interview questions often.",
      "How do you adapt when practicing the same question multiple times?"
    ],
    "Smart Insights": [
      "What kind of insights do you need to improve your interview performance?",
      "Describe how AI-generated insights can make your preparation smarter.",
      "How would you use feedback insights to create a better interview strategy?"
    ],
    default: [
      "Describe a challenging project you worked on and how you solved it.",
      "Tell me about a situation where you had to solve a difficult technical problem.",
      "Explain a key achievement from your experience and why it mattered."
    ]
  };

  const getFallbackQuestion = (topic) => {
    const list = fallbackQuestions[topic] || fallbackQuestions.default;
    return list[Math.floor(Math.random() * list.length)];
  };


  useEffect(() => {
    // Load performance metrics from localStorage
    const savedMetrics = localStorage.getItem("interviewPerformance");
    if (savedMetrics) {
      setPerformanceMetrics(JSON.parse(savedMetrics));
    }

    // Load interview history from localStorage
    const savedHistory = localStorage.getItem("interviewHistory");
    if (savedHistory) {
      setInterviewHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" }, 
          audio: micEnabled 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError("");
      } catch (err) {
        setCameraError("Camera access denied. Please allow camera permission.");
      }
    };

    startCamera();

    return () => {
      // Stop eye tracker completely when leaving the page
      if (mpCameraRef.current) {
        try { mpCameraRef.current.stop(); } catch(e) {}
        mpCameraRef.current = null;
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch(e) {}
        faceMeshRef.current = null;
      }
      // Stop camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [micEnabled]);

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.lang = selectedLanguage;
    window.speechSynthesis.speak(speech);
  };

  const toggleMic = async () => {
    setMicEnabled(!micEnabled);
  };

  // Advanced Features Functions
  const calculateRealTimeScore = (answerText) => {
    if (!answerText) return 0;

    let score = 0;
    const words = answerText.split(' ').length;
    const sentences = answerText.split(/[.!?]+/).length - 1;

    // Length score (20 points)
    if (words > 50) score += 20;
    else if (words > 30) score += 15;
    else if (words > 15) score += 10;

    // Structure score (20 points)
    if (sentences >= 3) score += 20;
    else if (sentences >= 2) score += 15;
    else if (sentences >= 1) score += 10;

    // Keywords score (30 points) - Basic keyword detection
    const keywords = ['experience', 'learned', 'challenge', 'solution', 'result', 'team', 'project', 'achieved'];
    const foundKeywords = keywords.filter(keyword => answerText.toLowerCase().includes(keyword));
    score += Math.min(foundKeywords.length * 5, 30);

    // Confidence score (30 points) - Based on answer completeness
    if (answerText.length > 200) score += 30;
    else if (answerText.length > 100) score += 20;
    else if (answerText.length > 50) score += 10;

    return Math.min(score, 100);
  };

  const analyzeVoiceConfidence = (transcript) => {
    if (!transcript) return 0;

    let confidence = 50; // Base confidence

    // Length analysis
    if (transcript.length > 100) confidence += 15;
    else if (transcript.length > 50) confidence += 10;

    // Filler words detection (negative impact)
    const fillerWords = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of'];
    const fillerCount = fillerWords.reduce((count, word) =>
      count + (transcript.toLowerCase().split(word).length - 1), 0
    );
    confidence -= Math.min(fillerCount * 5, 20);

    // Positive indicators
    const positiveWords = ['definitely', 'certainly', 'absolutely', 'confident', 'sure'];
    const positiveCount = positiveWords.reduce((count, word) =>
      count + (transcript.toLowerCase().split(word).length - 1), 0
    );
    confidence += Math.min(positiveCount * 3, 15);

    return Math.max(0, Math.min(100, confidence));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        // Save recording to history (localStorage for immediate access)
        const newRecording = {
          id: Date.now(),
          url,
          timestamp: new Date().toISOString(),
          duration: recordingTime,
          topic: selectedTopic,
          question,
          answer
        };

        setInterviewHistory(prev => {
          const updated = [newRecording, ...prev].slice(0, 10); // Keep last 10
          localStorage.setItem("interviewHistory", JSON.stringify(updated));
          return updated;
        });

        // Store blob for backend upload
        recordedChunksRef.current.blob = blob;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      alert('Recording failed. Please check camera and microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      // Stop all tracks
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateAverageScore = () => {
    return Math.round(
      (finalScores.communication + finalScores.skills + finalScores.confidence) / 3
    );
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#FF5722';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const saveInterviewToBackend = async (interviewData) => {
    try {
      const formData = new FormData();

      // Add interview data
      formData.append('question', interviewData.question);
      formData.append('answer', interviewData.answer);
      formData.append('feedback', interviewData.feedback);
      formData.append('score', interviewData.score);
      formData.append('topic', interviewData.topic);
      formData.append('duration', interviewData.duration);
      formData.append('voiceAnalysis', JSON.stringify(interviewData.voiceAnalysis));
      formData.append('performanceMetrics', JSON.stringify(interviewData.performanceMetrics));

      // Add recording file if available
      if (recordedChunksRef.current.blob) {
        const recordingFile = new File([recordedChunksRef.current.blob], `interview-${Date.now()}.webm`, { type: 'video/webm' });
        formData.append('recording', recordingFile);
      }

      const token = localStorage.getItem("token");
      const response = await axios.post("/api/interview/save-recording", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (err) {
      // Don't throw error - localStorage fallback is already handled
    }
  };

  const updatePerformanceMetrics = (newScore, duration) => {
    setPerformanceMetrics(prev => {
      const newTotal = prev.totalInterviews + 1;
      const newAvg = ((prev.averageScore * prev.totalInterviews) + newScore) / newTotal;
      const newBest = Math.max(prev.bestScore, newScore);
      const improvementRate = newTotal > 1 ? ((newScore - prev.averageScore) / prev.averageScore) * 100 : 0;

      const updatedMetrics = {
        totalInterviews: newTotal,
        averageScore: Math.round(newAvg),
        bestScore: newBest,
        improvementRate: Math.round(improvementRate),
        totalTime: prev.totalTime + duration
      };

      // Save to localStorage for analytics and compatibility
      localStorage.setItem("interviewPerformance", JSON.stringify(updatedMetrics));
      localStorage.setItem("interviewAnalytics", JSON.stringify(updatedMetrics));

      return updatedMetrics;
    });
  };

  const handleStartInterview = () => {
    if (!token) {
      setStartInterviewAfterAuth(true);
      setShowAuth(true);
      return;
    }
    if (!question) {
      generate();
    }
  };

  const handleLogin = async () => {
    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all fields");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await axios.post("/api/auth/login", {
        email: authEmail, password: authPassword
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setShowAuth(false);
      setAuthError("");
      if (startInterviewAfterAuth) {
        setStartInterviewAfterAuth(false);
        generate();
      }
    } catch (err) {
      const message = err.response?.data || err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      setAuthError(typeof message === "string" ? message : "Login failed. Please check your credentials.");
    }
    setAuthLoading(false);
  };

  const handleRegister = async () => {
    if (!authName || !authEmail || !authPassword) {
      setAuthError("Please fill in all fields");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      await axios.post("/api/auth/register", {
        name: authName, email: authEmail, password: authPassword
      });
      const loginRes = await axios.post("/api/auth/login", {
        email: authEmail, password: authPassword
      });
      localStorage.setItem("token", loginRes.data.token);
      setToken(loginRes.data.token);
      setShowAuth(false);
      setAuthError("");
      if (startInterviewAfterAuth) {
        setStartInterviewAfterAuth(false);
        generate();
      }
    } catch (err) {
      const message = err.response?.data || err.response?.data?.message || err.message || "Registration failed";
      setAuthError(typeof message === "string" ? message : "Registration failed");
    }
    setAuthLoading(false);
  };

  const generate = async () => {
    setIsLoading(true);
    setUseFallback(false);
    const authToken = localStorage.getItem("token");


    if (!authToken) {
      setShowAuth(true);
      setIsLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "";
      const res = await fetch(`${API_BASE}/api/interview/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ topic: selectedTopic }),
      });


      if (!res.ok) {
        const errorText = await res.text();
        const fallback = getFallbackQuestion(selectedTopic);
        setQuestion(fallback);
        setUseFallback(true);

        if (res.status === 401) {
          setShowAuth(true);
        }

        setIsLoading(false);
        return;
      }

      const data = await res.json();

      const responseData = data;
      const questionText = typeof responseData === "string"
        ? responseData
        : responseData.question || getFallbackQuestion(selectedTopic);
      const fallbackActive = typeof responseData === "object" && responseData.fallback === true;

      if (responseData?.reason) {
      }

      setQuestion(questionText);
      setUseFallback(fallbackActive);
      speak(questionText);

      // Start recording when interview begins
      if (!isRecording) {
        startRecording();
      }
    } catch (err) {
      const fallback = getFallbackQuestion(selectedTopic);
      setQuestion(fallback);
      setUseFallback(true);

      // Start recording even with fallback
      if (!isRecording) {
        startRecording();
      }
    }
    setIsLoading(false);
  };

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = selectedLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.start();
    setIsListening(true);

    let finalTranscript = '';

    recognition.onresult = (e) => {
      let interimTranscript = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript + interimTranscript;
      setAnswer(currentTranscript);

      // Real-time analysis
      if (currentTranscript.length > 10) {
        const score = calculateRealTimeScore(currentTranscript);
        const confidence = analyzeVoiceConfidence(currentTranscript);

        setRealTimeScore(score);
        setConfidenceLevel(confidence);

        // Voice analysis
        const words = currentTranscript.split(' ').length;
        const timeElapsed = recordingTime || 1;
        const wordsPerMinute = (words / timeElapsed) * 60;

        setVoiceAnalysis({
          pace: Math.min(Math.max(wordsPerMinute / 2, 0), 100), // Normalize to 0-100
          clarity: score, // Use score as clarity indicator
          fillerWords: Math.min(currentTranscript.toLowerCase().split(/\b(um|uh|like|you know|sort of|kind of)\b/).length - 1, 10) * 10,
          enthusiasm: confidence
        });
      }
    };

    recognition.onerror = (err) => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const submit = async () => {
    if (!question || !answer) {
      alert("Please generate a question and provide an answer");
      return;
    }
    setIsLoading(true);

    // Stop recording
    stopRecording();

    // Calculate final scores
    const finalScore = calculateRealTimeScore(answer);
    const finalConfidence = analyzeVoiceConfidence(answer);

    try {
      const res = await axios.post("/api/interview/evaluate", {
        question,
        answer,
        score: finalScore,
        confidence: finalConfidence,
        duration: recordingTime,
        voiceAnalysis
      }, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setFeedback(res.data.feedback || res.data);

      // Update performance metrics
      updatePerformanceMetrics(finalScore, recordingTime);

      // Save complete interview data to backend
      const interviewData = {
        question,
        answer,
        feedback: res.data.feedback || res.data,
        score: finalScore,
        topic: selectedTopic,
        duration: recordingTime,
        voiceAnalysis,
        performanceMetrics: {
          communication: finalScores.communication,
          skills: finalScores.skills,
          confidence: finalScores.confidence
        }
      };

      await saveInterviewToBackend(interviewData);

    } catch (err) {
      setFeedback(`Your answer scored ${finalScore}/100 with ${finalConfidence}% confidence. Great job! Keep practicing to improve your interview skills.`);

      // Update performance metrics even with fallback
      updatePerformanceMetrics(finalScore, recordingTime);

      // Still try to save to backend even with evaluation error
      const interviewData = {
        question,
        answer,
        feedback: `Your answer scored ${finalScore}/100 with ${finalConfidence}% confidence. Great job! Keep practicing to improve your interview skills.`,
        score: finalScore,
        topic: selectedTopic,
        duration: recordingTime,
        voiceAnalysis,
        performanceMetrics: {
          communication: finalScores.communication,
          skills: finalScores.skills,
          confidence: finalScores.confidence
        }
      };

      await saveInterviewToBackend(interviewData);
    }

    setIsLoading(false);
  };

  // ── Eye Contact Tracker Functions ──
  const loadMediaPipeScripts = () => {
    return new Promise((resolve) => {
      if (window._mpLoaded) { resolve(); return; }
      let loaded = 0;
      const scripts = [
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      ];
      scripts.forEach(src => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => { loaded++; if (loaded === scripts.length) { window._mpLoaded = true; resolve(); } };
        s.onerror = () => { loaded++; if (loaded === scripts.length) resolve(); };
        document.head.appendChild(s);
      });
    });
  };

  const handleEyeFaceResults = (results) => {
    const video = videoRef.current;
    const canvas = eyeCanvasRef.current;
    // Agar video ya canvas exist nahi — silently return (page unmount ho chuka)
    if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    eyeTotalFramesRef.current++;
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      if (eyeLastContactRef.current && eyeCurrStreakRef.current > 0) {
        eyeStreaksRef.current.push(eyeCurrStreakRef.current);
        eyeCurrStreakRef.current = 0;
      }
      eyeLastContactRef.current = false;
      eyeStatusRef.current = "noface";
      setEyeContactStatus("noface");
      setEyeContactScore(Math.round((eyeContactFramesRef.current / Math.max(eyeTotalFramesRef.current, 1)) * 100));
      setEyeTotalFrames(eyeTotalFramesRef.current);
      return;
    }
    const lm = results.multiFaceLandmarks[0];
    const irisIndices = [474,475,476,477,469,470,471,472];
    const isGoodNow = eyeStatusRef.current === "good";
    irisIndices.forEach(i => {
      const p = lm[i];
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isGoodNow ? "rgba(76,175,80,0.95)" : "rgba(255,87,34,0.95)";
      ctx.fill();
    });
    function irisRatio(irisIdx, cornerIdx) {
      const cx = irisIdx.reduce((s, i) => s + lm[i].x, 0) / irisIdx.length;
      const lx = lm[cornerIdx[0]].x, rx = lm[cornerIdx[1]].x;
      const ew = rx - lx;
      if (Math.abs(ew) < 0.001) return 0.5;
      return (cx - lx) / ew;
    }
    const lr = irisRatio([474,475,476,477], [362,263]);
    const rr = irisRatio([469,470,471,472], [33,133]);
    const avg = (lr + rr) / 2;
    const nose = lm[1], chin = lm[152], forehead = lm[10];
    const pitch = (nose.y - forehead.y) / ((chin.y - forehead.y) || 0.001);
    const vertOk = pitch >= 0.40 && pitch <= 0.68;
    const horizOk = avg >= 0.33 && avg <= 0.67;
    const isContact = horizOk && vertOk;
    if (isContact) {
      eyeContactFramesRef.current++;
      eyeCurrStreakRef.current++;
      eyeStatusRef.current = "good";
      eyeLastContactRef.current = true;
    } else {
      if (eyeLastContactRef.current && eyeCurrStreakRef.current > 0) {
        eyeStreaksRef.current.push(eyeCurrStreakRef.current);
        eyeCurrStreakRef.current = 0;
      }
      eyeStatusRef.current = "away";
      eyeLastContactRef.current = false;
    }
    setEyeContactStatus(eyeStatusRef.current);
    setEyeContactScore(Math.round((eyeContactFramesRef.current / Math.max(eyeTotalFramesRef.current, 1)) * 100));
    setEyeContactFrames(eyeContactFramesRef.current);
    setEyeTotalFrames(eyeTotalFramesRef.current);
  };

  const startEyeTracker = async () => {
    setEyeContactStatus("noface");
    await loadMediaPipeScripts();
    await new Promise(r => setTimeout(r, 800));
    if (!window.FaceMesh) { alert("MediaPipe load nahi hua. Internet check karein."); return; }
    eyeContactFramesRef.current = 0;
    eyeTotalFramesRef.current = 0;
    eyeStreaksRef.current = [];
    eyeCurrStreakRef.current = 0;
    eyeLastContactRef.current = false;
    setEyeContactScore(0);
    setEyeContactFrames(0);
    setEyeTotalFrames(0);
    const fm = new window.FaceMesh({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
    fm.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    fm.onResults(handleEyeFaceResults);
    faceMeshRef.current = fm;
    if (window.Camera && videoRef.current) {
      // Video element ready hone ka wait karo
      await new Promise(r => {
        if (videoRef.current && videoRef.current.videoWidth > 0) { r(); return; }
        const check = setInterval(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0) { clearInterval(check); r(); }
        }, 100);
        setTimeout(() => { clearInterval(check); r(); }, 3000); // 3s timeout
      });
      if (!videoRef.current) return; // Page unmount check
      const mpCam = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640, height: 480
      });
      mpCam.start();
      mpCameraRef.current = mpCam;
    }
    setEyeContactOn(true);
  };

  const stopEyeTracker = () => {
    if (mpCameraRef.current) { try { mpCameraRef.current.stop(); } catch(e){} mpCameraRef.current = null; }
    if (faceMeshRef.current) { try { faceMeshRef.current.close(); } catch(e){} faceMeshRef.current = null; }
    if (eyeCanvasRef.current) {
      const ctx = eyeCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, eyeCanvasRef.current.width, eyeCanvasRef.current.height);
    }
    setEyeContactOn(false);
    setEyeContactStatus("inactive");
  };

  const getEyeStatusConfig = () => {
    switch (eyeContactStatus) {
      case "good":    return { label: "✅ Eye Contact Acha Hai!", bg: "linear-gradient(135deg,#1b5e20,#2e7d32)", color: "#a5d6a7", pulse: "#4CAF50" };
      case "away":    return { label: "👆 Camera Dekho — Interviewer Ko Dekho!", bg: "linear-gradient(135deg,#b71c1c,#c62828)", color: "#ef9a9a", pulse: "#f44336" };
      case "noface":  return { label: "🔍 Chehra Frame Mein Laao", bg: "linear-gradient(135deg,#4a148c,#6a1b9a)", color: "#ce93d8", pulse: "#9C27B0" };
      default:        return { label: "Eye Tracker — Start Karen", bg: "linear-gradient(135deg,#263238,#37474f)", color: "#b0bec5", pulse: "#607d8b" };
    }
  };

  return (
    <div className="interview-container">
      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 5px 0" }}>🎤 Interview Practice</h2>
        <p style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}>📚 Topic: {selectedTopic}</p>
      </div>
      {/* ── Language Selector + Start Interview ── */}
      <div style={{ marginBottom: '24px', padding: '20px 24px', background: 'rgba(255,255,255,0.04)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.09)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>

          {/* Language Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              🌐 Interview Language
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedLanguage}
                onChange={e => {
                  setSelectedLanguage(e.target.value);
                  localStorage.setItem("interviewLanguage", e.target.value);
                }}
                style={{
                  padding: '12px 42px 12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(102,126,234,0.45)',
                  background: 'rgba(102,126,234,0.12)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  minWidth: '210px',
                  transition: 'border-color 0.2s',
                }}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} style={{ background: '#1a1a2e', color: 'white' }}>
                    {lang.flag}  {lang.label}
                  </option>
                ))}
              </select>
              {/* Custom arrow */}
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>▼</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
              Voice recognition &amp; TTS language
            </span>
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, height: 56, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />

          {/* Start Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              🎤 Start Session
            </label>
            <button
              onClick={handleStartInterview}
              className="btn-primary"
              style={{ minWidth: '200px', fontSize: '16px', padding: '12px 28px' }}
            >
              ▶️ Start Interview
            </button>
          </div>

        </div>

        {/* Info messages */}
        {!token && (
          <div style={{ marginTop: 14, color: '#ffd369', fontWeight: '600', fontSize: 14 }}>
            ⚠️ Please sign in or sign up to start the interview.
          </div>
        )}
        {token && !question && (
          <div style={{ marginTop: 14, color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            Select your language and click Start Interview to begin.
          </div>
        )}
      </div>

      {/* Advanced Features Dashboard */}
      {question && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Real-time Score */}
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Real-time Score</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{realTimeScore}/100</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {realTimeScore >= 80 ? 'Excellent!' : realTimeScore >= 60 ? 'Good!' : 'Keep improving!'}
            </div>
          </div>

          {/* Confidence Level */}
          <div style={{
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Confidence Level</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{confidenceLevel}%</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {confidenceLevel >= 70 ? 'Very Confident' : confidenceLevel >= 50 ? 'Confident' : 'Building confidence'}
            </div>
          </div>

          {/* Recording Status */}
          <div style={{
            background: isRecording ? 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)' : 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Recording</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {isRecording ? '🔴' : '⏸️'} {formatTime(recordingTime)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {isRecording ? 'Active' : 'Paused'}
            </div>
          </div>

          {/* Voice Analysis */}
          <div style={{
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Voice Analysis</h4>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Pace: {Math.round(voiceAnalysis.pace)}%
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              Fillers: {voiceAnalysis.fillerWords}/100
            </div>
          </div>
        </div>
      )}

      {/* Final Interview Score Section */}
      {question && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            color: 'white',
            margin: '0 0 28px 0',
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span>📈</span> Final Interview Score
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center'
          }}>
            {/* Circular Average Score */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gridColumn: 'auto'
            }}>
              <div style={{
                position: 'relative',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: `conic-gradient(#667eea 0deg, #667eea ${calculateAverageScore() * 3.6}deg, rgba(255,255,255,0.1) ${calculateAverageScore() * 3.6}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3), inset 0 0 20px rgba(0,0,0,0.3)',
                animation: 'pulse 2s infinite'
              }}>
                <style>{`
                  @keyframes pulse {
                    0% { box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3), inset 0 0 20px rgba(0,0,0,0.3), 0 0 30px rgba(102, 126, 234, 0.5); }
                    50% { box-shadow: 0 20px 60px rgba(102, 126, 234, 0.5), inset 0 0 20px rgba(0,0,0,0.3), 0 0 50px rgba(102, 126, 234, 0.7); }
                    100% { box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3), inset 0 0 20px rgba(0,0,0,0.3), 0 0 30px rgba(102, 126, 234, 0.5); }
                  }
                `}</style>
                <div style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(40, 40, 60, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '900',
                    color: '#667eea',
                    lineHeight: '1'
                  }}>
                    {calculateAverageScore()}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: '8px',
                    letterSpacing: '0.5px'
                  }}>
                    Average Score
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#667eea',
                    marginTop: '4px',
                    fontWeight: '600'
                  }}>
                    {getScoreLabel(calculateAverageScore())}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '16px',
              gridColumn: 'auto'
            }}>
              {/* Communication Score */}
              <div style={{
                background: 'rgba(76, 175, 80, 0.15)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px' }}>💬</span>
                    <span style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>Communication</span>
                  </div>
                  <div style={{
                    color: '#4CAF50',
                    fontWeight: '700',
                    fontSize: '18px'
                  }}>
                    {finalScores.communication}%
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${finalScores.communication}%`,
                    background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Skills Score */}
              <div style={{
                background: 'rgba(33, 150, 243, 0.15)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px' }}>⚡</span>
                    <span style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>Technical Skills</span>
                  </div>
                  <div style={{
                    color: '#2196F3',
                    fontWeight: '700',
                    fontSize: '18px'
                  }}>
                    {finalScores.skills}%
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${finalScores.skills}%`,
                    background: 'linear-gradient(90deg, #2196F3 0%, #64B5F6 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Confidence Score */}
              <div style={{
                background: 'rgba(156, 39, 176, 0.15)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px' }}>🎯</span>
                    <span style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>Confidence</span>
                  </div>
                  <div style={{
                    color: '#9C27B0',
                    fontWeight: '700',
                    fontSize: '18px'
                  }}>
                    {finalScores.confidence}%
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${finalScores.confidence}%`,
                    background: 'linear-gradient(90deg, #9C27B0 0%, #CE93D8 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performanceMetrics.totalInterviews > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: 'white', margin: '0', fontSize: '18px' }}>📊 Performance Overview</h3>
              <button
                onClick={() => navigate('/analytics')}
                style={{
                  background: 'rgba(255, 140, 0, 0.2)',
                  border: '1px solid #ff8c00',
                  color: '#ff8c00',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📈 View Full Analytics
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff8c00' }}>{performanceMetrics.totalInterviews}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Total Interviews</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{performanceMetrics.averageScore}%</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Average Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{performanceMetrics.bestScore}%</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Best Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: performanceMetrics.improvementRate >= 0 ? '#4CAF50' : '#FF5722' }}>
                  {performanceMetrics.improvementRate > 0 ? '+' : ''}{performanceMetrics.improvementRate}%
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Improvement</div>
              </div>
            </div>
          </div>
        )}
  

      {/* Interview History */}
      {interviewHistory.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '18px' }}>📹 Recent Recordings</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {interviewHistory.slice(0, 3).map((recording) => (
              <div key={recording.id} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                    {recording.topic} - {formatTime(recording.duration)}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                    {new Date(recording.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => window.open(recording.url, '_blank')}
                  style={{
                    background: 'rgba(255, 140, 0, 0.2)',
                    border: '1px solid #ff8c00',
                    color: '#ff8c00',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ▶️ Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuth && (
        <div className="auth-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="auth-modal" style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '24px' }}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>
                {authMode === 'login' ? 'Welcome back to AI Interview' : 'Join AI Interview Platform'}
              </p>
            </div>

            {authError && (
              <div style={{
                background: 'rgba(255,59,48,0.1)',
                border: '1px solid rgba(255,59,48,0.3)',
                color: '#ff6b6b',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {authError}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              {authMode === 'register' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: 'white', display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'white', display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                disabled={authLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(90deg, #ff8c00, #ffa500)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#090b13',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  opacity: authLoading ? 0.7 : 1
                }}
              >
                {authLoading ? '⏳ Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff8c00',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowAuth(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="interview-content">
        {/* Video Section */}
        <div className="video-section">
          <div className="video-wrapper">
            {cameraError ? (
              <div className="camera-error">
                <p>📷 {cameraError}</p>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted
                  className="video-feed"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {/* Eye Contact Canvas Overlay */}
                <canvas
                  ref={eyeCanvasRef}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    pointerEvents: 'none',
                    transform: 'scaleX(-1)',
                    zIndex: 2
                  }}
                />
                {/* Eye Contact Status Badge on video */}
                {eyeContactOn && (
                  <div style={{
                    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: eyeContactStatus === 'good' ? 'rgba(27,94,32,0.88)' : eyeContactStatus === 'away' ? 'rgba(183,28,28,0.88)' : 'rgba(74,20,140,0.88)',
                    color: 'white', padding: '5px 14px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
                    zIndex: 3, backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'background 0.3s'
                  }}>
                    {eyeContactStatus === 'good' ? '👁️ Eye Contact ✓' : eyeContactStatus === 'away' ? '↗ Camera Dekho' : '🔍 Chehra Dikhaao'}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="video-indicator">
            <span className="recording-dot"></span>
            Camera Active
            <button 
              onClick={toggleMic}
              className={`mic-toggle ${micEnabled ? 'enabled' : 'disabled'}`}
            >
              {micEnabled ? '🎤 Mic On' : '🔇 Mic Off'}
            </button>
          </div>

          {/* ── Eye Contact Tracker Panel ── */}
          <div style={{
            background: 'linear-gradient(135deg,#0d1117,#161b22)',
            padding: '16px 18px',
            borderTop: '2px solid rgba(102,126,234,0.4)'
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👁️</span>
                <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Eye Contact Tracker</span>
                {eyeContactOn && (
                  <span style={{
                    background: 'rgba(76,175,80,0.2)', border: '1px solid #4CAF50',
                    color: '#81C784', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700'
                  }}>LIVE</span>
                )}
              </div>
              <button
                onClick={eyeContactOn ? stopEyeTracker : startEyeTracker}
                style={{
                  padding: '7px 16px',
                  background: eyeContactOn ? 'rgba(244,67,54,0.15)' : 'rgba(102,126,234,0.15)',
                  border: `1px solid ${eyeContactOn ? '#f44336' : '#667eea'}`,
                  color: eyeContactOn ? '#ef9a9a' : '#9fa8da',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                }}
              >
                {eyeContactOn ? '⏹ Band Karo' : '▶ Start Karo'}
              </button>
            </div>

            {/* Status banner */}
            {eyeContactOn && (
              <>
                <div style={{
                  background: getEyeStatusConfig().bg,
                  borderRadius: '10px', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '12px',
                  border: `1px solid ${getEyeStatusConfig().pulse}40`,
                  animation: eyeContactStatus === 'away' ? 'eyePulse 1.2s infinite' : 'none'
                }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: getEyeStatusConfig().pulse,
                    boxShadow: `0 0 8px ${getEyeStatusConfig().pulse}`,
                    flexShrink: 0
                  }} />
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>
                    {getEyeStatusConfig().label}
                  </span>
                </div>

                {/* Score bar */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Eye Contact Score</span>
                    <span style={{
                      color: eyeContactScore >= 60 ? '#4CAF50' : eyeContactScore >= 35 ? '#FFC107' : '#f44336',
                      fontSize: '12px', fontWeight: '700'
                    }}>{eyeContactScore}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${eyeContactScore}%`,
                      background: eyeContactScore >= 60 ? 'linear-gradient(90deg,#4CAF50,#81C784)' : eyeContactScore >= 35 ? 'linear-gradient(90deg,#FFC107,#FFD54F)' : 'linear-gradient(90deg,#f44336,#ef9a9a)',
                      borderRadius: '3px', transition: 'width 0.5s, background 0.5s'
                    }} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#4CAF50' }}>{eyeContactFrames}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Contact Frames</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#2196F3' }}>{eyeTotalFrames - eyeContactFrames}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Away Frames</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#FF9800' }}>{eyeStreaksRef.current.length}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Contact Streaks</div>
                  </div>
                </div>

                {/* Tip */}
                <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${getEyeStatusConfig().pulse}` }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
                    💡 {eyeContactStatus === 'good' ? 'Shabash! Real interview mein bhi aise hi camera dekho.' : eyeContactStatus === 'away' ? 'Tip: Screen ke upar camera lens ko apni aankhon se directly dekho.' : 'Camera ke saamne seedha baitho taaki chehra detect ho sake.'}
                  </span>
                </div>
              </>
            )}

            {!eyeContactOn && (
              <div style={{ textAlign: 'center', padding: '10px 0', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                Camera se real-time detect hoga ki aap interviewer ko dekh rahe ho ya nahi
              </div>
            )}
          </div>
          <style>{`@keyframes eyePulse { 0%,100%{opacity:1} 50%{opacity:0.7} }`}</style>
        </div>

        {/* Question Section */}
        <div className="question-section">
          <div className="question-header">
            <div className="question-title-group">
              <h2>AI Interview Challenge</h2>
              <p className="question-subtitle">
                Generate a smart, topic-targeted question and practice your response with live audio recording.
              </p>
            </div>
            <span className={`question-status ${useFallback ? 'status-offline' : 'status-online'}`}>
              {useFallback ? 'Offline fallback active' : 'Live AI engine ready'}
            </span>
          </div>

          <div className="question-meta">
            <span className="question-topic">Topic: <strong>{selectedTopic}</strong></span>
            <span>{question ? 'You can answer the question below.' : 'Ready when you are.'}</span>
          </div>

          {question ? (
            <div className="question-box">
              <p className="question-text">{question}</p>
            </div>
          ) : (
            <div className="question-placeholder">
              <p>Press the button to generate a unique, interview-ready question.</p>
            </div>
          )}

          <button 
            onClick={generate} 
            disabled={isLoading}
            className={`btn-primary ${isLoading ? 'disabled' : ''}`}
          >
            {isLoading ? '⏳ Generating...' : '🎯 Generate Smart Question'}
          </button>

          {useFallback && (
            <p className="fallback-note">
              🔄 Using local question pool - Backend connection issue detected.
            </p>
          )}
        </div>

        {/* Answer Section */}
        <div className="answer-section">
          <div className="answer-header">
            <h2>Your Answer</h2>
            <span className="answer-icon">🎤</span>
          </div>

          <textarea 
            value={answer}
            onChange={e => setAnswer(e.target.value)} 
            placeholder="Your answer will appear here or type manually..."
            className="answer-textarea"
          />

          <div className="button-group">
            <button 
              onClick={startListening} 
              disabled={isListening || isLoading}
              className={`btn-secondary ${isListening ? 'active' : ''}`}
            >
              {isListening ? '🔴 Listening...' : '🎤 Start Listening'}
            </button>
            <button 
              onClick={submit}
              disabled={isLoading || !question || !answer}
              className={`btn-success ${isLoading ? 'disabled' : ''}`}
            >
              {isLoading ? '⏳ Submitting...' : '✅ Submit Answer'}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {feedback && (
        <div className="feedback-section">
          <div className="feedback-header">
            <h3>Feedback</h3>
            <span className="feedback-icon">💡</span>
          </div>
          <div className="feedback-content">
            <p>{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}