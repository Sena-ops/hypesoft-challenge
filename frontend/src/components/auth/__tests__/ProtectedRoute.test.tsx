import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import * as KeycloakContext from '@/stores/KeycloakContext';

vi.mock('@/stores/KeycloakContext');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('ProtectedRoute', () => {
  const mockUseKeycloak = vi.mocked(KeycloakContext.useKeycloak);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    mockUseKeycloak.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      hasAnyRole: vi.fn(() => true),
      user: { email: 'test@example.com' },
    } as any);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading state when checking authentication', () => {
    mockUseKeycloak.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      hasAnyRole: vi.fn(() => false),
    } as any);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('shows access denied when user does not have required roles', () => {
    mockUseKeycloak.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      hasAnyRole: vi.fn(() => false),
      user: { email: 'test@example.com' },
    } as any);

    render(
      <ProtectedRoute requiredRoles={['admin']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders fallback when provided and user is not authenticated', () => {
    mockUseKeycloak.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      hasAnyRole: vi.fn(() => false),
    } as any);

    render(
      <ProtectedRoute fallback={<div>Custom Fallback</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });

  it('calls login when user is not authenticated', async () => {
    const mockLogin = vi.fn();
    mockUseKeycloak.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      hasAnyRole: vi.fn(() => false),
    } as any);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
