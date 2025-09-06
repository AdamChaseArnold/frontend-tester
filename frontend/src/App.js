import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestForm from './components/TestForm';
import StatusPage from './components/StatusPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<TestForm />} />
            <Route path="/status/:testId" element={<StatusPage />} />
            <Route path="/test-status" element={<StatusPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default App;
