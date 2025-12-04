import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import Dashboard from '../Dashboard';
import { authAPI, phraseAPI, practiceHistoryAPI } from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  authAPI: {
    getMe: vi.fn(),
    logout: vi.fn(),
  },
  phraseAPI: {
    getPhrasesByLevel: vi.fn(),
  },
  practiceHistoryAPI: {
    getPracticeHistory: vi.fn(),
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

const mockUser = {
  fullName: 'Test User',
  email: 'test@example.com',
  streak: 5,
  role: 'learner',
};

const mockPhrases = [
  {
    _id: '1',
    text: 'Hello, how are you?',
    meaning: 'A common greeting',
    level: 'beginner',
    language: 'English',
  },
  {
    _id: '2',
    text: 'こんにちは',
    meaning: 'Hello',
    level: 'beginner',
    language: 'Japanese',
  },
];

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authAPI.getMe).mockResolvedValue({ data: { user: mockUser } });
    vi.mocked(phraseAPI.getPhrasesByLevel).mockResolvedValue({
      data: { phrases: mockPhrases },
    });
    vi.mocked(practiceHistoryAPI.getPracticeHistory).mockResolvedValue({
      data: { practices: [] },
    });
  });

  describe('Loading State', () => {
    it('should show loading message initially', () => {
      renderDashboard();
      expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
    });
  });

  describe('User Information', () => {
    it('should display user name after loading', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/hello, test user!/i)).toBeInTheDocument();
      });
    });

    it('should display user streak', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/5 day streak/i)).toBeInTheDocument();
      });
    });

    it('should display SpeakWise branding', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('SpeakWise')).toBeInTheDocument();
      });
    });
  });

  describe('Phrases Display', () => {
    it('should display recommended phrases', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/today's recommended practice/i)).toBeInTheDocument();
      });
    });

    it('should display practice by level section', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/practice by level/i)).toBeInTheDocument();
      });
    });

    it('should display level categories', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Beginner')).toBeInTheDocument();
        expect(screen.getByText('Intermediate')).toBeInTheDocument();
        expect(screen.getByText('Expert')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should render logout button', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });

    it('should render progress link', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /progress/i })).toBeInTheDocument();
      });
    });

    it('should render profile link', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch user data on mount', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(authAPI.getMe).toHaveBeenCalled();
      });
    });

    it('should fetch phrases by level', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(phraseAPI.getPhrasesByLevel).toHaveBeenCalledWith('beginner');
        expect(phraseAPI.getPhrasesByLevel).toHaveBeenCalledWith('intermediate');
        expect(phraseAPI.getPhrasesByLevel).toHaveBeenCalledWith('expert');
      });
    });

    it('should fetch practice history', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(practiceHistoryAPI.getPracticeHistory).toHaveBeenCalled();
      });
    });
  });

  describe('Progress Stats', () => {
    it('should display progress sidebar', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/your progress/i)).toBeInTheDocument();
      });
    });

    it('should display languages section', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Japanese')).toBeInTheDocument();
      });
    });

    it('should display achievements section', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/recent achievements/i)).toBeInTheDocument();
      });
    });
  });
});
