import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardStats } from '../useDashboard';
import { api } from '@/services/api';
import { mockDashboardStats } from '@/test/mocks/api';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches dashboard stats successfully', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockDashboardStats });

    const { result } = renderHook(() => useDashboardStats(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDashboardStats);
    expect(api.get).toHaveBeenCalledWith('/dashboard');
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useDashboardStats(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('handles error correctly', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(api.get).mockRejectedValue(error);

    const { result } = renderHook(() => useDashboardStats(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
