/**
 * Password Validation Utilities for Frontend
 * Matches backend validation requirements
 */

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Validates password against all requirements
 */
export const validatePassword = (password: string): PasswordValidation => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };

  const errors: string[] = [];

  if (!requirements.minLength) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!requirements.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!requirements.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!requirements.hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!requirements.hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  const strength = getPasswordStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    requirements,
  };
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
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

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get strength color for UI
 */
export const getStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'strong':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

/**
 * Get strength background color for progress bar
 */
export const getStrengthBgColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

/**
 * Get strength percentage for progress bar
 */
export const getStrengthPercentage = (strength: 'weak' | 'medium' | 'strong'): number => {
  switch (strength) {
    case 'weak':
      return 33;
    case 'medium':
      return 66;
    case 'strong':
      return 100;
    default:
      return 0;
  }
};
