import { vi } from 'vitest';

export const mockKeycloakInstance = {
  authenticated: true,
  token: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  idToken: 'mock-id-token',
  tokenParsed: {
    sub: 'user-123',
    email: 'test@example.com',
    preferred_username: 'testuser',
    realm_access: {
      roles: ['admin', 'editor'],
    },
  },
  updateToken: vi.fn().mockResolvedValue(false),
  login: vi.fn(),
  logout: vi.fn(),
  init: vi.fn().mockResolvedValue(true),
  onReady: vi.fn(),
  onAuthSuccess: vi.fn(),
  onAuthError: vi.fn(),
  onTokenExpired: vi.fn(),
};

export const createMockKeycloakContext = (overrides = {}) => ({
  isAuthenticated: true,
  isLoading: false,
  user: {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    roles: ['admin', 'editor'],
  },
  hasRole: vi.fn((role: string) => ['admin', 'editor'].includes(role)),
  hasAnyRole: vi.fn((roles: string[]) => 
    roles.some(role => ['admin', 'editor'].includes(role))
  ),
  login: vi.fn(),
  logout: vi.fn(),
  updateToken: vi.fn().mockResolvedValue(true),
  ...overrides,
});
