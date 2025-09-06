import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * TestForm Component - Main interface for initiating cyberpunk-themed e2e tests
 * Features: URL input, browser selection, progress tracking, and test execution
 */

const TestForm = () => {
  const [url, setUrl] = useState('https://zoomwarriors.com');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.custom-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [testId, setTestId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [browsers, setBrowsers] = useState({
    chromium: true,
    firefox: true,
    webkit: true
  });
  const navigate = useNavigate();

  const urlOptions = [
    'https://zoomwarriors.com'
  ];

  // Poll test status with automatic cleanup
  useEffect(() => {
    let interval;
    if (testId && isRunning) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/test-status/${testId}`);
          setProgress(response.data.progress);
          setStatus(response.data.status);
          
          if (response.data.completed) {
            setIsRunning(false);
            clearInterval(interval);
            
            // Only redirect if test completed successfully, not if cancelled
            if (response.data.status !== 'Cancelled') {
              setMessage('>> NEURAL PROBE COMPLETE - REDIRECTING...');
              navigate(`/status/${testId}`);
            } else {
              setMessage('>> NEURAL PROBE TERMINATED - SYSTEM READY');
              setTestId(null);
              setProgress(0);
              setStatus('');
            }
          }
        } catch (error) {
          console.error('Error polling status:', error);
          setIsRunning(false);
          clearInterval(interval);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testId, isRunning, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setMessage('Please select a valid URL');
      return;
    }

    setIsRunning(true);
    setMessage('Starting tests...');
    setProgress(0);
    setStatus('Initializing...');

    // Get selected browsers
    const selectedBrowsers = Object.keys(browsers).filter(browser => browsers[browser]);
    
    if (selectedBrowsers.length === 0) {
      setMessage('Please select at least one browser to test');
      setIsRunning(false);
      return;
    }

    try {
      const response = await axios.post('/api/run-tests', { 
        url, 
        browsers: selectedBrowsers 
      });
      setTestId(response.data.testId);
      setMessage('Test started successfully!');
    } catch (error) {
      console.error('Error starting tests:', error);
      setMessage('Failed to start tests');
      setIsRunning(false);
    }
  };

  const handleCancel = async () => {
    if (!testId) return;

    try {
      await axios.post(`/api/cancel-test/${testId}`);
      setIsRunning(false);
      setMessage('>> NEURAL PROBE TERMINATED - SYSTEM READY');
      setProgress(0);
      setStatus('');
      setTestId(null);
    } catch (error) {
      console.error('Error cancelling test:', error);
      setMessage('>> TERMINATION FAILED - SYSTEM ERROR');
    }
  };

  return (
    <div className="cyber-panel cyber-fade-in" style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '30px'
    }}>
      <h1 className="cyber-heading cyber-glow-cyan" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2.5rem' }}>
        SYSTEM ANALYZER
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#00ffff',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            >> TARGET URL:
          </label>
          <div className="custom-dropdown" style={{ position: 'relative' }}>
            <div
              onClick={() => !isRunning && setShowDropdown(!showDropdown)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #00ffff',
                color: '#f0f0f0',
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '14px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 5px rgba(0, 255, 255, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '20px'
              }}
            >
              <span>{url || 'Select URL...'}</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 20 20" 
                fill="none"
                style={{
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path 
                  stroke="#00ffff" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="m6 8 4 4 4-4"
                />
              </svg>
            </div>
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#1a1a1a',
                border: '1px solid #00ffff',
                borderTop: 'none',
                boxShadow: '0 4px 8px rgba(0, 255, 255, 0.2)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {urlOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setUrl(option);
                      setShowDropdown(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      color: '#f0f0f0',
                      fontFamily: 'Roboto Mono, monospace',
                      fontSize: '14px',
                      cursor: 'pointer',
                      backgroundColor: url === option ? '#0a0a0a' : '#1a1a1a',
                      borderBottom: index < urlOptions.length - 1 ? '1px solid #333' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2a2a2a';
                      e.target.style.color = '#00ffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = url === option ? '#0a0a0a' : '#1a1a1a';
                      e.target.style.color = '#f0f0f0';
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Browser Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '16px', 
            fontWeight: '500',
            color: '#00ffff',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            >> BROWSER AGENTS:
          </label>
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            flexWrap: 'wrap',
            padding: '10px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #ff00ff',
            boxShadow: '0 0 5px #ff00ff',
            borderRadius: '0'
          }}>
            {Object.entries(browsers).map(([browser, checked]) => (
              <label key={browser} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.6 : 1,
                color: '#f0f0f0',
                fontFamily: 'Roboto Mono, monospace'
              }}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isRunning}
                  onChange={(e) => setBrowsers(prev => ({
                    ...prev,
                    [browser]: e.target.checked
                  }))}
                  style={{ cursor: isRunning ? 'not-allowed' : 'pointer' }}
                />
                <span style={{ 
                  fontSize: '14px',
                  textTransform: 'capitalize',
                  fontWeight: checked ? '500' : 'normal'
                }}>
                  {browser === 'webkit' ? 'Safari (WebKit)' : browser}
                </span>
              </label>
            ))}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '4px' 
          }}>
            Selected: {Object.values(browsers).filter(Boolean).length} browser(s)
          </div>
        </div>

        {/* Status Bar */}
        {isRunning && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span className="cyber-text" style={{ fontSize: '14px', fontWeight: '500', color: '#00ffff', fontFamily: 'Orbitron, sans-serif' }}>
                >> SCAN PROGRESS: {progress}%
              </span>
              <span className="cyber-text" style={{ fontSize: '12px', color: '#f0f0f0' }}>
                {status}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #00ffff',
              borderRadius: '0',
              overflow: 'hidden',
              boxShadow: '0 0 5px rgba(0, 255, 255, 0.3)'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#00ffff',
                transition: 'width 0.3s ease',
                borderRadius: '0',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }} />
            </div>
            <div className="cyber-text" style={{ 
              fontSize: '12px', 
              color: '#00ffff', 
              marginTop: '4px',
              textAlign: 'center',
              fontFamily: 'Roboto Mono, monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {progress === 100 ? '>> NEURAL PROBE COMPLETE - REDIRECTING...' : '>> INFILTRATING TARGET MATRIX...'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={isRunning}
            className={`cyber-button ${isRunning ? '' : ''}`}
            style={{
              flex: 1,
              fontSize: '16px'
            }}
          >
            {isRunning ? 'EXECUTING...' : 'INITIATE SCAN'}
          </button>
          
          {isRunning && (
            <button 
              type="button"
              onClick={handleCancel}
              className="cyber-button cyber-button-secondary"
              style={{
                flex: '0 0 auto',
                fontSize: '16px'
              }}
            >
              ABORT
            </button>
          )}
        </div>
      </form>

      {message && (
        <div className="cyber-panel" style={{ 
          marginTop: '20px', 
          padding: '15px',
          textAlign: 'center',
          color: '#f0f0f0',
          fontFamily: 'Roboto Mono, monospace'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TestForm;
