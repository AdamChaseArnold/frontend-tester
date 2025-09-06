import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { validateUrl, validateBrowserSelection, formatError } from '../utils/validation';

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
          const errorMessage = error.response?.data?.error || formatError(error);
          setMessage(`>> STATUS POLL FAILED: ${errorMessage}`);
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
    
    // Validate URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      setMessage(`>> ERROR: ${urlValidation.error}`);
      return;
    }

    // Validate browser selection
    const browserValidation = validateBrowserSelection(browsers);
    if (!browserValidation.valid) {
      setMessage(`>> ERROR: ${browserValidation.error}`);
      return;
    }

    setIsRunning(true);
    setMessage('>> INITIATING NEURAL PROBE SEQUENCE...');
    setProgress(0);
    setStatus('Initializing...');

    try {
      const response = await axios.post('/api/run-tests', { 
        url: urlValidation.url, 
        browsers: browserValidation.browsers 
      });
      
      if (response.data && response.data.testId) {
        setTestId(response.data.testId);
        setMessage('>> NEURAL PROBE INITIATED - MATRIX INFILTRATION IN PROGRESS');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error starting tests:', error);
      const errorMessage = error.response?.data?.error || formatError(error);
      setMessage(`>> INITIATION FAILED: ${errorMessage}`);
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
      const errorMessage = error.response?.data?.error || formatError(error);
      setMessage(`>> TERMINATION FAILED: ${errorMessage}`);
    }
  };

  return (
    <div className="cyber-panel cyber-fade-in test-form-container">
      <h1 className="cyber-heading cyber-glow-cyan test-form-title">
        SYSTEM ANALYZER
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            >> TARGET URL:
          </label>
          <div className="custom-dropdown">
            <div
              onClick={() => !isRunning && setShowDropdown(!showDropdown)}
              className={`dropdown-trigger ${isRunning ? 'disabled' : ''}`}
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
              <div className="dropdown-menu">
                {urlOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setUrl(option);
                      setShowDropdown(false);
                    }}
                    className={`dropdown-item ${url === option ? 'selected' : ''}`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Browser Selection */}
        <div className="form-group">
          <label className="form-label">
            >> BROWSER AGENTS:
          </label>
          <div className="browser-selection">
            {Object.entries(browsers).map(([browser, checked]) => (
              <label key={browser} className={`browser-checkbox ${isRunning ? 'disabled' : ''}`}>
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
          <div className="browser-count">
            Selected: {Object.values(browsers).filter(Boolean).length} browser(s)
          </div>
        </div>

        {/* Status Bar */}
        {isRunning && (
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-label">
                >> SCAN PROGRESS: {progress}%
              </span>
              <span className="progress-status">
                {status}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-message">
              {progress === 100 ? '>> NEURAL PROBE COMPLETE - REDIRECTING...' : '>> INFILTRATING TARGET MATRIX...'}
            </div>
          </div>
        )}

        <div className="button-group">
          <button 
            type="submit" 
            disabled={isRunning}
            className={`cyber-button button-primary ${isRunning ? '' : ''}`}
          >
            {isRunning ? 'EXECUTING...' : 'INITIATE SCAN'}
          </button>
          
          {isRunning && (
            <button 
              type="button"
              onClick={handleCancel}
              className="cyber-button cyber-button-secondary button-secondary"
            >
              ABORT
            </button>
          )}
        </div>
      </form>

      {message && (
        <div className="cyber-panel message-panel">
          {message}
        </div>
      )}
    </div>
  );
};

export default TestForm;
