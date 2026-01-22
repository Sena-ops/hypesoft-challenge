import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMockKeycloakContext } from '../mocks/keycloak';
import * as KeycloakContext from '@/stores/KeycloakContext';
import { vi } from 'vitest';

// Mock do KeycloakContext (já está no setup.ts, mas pode ser sobrescrito aqui se necessário)

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  keycloakContext?: ReturnType<typeof createMockKeycloakContext>;
}

export function renderWithProviders(
  ui: ReactElement,
  { keycloakContext, ...renderOptions }: CustomRenderOptions = {}
) {
  const queryClient = createTestQueryClient();

  // Configura o mock do Keycloak
  if (keycloakContext) {
    vi.mocked(KeycloakContext.useKeycloak).mockReturnValue(keycloakContext as any);
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
