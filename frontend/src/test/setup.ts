import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Limpa após cada teste
afterEach(() => {
  cleanup();
});

// Mock do Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock do Keycloak
vi.mock('@/lib/keycloak', () => ({
  getKeycloakInstance: vi.fn(() => ({
    authenticated: true,
    token: 'mock-token',
    updateToken: vi.fn().mockResolvedValue(false),
    login: vi.fn(),
    logout: vi.fn(),
    init: vi.fn().mockResolvedValue(true),
  })),
}));
