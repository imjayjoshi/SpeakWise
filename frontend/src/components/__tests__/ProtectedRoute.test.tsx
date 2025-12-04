import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import ProtectedRoute from '../ProtectedRoute';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderProtectedRoute = (children: React.ReactNode, requireAdmin = false) => {
  return render(
    <BrowserRouter>
      <ProtectedRoute requireAdmin={requireAdmin}>{children}</ProtectedRoute>
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  describe('Authentication Check', () => {
    it('should redirect to login when user is not authenticated', async () => {
      renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should render children when user is authenticated', async () => {
      const mockUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'learner',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { getByText } = renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(getByText('Protected Content')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user data is invalid JSON', async () => {
      localStorage.setItem('user', 'invalid-json');

      renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    it('should redirect to login when user has no role', async () => {
      const mockUser = {
        fullName: 'Test User',
        email: 'test@example.com',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(localStorage.getItem('user')).toBeNull();
      });
    });
  });

  describe('Admin Authorization', () => {
    it('should allow admin to access admin routes', async () => {
      const mockAdmin = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };
      localStorage.setItem('user', JSON.stringify(mockAdmin));

      const { getByText } = renderProtectedRoute(
        <div>Admin Content</div>,
        true
      );

      await waitFor(() => {
        expect(getByText('Admin Content')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should redirect learner to dashboard when accessing admin route', async () => {
      const mockUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'learner',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      renderProtectedRoute(<div>Admin Content</div>, true);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect admin to admin dashboard when accessing user route', async () => {
      const mockAdmin = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };
      localStorage.setItem('user', JSON.stringify(mockAdmin));

      renderProtectedRoute(<div>User Content</div>, false);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
      });
    });
  });

  describe('Role-based Routing', () => {
    it('should allow learner to access learner routes', async () => {
      const mockUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'learner',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { getByText } = renderProtectedRoute(
        <div>Learner Content</div>,
        false
      );

      await waitFor(() => {
        expect(getByText('Learner Content')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle different user roles correctly', async () => {
      const roles = ['learner', 'admin'];

      for (const role of roles) {
        mockNavigate.mockClear();
        localStorage.clear();

        const mockUser = {
          fullName: 'Test User',
          email: 'test@example.com',
          role,
        };
        localStorage.setItem('user', JSON.stringify(mockUser));

        const requireAdmin = role === 'admin';
        renderProtectedRoute(<div>Content</div>, requireAdmin);

        await waitFor(() => {
          expect(mockNavigate).not.toHaveBeenCalled();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });

      // Restore original function
      localStorage.getItem = originalGetItem;
    });

    it('should clear invalid user data from localStorage', async () => {
      localStorage.setItem('user', 'invalid-json');

      renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(localStorage.getItem('user')).toBeNull();
      });
    });
  });
});
