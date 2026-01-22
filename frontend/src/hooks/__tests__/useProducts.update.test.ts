import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateProduct } from '../useProducts';
import { api } from '@/services/api';
import { mockProducts } from '@/test/mocks/api';

vi.mock('@/services/api', () => ({
  api: {
    put: vi.fn(),
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

describe('useUpdateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates product successfully', async () => {
    const updatedProduct = { ...mockProducts[0], name: 'Updated Product' };
    vi.mocked(api.put).mockResolvedValue({ data: updatedProduct });

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: '1',
      data: { name: 'Updated Product' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.put).toHaveBeenCalledWith('/products/1', { name: 'Updated Product' });
  });

  it('handles error correctly', async () => {
    const error = new Error('Failed to update');
    vi.mocked(api.put).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: '1',
      data: { name: 'Updated Product' },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
