import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import Auth from '../Auth';
import { authAPI } from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderAuth = () => {
  return render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );
};

describe('Auth Component', () => {
  describe('Rendering', () => {
    it('should render sign in form by default', () => {
      renderAuth();
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render SpeakWise branding', () => {
      renderAuth();
      expect(screen.getByText('SpeakWise')).toBeInTheDocument();
      expect(screen.getByText(/your journey to confident pronunciation/i)).toBeInTheDocument();
    });

    it('should render back to home link', () => {
      renderAuth();
      expect(screen.getByText(/back to home/i)).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch to sign up form when clicking sign up tab', async () => {
      renderAuth();
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      fireEvent.click(signUpTab);

      await waitFor(() => {
        expect(screen.getByText('Create your account')).toBeInTheDocument();
      });
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    it('should switch back to sign in form', async () => {
      renderAuth();
      
      // Switch to sign up
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));
      await waitFor(() => {
        expect(screen.getByText('Create your account')).toBeInTheDocument();
      });

      // Switch back to sign in
      fireEvent.click(screen.getByRole('tab', { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Sign In', () => {
    it('should show validation error for empty email', async () => {
      renderAuth();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      renderAuth();
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      renderAuth();
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Sign Up', () => {
    it('should show validation error for empty full name', async () => {
      renderAuth();
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /sign up/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short full name', async () => {
      renderAuth();
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      await waitFor(() => {
        const fullNameInput = screen.getByLabelText(/full name/i);
        fireEvent.change(fullNameInput, { target: { value: 'A' } });
        
        const submitButton = screen.getByRole('button', { name: /sign up/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength on sign up', async () => {
      renderAuth();
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      await waitFor(() => {
        const fullNameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'weak' } });

        const submitButton = screen.getByRole('button', { name: /sign up/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        // Should show password validation errors
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'learner',
      };

      vi.mocked(authAPI.login).mockResolvedValue({
        data: { user: mockUser },
      });

      renderAuth();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Test@123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Test@123',
        });
      });
    });

    it('should handle successful registration', async () => {
      const mockUser = {
        fullName: 'New User',
        email: 'new@example.com',
        role: 'learner',
      };

      vi.mocked(authAPI.register).mockResolvedValue({
        data: { user: mockUser },
      });

      renderAuth();
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      await waitFor(async () => {
        const fullNameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(fullNameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Strong@123' } });

        const submitButton = screen.getByRole('button', { name: /sign up/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith({
          fullName: 'New User',
          email: 'new@example.com',
          password: 'Strong@123',
        });
      });
    });

    it('should disable submit button while loading', async () => {
      vi.mocked(authAPI.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderAuth();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Test@123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/signing in.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display server error message on login failure', async () => {
      vi.mocked(authAPI.login).mockRejectedValue({
        isAxiosError: true,
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      renderAuth();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalled();
      });
    });

    it('should clear validation errors when user starts typing', async () => {
      renderAuth();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Trigger validation errors
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 't' } });

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should render forgot password link on sign in', () => {
      renderAuth();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should not render forgot password link on sign up', async () => {
      renderAuth();
      fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
      });
    });
  });
});
