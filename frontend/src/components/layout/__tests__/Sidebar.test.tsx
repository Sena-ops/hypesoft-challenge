import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../Sidebar';
import * as KeycloakContext from '@/stores/KeycloakContext';

vi.mock('@/stores/KeycloakContext');
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('Sidebar', () => {
  const mockUseKeycloak = vi.mocked(KeycloakContext.useKeycloak);

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseKeycloak.mockReturnValue({
      logout: vi.fn(),
      hasRole: vi.fn((role: string) => role === 'admin'),
    } as any);
  });

  it('renders sidebar with navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Categorias')).toBeInTheDocument();
  });

  it('shows settings link for admin users', () => {
    mockUseKeycloak.mockReturnValue({
      logout: vi.fn(),
      hasRole: vi.fn((role: string) => role === 'admin'),
    } as any);

    render(<Sidebar />);
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  it('hides settings link for non-admin users', () => {
    mockUseKeycloak.mockReturnValue({
      logout: vi.fn(),
      hasRole: vi.fn(() => false),
    } as any);

    render(<Sidebar />);
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<Sidebar />);
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn();
    mockUseKeycloak.mockReturnValue({
      logout: mockLogout,
      hasRole: vi.fn(() => false),
    } as any);

    render(<Sidebar />);
    const logoutButton = screen.getByText('Sair');
    await userEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders Nexus logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('Nexus')).toBeInTheDocument();
  });
});
