/**
 * Validation utilities for the cyberpunk test runner
 */

export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  if (trimmedUrl.length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return { valid: false, error: 'URL must have a valid hostname' };
    }

    return { valid: true, url: trimmedUrl };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

export const validateBrowserSelection = (browsers) => {
  if (!browsers || typeof browsers !== 'object') {
    return { valid: false, error: 'Browser selection is required' };
  }

  const selectedBrowsers = Object.entries(browsers)
    .filter(([_, selected]) => selected)
    .map(([browser, _]) => browser);

  if (selectedBrowsers.length === 0) {
    return { valid: false, error: 'At least one browser must be selected' };
  }

  const validBrowsers = ['chromium', 'firefox', 'webkit'];
  const invalidBrowsers = selectedBrowsers.filter(browser => !validBrowsers.includes(browser));
  
  if (invalidBrowsers.length > 0) {
    return { valid: false, error: `Invalid browsers: ${invalidBrowsers.join(', ')}` };
  }

  return { valid: true, browsers: selectedBrowsers };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 2000); // Limit length
};

export const validateTestId = (testId) => {
  if (!testId || typeof testId !== 'string') {
    return { valid: false, error: 'Test ID is required' };
  }

  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(testId)) {
    return { valid: false, error: 'Invalid test ID format' };
  }

  return { valid: true, testId };
};

export const formatError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};
