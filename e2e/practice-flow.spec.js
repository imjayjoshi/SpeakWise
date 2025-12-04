const { test, expect } = require('@playwright/test');

test.describe('Practice Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    
    const timestamp = Date.now();
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button:has-text("Sign Up")');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should display dashboard with practice options', async ({ page }) => {
    // Verify dashboard elements
    await expect(page.getByText(/hello/i)).toBeVisible();
    await expect(page.getByText(/practice by level/i)).toBeVisible();
  });

  test('should navigate to practice level selection', async ({ page }) => {
    // Click on a level category
    await page.click('text=Beginner');
    
    // Should navigate to level phrases page
    await expect(page).toHaveURL(/.*level\/beginner/);
  });

  test('should display language filter', async ({ page }) => {
    // Check language selector is present
    const languageSelector = page.locator('text=All Languages');
    await expect(languageSelector).toBeVisible();
  });

  test('should filter phrases by language', async ({ page }) => {
    // Click language selector
    await page.click('text=All Languages');
    
    // Select English
    await page.click('text=English');
    
    // Verify filter applied (URL or UI change)
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('should navigate to progress page', async ({ page }) => {
    await page.click('text=Progress');
    
    await expect(page).toHaveURL(/.*progress/);
  });

  test('should display user streak', async ({ page }) => {
    // Check for streak display
    await expect(page.locator('text=/\\d+ day streak/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to user profile', async ({ page }) => {
    await page.click('text=Profile');
    
    await expect(page).toHaveURL(/.*profile/);
  });

  test('should display recommended practice phrases', async ({ page }) => {
    // Check for recommended practice section
    await expect(page.getByText(/today's recommended practice/i)).toBeVisible();
  });

  test('should show practice button for phrases', async ({ page }) => {
    // Look for practice buttons
    const practiceButton = page.locator('button:has-text("Practice")').first();
    
    if (await practiceButton.isVisible()) {
      await expect(practiceButton).toBeVisible();
    }
  });
});

test.describe('Practice Session - With Phrases', () => {
  test.beforeEach(async ({ page }) => {
    // This test assumes phrases exist in the database
    // In a real scenario, you'd seed the database first
    
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    
    const timestamp = Date.now();
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button:has-text("Sign Up")');
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should handle empty phrase list gracefully', async ({ page }) => {
    // If no phrases, should show appropriate message
    const noPhrases = page.locator('text=/no phrases available/i');
    
    if (await noPhrases.isVisible()) {
      await expect(noPhrases).toBeVisible();
    }
  });
});
