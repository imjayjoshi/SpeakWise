const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/SpeakWise/i);
    await expect(page.getByText('SpeakWise')).toBeVisible();
  });

  test('complete user registration flow', async ({ page }) => {
    // Navigate to sign up
    await page.click('text=Get Started');
    
    // Wait for auth page
    await expect(page).toHaveURL(/.*login|signup/);
    
    // Click sign up tab
    await page.click('button:has-text("Sign Up")');
    
    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    
    // Submit form
    await page.click('button:has-text("Sign Up")');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Verify dashboard loaded
    await expect(page.getByText(/hello/i)).toBeVisible();
  });

  test('complete user login flow', async ({ page }) => {
    // First register a user
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button:has-text("Sign Up")');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/.*login/);
    
    // Login again
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button:has-text("Sign In")');
    
    // Verify logged in
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.getByText(/hello/i)).toBeVisible();
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    
    // Try to submit with invalid data
    await page.fill('input[name="fullName"]', 'A');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'weak');
    await page.click('button:has-text("Sign Up")');
    
    // Should show validation errors
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword@123');
    await page.click('button:has-text("Sign In")');
    
    // Should show error toast or message
    await expect(page.locator('text=/invalid|error/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Forgot password?');
    
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test('should prevent access to protected routes when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test('admin login should redirect to admin dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Sign Up")');
    
    // Register admin user
    await page.fill('input[name="fullName"]', 'Admin User');
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button:has-text("Sign Up")');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/.*admin/, { timeout: 10000 });
  });
});
