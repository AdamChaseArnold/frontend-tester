import React from 'react';

/**
 * ErrorBoundary Component - Catches JavaScript errors anywhere in the child component tree
 * Provides a fallback UI with cyberpunk styling
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    // Reset the error boundary state and reload the page
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="cyber-panel cyber-fade-in status-container error-container">
          <h1 className="cyber-heading cyber-glow-secondary status-title">
            SYSTEM MALFUNCTION
          </h1>
          <div className="cyber-panel" style={{
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: 'rgba(255, 0, 255, 0.1)',
            borderColor: '#ff00ff'
          }}>
            <p className="cyber-text" style={{ color: '#ff00ff', marginBottom: '10px' }}>
              >> CRITICAL ERROR DETECTED
            </p>
            <p className="cyber-text" style={{ fontSize: '14px', marginBottom: '15px' }}>
              The neural interface has encountered an unexpected error. System diagnostics are available below.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="cyber-panel" style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 0, 255, 0.05)',
                borderColor: '#ff00ff',
                fontSize: '12px',
                fontFamily: 'Roboto Mono, monospace'
              }}>
                <summary style={{ cursor: 'pointer', color: '#ff00ff', marginBottom: '10px' }}>
                  >> DIAGNOSTIC DATA
                </summary>
                <pre style={{ 
                  color: '#f0f0f0', 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  margin: 0
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <div className="actions-section">
            <button
              onClick={this.handleReload}
              className="cyber-button"
              style={{ marginRight: '10px' }}
            >
              RESTART SYSTEM
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="cyber-button cyber-button-secondary"
            >
              RETURN TO BASE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
