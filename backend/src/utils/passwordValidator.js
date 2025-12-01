/**
 * Password Validation Utility
 * Validates password strength according to security requirements
 */

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */

const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get password strength level
 * @param {string} password 
 * @returns {string} 'weak' | 'medium' | 'strong'
 */
const getPasswordStrength = (password) => {
  if (!password) return 'weak';
  
  let score = 0;
  
  // Length score (most important factor)
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety score
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;
  
  // If password is too short (< 8 chars), always return weak
  if (password.length < 8) return 'weak';
  
  // Scoring:
  // weak: 4 or less (short or missing requirements)
  // medium: 5 (8 chars with all requirements)
  // strong: 6+ (12+ chars with all requirements)
  if (score <= 4) return 'weak';
  if (score === 5) return 'medium';
  return 'strong';
};

module.exports = {
  validatePassword,
  getPasswordStrength
};
