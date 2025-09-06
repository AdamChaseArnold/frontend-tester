import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * StatusPage Component - Displays cyberpunk-themed test results
 * Shows scan summary, detailed test results, and execution metrics
 */

const StatusPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`/api/test-results/${testId}`);
        setResults(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to load test results');
        setLoading(false);
      }
    };

    if (testId) {
      fetchResults();
    } else {
      setError('No test ID provided');
      setLoading(false);
    }
  }, [testId]);

  const handleRunNewTest = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="cyber-panel cyber-fade-in" style={{
        maxWidth: '800px',
        margin: '50px auto',
        padding: '30px',
        textAlign: 'center'
      }}>
        <h1 className="cyber-heading cyber-glow-cyan" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>RETRIEVING DATA...</h1>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #1a1a1a',
          borderTop: '3px solid #00ffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
        }} />
        <p className="cyber-text" style={{ color: '#00ffff', marginTop: '20px' }}>
          >> ACCESSING NEURAL PROBE RESULTS...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-panel cyber-fade-in" style={{ 
        maxWidth: '800px', 
        margin: '50px auto', 
        padding: '30px',
        textAlign: 'center'
      }}>
        <h1 className="cyber-heading cyber-glow-secondary" style={{ fontSize: '2.5rem' }}>SYSTEM ERROR</h1>
        <p className="cyber-text" style={{ color: '#ff00ff' }}>>> {error}</p>
        <button
          onClick={handleRunNewTest}
          className="cyber-button"
          style={{
            fontSize: '16px'
          }}
        >
          INITIATE NEW SCAN
        </button>
      </div>
    );
  }

  return (
    <div className="cyber-panel cyber-fade-in" style={{ 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '30px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="cyber-heading cyber-glow-cyan" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>SCAN RESULTS</h1>
        <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '14px', color: '#00ffff', textAlign: 'left', display: 'inline-block' }}>
          <div className="cyber-text scan-id-text">
            >> SCAN_ID&nbsp;&nbsp;&nbsp;&nbsp;: {testId}
          </div>
          <div className="cyber-text">
            >> TARGET&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {results?.url}
          </div>
          <div className="cyber-text">
            >> TIMESTAMP&nbsp;: {results?.timestamp ? new Date(results.timestamp).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="cyber-panel" style={{
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 className="cyber-heading" style={{ marginBottom: '20px', fontSize: '1.8rem' }}>>> ANALYSIS SUMMARY</h2>
        <div className="summary-stats" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="cyber-primary" style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
              {results?.summary?.passed || 0}
            </div>
            <div className="cyber-text" style={{ fontSize: '12px', textTransform: 'uppercase' }}>PASSED</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="cyber-secondary" style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
              {results?.summary?.failed || 0}
            </div>
            <div className="cyber-text" style={{ fontSize: '12px', textTransform: 'uppercase' }}>FAILED</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="cyber-primary" style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
              {results?.summary?.total || 0}
            </div>
            <div className="cyber-text" style={{ fontSize: '12px', textTransform: 'uppercase' }}>TOTAL</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="cyber-text" style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif', color: '#f0f0f0' }}>
              {results?.summary?.duration ? 
                (parseFloat(results.summary.duration.replace('ms', '')) / 1000).toFixed(1) + 's' : 
                '0.0s'}
            </div>
            <div className="cyber-text" style={{ fontSize: '12px', textTransform: 'uppercase' }}>DURATION</div>
          </div>
        </div>
      </div>

      {/* Individual Test Results */}
      <div>
        <h2 className="cyber-heading" style={{ marginBottom: '20px', fontSize: '1.8rem' }}>>> DETAILED ANALYSIS</h2>
        {results?.tests?.map((test, index) => (
          <div
            key={index}
            className="cyber-panel"
            style={{
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: test.status === 'passed' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)',
              borderColor: test.status === 'passed' ? '#00ffff' : '#ff00ff'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div>
                <h4 className="cyber-text" style={{ margin: 0, fontSize: '16px', fontFamily: 'Orbitron, sans-serif', fontWeight: '700' }}>
                  {test.title ? test.title.charAt(0).toUpperCase() + test.title.slice(1) : 'Unknown Test'}
                </h4>
                {test.browser && (
                  <div className="cyber-text" style={{ 
                    fontSize: '12px', 
                    color: '#00ffff', 
                    marginTop: '2px',
                    textTransform: 'uppercase'
                  }}>
                    >> AGENT: {test.browser === 'webkit' ? 'SAFARI (WEBKIT)' : test.browser.toUpperCase()}
                  </div>
                )}
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '0',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, sans-serif',
                backgroundColor: test.status === 'passed' ? '#00ffff' : '#ff00ff',
                color: '#0a0a0a',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {test.status?.toUpperCase()}
              </span>
            </div>
            <div className="cyber-text" style={{ fontSize: '12px', color: '#f0f0f0' }}>
              >> EXECUTION_TIME: {(test.duration / 1000).toFixed(1)}s
            </div>
            {test.error && (
              <div className="cyber-panel" style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'rgba(255, 0, 255, 0.2)',
                borderColor: '#ff00ff',
                fontSize: '12px',
                fontFamily: 'Roboto Mono, monospace',
                color: '#ff00ff'
              }}>
                >> ERROR: {test.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={handleRunNewTest}
          className="cyber-button"
          style={{
            fontSize: '16px'
          }}
        >
          INITIATE NEW SCAN
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StatusPage;
