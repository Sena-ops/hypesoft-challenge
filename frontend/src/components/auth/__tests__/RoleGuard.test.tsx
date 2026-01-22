import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleGuard, AdminOnly, EditorOnly } from '../RoleGuard';
import * as KeycloakContext from '@/stores/KeycloakContext';

// Mock do KeycloakContext
vi.mock('@/stores/KeycloakContext', () => ({
  useKeycloak: vi.fn(),
}));

describe('RoleGuard', () => {
  const mockUseKeycloak = vi.mocked(KeycloakContext.useKeycloak);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user has required role', () => {
    mockUseKeycloak.mockReturnValue({
      hasAnyRole: vi.fn(() => true),
      isLoading: false,
      isAuthenticated: true,
    } as any);

    render(
      <RoleGuard roles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders fallback when user does not have required role', () => {
    mockUseKeycloak.mockReturnValue({
      hasAnyRole: vi.fn(() => false),
      isLoading: false,
      isAuthenticated: true,
    } as any);

    render(
      <RoleGuard roles={['admin']} fallback={<div>No Access</div>}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('No Access')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders nothing when user is not authenticated', () => {
    mockUseKeycloak.mockReturnValue({
      hasAnyRole: vi.fn(() => false),
      isLoading: false,
      isAuthenticated: false,
    } as any);

    const { container } = render(
      <RoleGuard roles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows loading when showLoading is true and isLoading is true', () => {
    mockUseKeycloak.mockReturnValue({
      hasAnyRole: vi.fn(() => false),
      isLoading: true,
      isAuthenticated: false,
    } as any);

    render(
      <RoleGuard roles={['admin']} showLoading>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });
});

describe('AdminOnly', () => {
  const mockUseKeycloak = vi.mocked(KeycloakContext.useKeycloak);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is admin', () => {
    mockUseKeycloak.mockReturnValue({
      hasAnyRole: vi.fn((roles: string[]) => roles.includes('admin')),
      isLoading: false,
      isAuthenticated: true,
    } as any);

    render(
      <AdminOnly>
        <div>Admin Content</div>
      </AdminOnly>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders fallback when user is not admin', () => {
    mockUseKeycloak.mockReturnValue({
      hasAnyRole: vi.fn(() => false),
      isLoading: false,
      isAuthenticated: true,
    } as any);

    render(
      <AdminOnly fallback={<div>Not Admin</div>}>
        <div>Admin Content</div>
      </AdminOnly>
    );

    expect(screen.getByText('Not Admin')).toBeInTheDocument();
  });
});

describe('EditorOnly', () => {
  const mockUseKeycloak = vi.mocked(KeycloakContext.useKeycloak);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is editor', () => {
    mockUseKeycloak.mockReturnValue({
      hasAnyRole: vi.fn((roles: string[]) => 
        roles.some(r => ['admin', 'editor', 'manager'].includes(r))
      ),
      isLoading: false,
      isAuthenticated: true,
    } as any);

    render(
      <EditorOnly>
        <div>Editor Content</div>
      </EditorOnly>
    );

    expect(screen.getByText('Editor Content')).toBeInTheDocument();
  });
});
