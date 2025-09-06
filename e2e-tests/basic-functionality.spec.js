const { test, expect } = require('@playwright/test');

test.describe('Cyberpunk Frontend Tester E2E Tests', () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  test.beforeEach(async ({ page }) => {
    // Navigate to the frontend
    await page.goto(frontendUrl);
  });

  test('should load the System Analyzer interface', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.locator('h1')).toContainText('SYSTEM ANALYZER');
    
    // Check if the cyberpunk styling is applied
    const heading = page.locator('h1');
    await expect(heading).toHaveClass(/cyber-heading/);
  });

  test('should display URL dropdown and browser selection', async ({ page }) => {
    // Check if URL dropdown is present
    await expect(page.locator('.custom-dropdown')).toBeVisible();
    
    // Check if browser checkboxes are present
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(3);
    
    // Verify browser labels
    await expect(page.locator('text=Chromium')).toBeVisible();
    await expect(page.locator('text=Firefox')).toBeVisible();
    await expect(page.locator('text=Safari (WebKit)')).toBeVisible();
  });

  test('should interact with custom dropdown', async ({ page }) => {
    const dropdown = page.locator('.custom-dropdown > div').first();
    
    // Click to open dropdown
    await dropdown.click();
    
    // Check if dropdown options are visible
    await expect(page.locator('text=https://zoomwarriors.com')).toBeVisible();
    
    // Select an option
    await page.locator('text=https://zoomwarriors.com').click();
    
    // Verify selection
    await expect(dropdown).toContainText('https://zoomwarriors.com');
  });

  test('should have working backend health endpoint', async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
  });

  test('should initiate scan when form is submitted', async ({ page }) => {
    // Fill out the form
    const dropdown = page.locator('.custom-dropdown > div').first();
    await dropdown.click();
    await page.locator('text=https://zoomwarriors.com').click();
    
    // Ensure at least one browser is selected (should be by default)
    const chromiumCheckbox = page.locator('input[value="chromium"]');
    await expect(chromiumCheckbox).toBeChecked();
    
    // Submit the form
    await page.locator('button[type="submit"]').click();
    
    // Check if the button text changes to indicate execution
    await expect(page.locator('button[type="submit"]')).toContainText('EXECUTING...');
    
    // Wait for some progress indication
    await page.waitForSelector('.progress-bar', { timeout: 10000 });
  });

  test('should display cyberpunk styling elements', async ({ page }) => {
    // Check for neon glow effects
    const panel = page.locator('.cyber-panel');
    await expect(panel).toBeVisible();
    
    // Check for proper color scheme
    const computedStyle = await panel.evaluate(el => {
      return window.getComputedStyle(el);
    });
    
    // Verify cyberpunk colors are applied (this is a basic check)
    expect(computedStyle.borderColor).toContain('rgb(0, 255, 255)'); // cyan
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if main elements are still visible and properly sized
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.custom-dropdown')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Verify the layout doesn't break
    const panel = page.locator('.cyber-panel');
    const boundingBox = await panel.boundingBox();
    expect(boundingBox.width).toBeLessThanOrEqual(375);
  });
});
