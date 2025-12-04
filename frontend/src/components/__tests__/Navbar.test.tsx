import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import Navbar from '../Navbar';

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  describe('Rendering', () => {
    it('should render the navbar', () => {
      renderNavbar();
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render SpeakWise logo and brand name', () => {
      renderNavbar();
      expect(screen.getByText('SpeakWise')).toBeInTheDocument();
      const logo = screen.getByRole('link', { name: /speakwise/i });
      expect(logo).toHaveAttribute('href', '/');
    });

    it('should render navigation links on desktop', () => {
      renderNavbar();
      expect(screen.getByRole('link', { name: /features/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /how it works/i })).toBeInTheDocument();
    });

    it('should render sign in button', () => {
      renderNavbar();
      const signInButtons = screen.getAllByRole('link', { name: /sign in/i });
      expect(signInButtons.length).toBeGreaterThan(0);
    });

    it('should render get started button', () => {
      renderNavbar();
      const getStartedButtons = screen.getAllByRole('link', { name: /get started/i });
      expect(getStartedButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for features link', () => {
      renderNavbar();
      const featuresLink = screen.getByRole('link', { name: /features/i });
      expect(featuresLink).toHaveAttribute('href', '/features');
    });

    it('should have correct href for how it works link', () => {
      renderNavbar();
      const worksLink = screen.getByRole('link', { name: /how it works/i });
      expect(worksLink).toHaveAttribute('href', '/works');
    });

    it('should have correct href for sign in links', () => {
      renderNavbar();
      const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
      signInLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/login');
      });
    });

    it('should have correct href for get started links', () => {
      renderNavbar();
      const getStartedLinks = screen.getAllByRole('link', { name: /get started/i });
      getStartedLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/signup');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should have desktop navigation menu', () => {
      renderNavbar();
      const desktopMenu = screen.getByRole('link', { name: /features/i }).parentElement;
      expect(desktopMenu).toHaveClass('hidden', 'md:flex');
    });

    it('should have mobile navigation buttons', () => {
      renderNavbar();
      const allSignInButtons = screen.getAllByRole('link', { name: /sign in/i });
      // Should have both desktop and mobile versions
      expect(allSignInButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Styling', () => {
    it('should have sticky positioning', () => {
      renderNavbar();
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('sticky', 'top-0');
    });

    it('should have backdrop blur effect', () => {
      renderNavbar();
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('backdrop-blur-md');
    });

    it('should have border bottom', () => {
      renderNavbar();
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('border-b');
    });
  });
});
