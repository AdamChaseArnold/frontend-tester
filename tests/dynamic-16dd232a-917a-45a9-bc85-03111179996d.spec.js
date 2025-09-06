// @ts-check
import { test, expect } from '@playwright/test';

test.describe('URL Visit Verification for https://zoomwarriors.com', () => {
  test('should successfully visit and verify the URL', async ({ page }) => {
    console.log('Starting URL visit test for: https://zoomwarriors.com');
    
    // Navigate to the provided URL
    await page.goto('https://zoomwarriors.com', { waitUntil: 'networkidle' });
    
    console.log('Page loaded successfully');

    // Verify the page URL is accessible (allowing for redirects)
    const currentUrl = page.url();
    console.log(`Current URL after navigation: ${currentUrl}`);
    
    // Check that we're on the expected domain
    const expectedDomain = new URL('https://zoomwarriors.com').hostname;
    const currentDomain = new URL(currentUrl).hostname;
    expect(currentDomain).toBe(expectedDomain);

    // Verify the page has loaded content (has a title)
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`Page title: ${title}`);

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
});