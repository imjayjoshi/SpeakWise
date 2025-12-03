const { validatePassword, getPasswordStrength } = require('../utils/passwordValidator');

describe('Password Validator', () => {
  describe('validatePassword', () => {
    test('should accept valid password with all requirements', () => {
      const result = validatePassword('Test@123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept password with multiple special characters', () => {
      const result = validatePassword('Test@123!#$');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Test@12');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    test('should reject password without uppercase letter', () => {
      const result = validatePassword('test@123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should reject password without lowercase letter', () => {
      const result = validatePassword('TEST@123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should reject password without number', () => {
      const result = validatePassword('Test@abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should reject password without special character', () => {
      const result = validatePassword('Test1234');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    });

    test('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    test('should reject null password', () => {
      const result = validatePassword(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    test('should return multiple errors for password missing multiple requirements', () => {
      const result = validatePassword('test');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    test('should accept password with exactly 8 characters', () => {
      const result = validatePassword('Test@123');
      expect(result.isValid).toBe(true);
    });

    test('should accept password with various special characters', () => {
      const passwords = [
        'Test!123',
        'Test@123',
        'Test#123',
        'Test$123',
        'Test%123',
        'Test^123',
        'Test&123',
        'Test*123',
        'Test(123)',
        'Test_123',
        'Test+123',
        'Test-123',
        'Test=123',
        'Test[123]',
        'Test{123}',
        'Test|123',
        'Test;123',
        'Test:123',
        'Test,123',
        'Test.123',
        'Test<123>',
        'Test?123'
      ];

      passwords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('getPasswordStrength', () => {
    test('should return "weak" for short password', () => {
      const strength = getPasswordStrength('Test@1');
      expect(strength).toBe('weak');
    });

    test('should return "weak" for password missing requirements', () => {
      const strength = getPasswordStrength('test1234');
      expect(strength).toBe('weak');
    });

    test('should return "medium" for password with basic requirements', () => {
      const strength = getPasswordStrength('Test@123');
      expect(strength).toBe('medium');
    });

    test('should return "strong" for long password with all requirements', () => {
      const strength = getPasswordStrength('Test@123456789');
      expect(strength).toBe('strong');
    });

    test('should return "weak" for empty password', () => {
      const strength = getPasswordStrength('');
      expect(strength).toBe('weak');
    });

    test('should return "weak" for null password', () => {
      const strength = getPasswordStrength(null);
      expect(strength).toBe('weak');
    });
  });
});
