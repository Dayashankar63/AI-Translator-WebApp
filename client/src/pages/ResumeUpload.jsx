import { useState } from "react";
import axios from "../api";

export default function ResumeUpload() {
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);


  const upload = async () => {
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploading(true);
      const res = await axios.post("/api/interview/resume", formData, {
        headers: { Authorization: token }
      });
      setQuestions(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data ?? err.message);
      setQuestions("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#090b13'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          📄
        </div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white'
        }}>
          Upload Your Resume
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          Upload your resume and our AI will analyze your skills, experience, and background to create personalized interview questions tailored just for you.
        </p>

        <label style={{
          display: 'inline-block',
          marginBottom: '20px',
          cursor: 'pointer'
        }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={e => {
              setFile(e.target.files[0]);
              setError("");
            }}
            style={{display: 'none'}}
            id="file-upload"
          />
          <div style={{
            display: 'inline-block',
            padding: '20px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: '2px dashed #007bff',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: '300px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #e1e5e9 0%, #a8b6c8 100%)';
            e.currentTarget.style.borderColor = '#0056b3';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
            e.currentTarget.style.borderColor = '#007bff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
          >
            📁 Choose Resume File
          </div>
        </label>

        {file && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 20px',
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '8px',
            color: '#4CAF50',
            fontWeight: '600'
          }}>
            ✅ Selected: {file.name}
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 20px',
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '8px',
            color: '#f44336',
            fontWeight: '600'
          }}>
            ❌ {error}
          </div>
        )}

        <button
          onClick={upload}
          disabled={!file || uploading}
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            background: uploading ? '#666' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: uploading ? 'none' : '0 4px 6px rgba(0, 123, 255, 0.3)',
            marginTop: '20px',
            opacity: uploading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0056b3 0%, #004085 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 123, 255, 0.3)';
            }
          }}
        >
          {uploading ? '⏳ Analyzing Resume...' : '🚀 Analyze Resume'}
        </button>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0',
            lineHeight: '1.5'
          }}>
            <strong>Supported formats:</strong> PDF (.pdf), Word (.docx, .doc)<br/>
            <strong>Max file size:</strong> 10MB<br/>
            <strong>Analysis time:</strong> ~30 seconds
          </p>
        </div>
      </div>

      {questions && (
        <div style={{
          maxWidth: '800px',
          width: '100%',
          marginTop: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white'
        }}>
          <h3 style={{
            fontWeight: 'bold',
            marginBottom: '16px',
            fontSize: '24px',
            textAlign: 'center'
          }}>
            🎯 Resume Analysis Complete!
          </h3>
          <p style={{
            fontSize: '18px',
            marginBottom: '24px',
            textAlign: 'center',
            opacity: 0.9
          }}>
            Based on your resume, here are personalized interview questions tailored to your experience:
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '32px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '16px',
              lineHeight: '1.6',
              color: 'white',
              margin: 0
            }}>
              {questions}
            </pre>
          </div>

          <div style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{
              fontSize: '18px',
              marginBottom: '24px',
              opacity: 0.9
            }}>
              Ready to practice? Start your AI interview now!
            </p>
            <button
              onClick={() => window.location.href = '/interview'}
              style={{
                padding: '16px 32px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(76, 175, 80, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#45a049';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(76, 175, 80, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4CAF50';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(76, 175, 80, 0.3)';
              }}
            >
              🎤 Start AI Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}