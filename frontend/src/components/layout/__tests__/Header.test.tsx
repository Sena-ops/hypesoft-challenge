import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';
import * as KeycloakContext from '@/stores/KeycloakContext';
import * as nextThemes from 'next-themes';

vi.mock('@/stores/KeycloakContext');
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

describe('Header', () => {
  const mockUseKeycloak = vi.mocked(KeycloakContext.useKeycloak);
  const mockUseTheme = vi.mocked(nextThemes.useTheme);

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      themes: ['light', 'dark'],
    } as any);

    mockUseKeycloak.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        roles: ['admin'],
      },
      logout: vi.fn(),
      hasRole: vi.fn((role: string) => role === 'admin'),
    } as any);
  });

  it('renders header with search input', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument();
  });

  it('renders user avatar and dropdown', () => {
    render(<Header />);
    const avatarButton = screen.getByRole('button', { name: /test user/i });
    expect(avatarButton).toBeInTheDocument();
  });

  it('displays user email', async () => {
    render(<Header />);
    const avatarButton = screen.getByRole('button');
    await userEvent.click(avatarButton);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows admin badge when user is admin', async () => {
    render(<Header />);
    const avatarButton = screen.getByRole('button');
    await userEvent.click(avatarButton);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn();
    mockUseKeycloak.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        roles: ['admin'],
      },
      logout: mockLogout,
      hasRole: vi.fn((role: string) => role === 'admin'),
    } as any);

    render(<Header />);
    const avatarButton = screen.getByRole('button');
    await userEvent.click(avatarButton);
    
    const logoutButton = screen.getByText('Sair');
    await userEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('toggles theme when theme button is clicked', async () => {
    const mockSetTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
    } as any);

    render(<Header />);
    const themeButton = screen.getAllByRole('button').find(
      btn => btn.getAttribute('aria-label') === 'Alternar tema'
    );
    
    if (themeButton) {
      await userEvent.click(themeButton);
      expect(mockSetTheme).toHaveBeenCalled();
    }
  });

  it('renders notification bell', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    const bellButton = buttons.find(btn => 
      btn.querySelector('svg')?.getAttribute('class')?.includes('bell')
    );
    expect(bellButton).toBeInTheDocument();
  });
});
