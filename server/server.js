const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store test runs in memory (in production, use a database)
const testRuns = new Map();
// Store running processes for cancellation
const runningProcesses = new Map();

// Root route for browser access
app.get('/', (req, res) => {
  res.json({
    message: 'Playwright Test Runner API Server',
    status: 'Running',
    endpoints: {
      'POST /api/run-tests': 'Start test execution',
      'GET /api/test-status/:testId': 'Get test progress',
      'GET /api/test-results/:testId': 'Get test results',
      'POST /api/cancel-test/:testId': 'Cancel running test',
      'GET /api/debug/:testId': 'Debug test run data',
      'POST /api/test-simple': 'Simple test without Playwright'
    },
    frontend: 'http://localhost:4000'
  });
});

// API Routes
app.post('/api/run-tests', async (req, res) => {
  const { url, browsers = ['chromium', 'firefox', 'webkit'] } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const testId = uuidv4();
  const testRun = {
    id: testId,
    url,
    status: 'initializing',
    progress: 0,
    startTime: new Date(),
    completed: false,
    results: null
  };

  testRuns.set(testId, testRun);

  // Start the test execution asynchronously
  executeTests(testId, url, browsers);

  res.json({ testId, message: 'Tests started' });
});

app.get('/api/test-status/:testId', (req, res) => {
  const { testId } = req.params;
  const testRun = testRuns.get(testId);

  if (!testRun) {
    return res.status(404).json({ error: 'Test run not found' });
  }

  res.json({
    progress: testRun.progress,
    status: testRun.status,
    completed: testRun.completed
  });
});

app.get('/api/test-results/:testId', (req, res) => {
  try {
    const { testId } = req.params;
    const testRun = testRuns.get(testId);

    console.log(`API: Getting results for testId: ${testId}`);
    console.log(`API: Test run found:`, !!testRun);

    if (!testRun) {
      console.log(`API: Test run not found for testId: ${testId}`);
      return res.status(404).json({ error: 'Test run not found' });
    }

    if (!testRun.completed) {
      console.log(`API: Test still running for testId: ${testId}`);
      return res.status(202).json({ message: 'Test still running' });
    }

    console.log(`API: Returning results for testId: ${testId}`, testRun.results);
    
    // Ensure results exist and have proper structure
    if (!testRun.results) {
      console.log(`API: No results found for completed test: ${testId}`);
      return res.status(500).json({ error: 'Test completed but no results available' });
    }

    res.json(testRun.results);
  } catch (error) {
    console.error(`API: Error in test-results endpoint:`, error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/cancel-test/:testId', (req, res) => {
  const { testId } = req.params;
  const testRun = testRuns.get(testId);
  const process = runningProcesses.get(testId);

  if (!testRun) {
    return res.status(404).json({ error: 'Test run not found' });
  }

  if (testRun.completed) {
    return res.status(400).json({ error: 'Test already completed' });
  }

  // Kill the running process if it exists
  if (process) {
    try {
      process.kill('SIGTERM');
      runningProcesses.delete(testId);
    } catch (error) {
      console.error('Error killing process:', error);
    }
  }

  // Update test run status
  testRun.status = 'Cancelled';
  testRun.completed = true;
  testRun.results = {
    summary: { passed: 0, failed: 0, total: 0, duration: '0ms' },
    tests: [{
      title: 'Test Cancelled',
      status: 'cancelled',
      duration: 0,
      error: 'Test was cancelled by user'
    }],
    url,
    timestamp: new Date()
  };

  res.json({ message: 'Test cancelled successfully' });
});

// Simple test endpoint that bypasses Playwright
app.post('/api/test-simple', (req, res) => {
  const { url } = req.body;
  const testId = uuidv4();
  
  // Create a simple mock test result
  const mockResults = {
    summary: { passed: 1, failed: 0, total: 1, duration: '1000ms' },
    tests: [{
      title: 'Mock URL Visit Test',
      status: 'passed',
      duration: 1000,
      error: null
    }],
    url,
    timestamp: new Date()
  };
  
  const testRun = {
    id: testId,
    url,
    status: 'Completed',
    progress: 100,
    startTime: new Date(),
    completed: true,
    results: mockResults
  };
  
  testRuns.set(testId, testRun);
  
  res.json({ testId, message: 'Simple test completed' });
});

// Debug endpoint to inspect test run data
app.get('/api/debug/:testId', (req, res) => {
  try {
    const { testId } = req.params;
    const testRun = testRuns.get(testId);
    
    console.log(`DEBUG: Inspecting testId: ${testId}`);
    
    if (!testRun) {
      return res.json({ error: 'Test run not found', availableTests: Array.from(testRuns.keys()) });
    }
    
    res.json({
      testId,
      testRun: {
        ...testRun,
        resultsExists: !!testRun.results,
        resultsType: typeof testRun.results
      }
    });
  } catch (error) {
    console.error('DEBUG endpoint error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

async function executeTests(testId, url, browsers = ['chromium', 'firefox', 'webkit']) {
  const testRun = testRuns.get(testId);
  
  try {
    // Update status
    testRun.status = 'Creating dynamic test file...';
    testRun.progress = 10;

    // Create a dynamic test file for the provided URL
    const dynamicTestContent = generateDynamicTest(url);
    const testFilePath = path.join(__dirname, '..', 'tests', `dynamic-${testId}.spec.js`);
    
    await fs.writeFile(testFilePath, dynamicTestContent);

    testRun.status = 'Running Playwright tests...';
    testRun.progress = 30;

    // Execute Playwright tests
    let playwrightProcess;
    try {
      // Try different approaches to run Playwright
      const isWindows = process.platform === 'win32';
      let command, args;
      
      // Create project filter arguments for selected browsers
      const projectArgs = browsers.map(browser => `--project=${browser}`).join(' ');
      
      if (isWindows) {
        // On Windows, use cmd to run npx
        command = 'cmd';
        args = ['/c', `npx playwright test dynamic-${testId}.spec.js --reporter=json ${projectArgs}`];
      } else {
        command = 'npx';
        args = ['playwright', 'test', `dynamic-${testId}.spec.js`, '--reporter=json', ...browsers.map(b => `--project=${b}`)];
      }
      
      playwrightProcess = spawn(command, args, {
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: isWindows
      });
      
      // Store the process for potential cancellation
      runningProcesses.set(testId, playwrightProcess);
    } catch (error) {
      console.error('Failed to spawn Playwright process:', error);
      throw new Error('Playwright is not installed or npx is not available');
    }

    let stdout = '';
    let stderr = '';

    playwrightProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      testRun.progress = Math.min(testRun.progress + 5, 90);
    });

    playwrightProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    playwrightProcess.on('close', async (code) => {
      // Remove from running processes
      runningProcesses.delete(testId);
      
      // Check if test was cancelled
      if (testRun.status === 'Cancelled') {
        return;
      }

      testRun.progress = 100;
      testRun.status = 'Processing results...';

      console.log(`Playwright process closed with code: ${code}`);
      console.log(`stdout length: ${stdout.length}`);
      console.log(`stderr length: ${stderr.length}`);
      
      if (code !== 0) {
        console.log('Playwright process failed with non-zero exit code');
        console.log('stderr content:', stderr);
      }

      try {
        // Parse test results
        console.log('Parsing test results...');
        console.log('stdout preview:', stdout.substring(0, 500));
        console.log('stderr preview:', stderr.substring(0, 500));
        const results = parseTestResults(stdout, stderr, url, testRun.startTime);
        console.log('Parsed results:', results);
        testRun.results = results;
        testRun.completed = true;
        testRun.status = 'Completed';

        // Clean up dynamic test file
        await fs.remove(testFilePath);
      } catch (error) {
        console.error('Error parsing results:', error);
        console.error('Error stack:', error.stack);
        testRun.results = {
          summary: { passed: 0, failed: 1, total: 1, duration: '0ms' },
          tests: [{
            title: 'Test Execution Error',
            status: 'failed',
            duration: 0,
            error: `Test parsing failed: ${error.message}. Exit code: ${code}. Stderr: ${stderr.substring(0, 200)}`
          }],
          url,
          timestamp: new Date()
        };
        testRun.completed = true;
        testRun.status = 'Failed';
      }
    });

  } catch (error) {
    console.error('Error executing tests:', error);
    testRun.status = 'Failed';
    testRun.completed = true;
    testRun.results = {
      summary: { passed: 0, failed: 1, total: 1, duration: '0ms' },
      tests: [{
        title: 'Test Setup Error',
        status: 'failed',
        duration: 0,
        error: error.message
      }],
      url,
      timestamp: new Date()
    };
  }
}

function generateDynamicTest(url) {
  return `// @ts-check
import { test, expect } from '@playwright/test';

test.describe('URL Visit Verification for ${url}', () => {
  test('should successfully visit and verify the URL', async ({ page }) => {
    console.log('Starting URL visit test for: ${url}');
    
    // Navigate to the provided URL
    await page.goto('${url}', { waitUntil: 'networkidle' });
    
    console.log('Page loaded successfully');

    // Verify the page URL is accessible (allowing for redirects)
    const currentUrl = page.url();
    console.log(\`Current URL after navigation: \${currentUrl}\`);
    
    // Check that we're on the expected domain
    const expectedDomain = new URL('${url}').hostname;
    const currentDomain = new URL(currentUrl).hostname;
    expect(currentDomain).toBe(expectedDomain);

    // Verify the page has loaded content (has a title)
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(\`Page title: \${title}\`);

    // Verify the page is not showing an error
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    // Check for common error indicators
    const hasErrorText = bodyText.toLowerCase().includes('error') || 
                        bodyText.toLowerCase().includes('not found') ||
                        bodyText.toLowerCase().includes('404');
    
    if (hasErrorText) {
      console.log('Warning: Page may contain error content');
    }

    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/url-visit-screenshot.png', 
      fullPage: true 
    });
    
    console.log('URL visit verification completed successfully');
  });
});`;
}

function parseTestResults(stdout, stderr, url, startTime) {
  console.log('parseTestResults called with:', { stdout: stdout.substring(0, 200), stderr, url });
  
  try {
    // Try to parse JSON output from Playwright
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('Found JSON match, attempting to parse...');
      const playwrightResults = JSON.parse(jsonMatch[0]);
      console.log('Parsed Playwright results:', playwrightResults);
      
      const summary = {
        passed: playwrightResults.stats?.expected || 0,
        failed: playwrightResults.stats?.unexpected || 0,
        total: (playwrightResults.stats?.expected || 0) + (playwrightResults.stats?.unexpected || 0),
        duration: `${playwrightResults.stats?.duration || 0}ms`
      };

      const tests = [];
      
      // Extract test results from Playwright JSON structure
      function extractTests(suites) {
        if (!suites) return;
        
        suites.forEach(suite => {
          // Check specs in current suite
          if (suite.specs) {
            suite.specs.forEach(spec => {
              if (spec.tests) {
                spec.tests.forEach(test => {
                  if (test.results) {
                    test.results.forEach(result => {
                      tests.push({
                        title: test.title || spec.title || 'Unknown Test',
                        status: result.status === 'passed' ? 'passed' : 'failed',
                        duration: result.duration || 0,
                        error: result.error?.message || null,
                        browser: test.projectName || suite.title || 'Unknown Browser'
                      });
                    });
                  }
                });
              }
            });
          }
          
          // Recursively check nested suites
          if (suite.suites) {
            extractTests(suite.suites);
          }
        });
      }
      
      if (playwrightResults.suites) {
        extractTests(playwrightResults.suites);
      }

      console.log('Returning structured results:');
      console.log('Summary:', summary);
      console.log('Tests array:', tests);
      console.log('Tests count:', tests.length);
      return {
        summary,
        tests,
        url,
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.error('Error parsing JSON results:', error);
  }

  console.log('Using fallback parsing...');
  // Fallback parsing if JSON parsing fails
  const passed = (stdout.match(/✓/g) || []).length;
  const failed = (stdout.match(/✗|×/g) || []).length;
  
  // If no test symbols found, assume it's a setup/execution error
  const hasTestOutput = passed > 0 || failed > 0;
  
  const fallbackResult = {
    summary: {
      passed: hasTestOutput ? passed : 0,
      failed: hasTestOutput ? failed : 1, // Mark as failed if no test output
      total: hasTestOutput ? (passed + failed) : 1,
      duration: `${Date.now() - startTime.getTime()}ms`
    },
    tests: [{
      title: 'URL Visit Verification',
      status: hasTestOutput && failed === 0 ? 'passed' : 'failed',
      duration: Date.now() - startTime.getTime(),
      error: hasTestOutput ? (stderr || null) : 'Playwright is not installed. Please run: npm install @playwright/test && npx playwright install'
    }],
    url,
    timestamp: new Date()
  };
  
  console.log('Returning fallback results:', fallbackResult);
  return fallbackResult;
}

// Health check endpoint for Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
