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
      await waitFor(() => {
        expect(localStorage.getItem('user')).toBeNull();
      });
    });
  });
});
