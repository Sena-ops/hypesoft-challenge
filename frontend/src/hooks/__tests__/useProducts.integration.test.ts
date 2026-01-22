import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useDeleteProduct, useBulkDeleteProducts } from '../useProducts';
import { api } from '@/services/api';
import { mockProducts } from '@/test/mocks/api';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
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

describe('useProducts Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches products and handles pagination', async () => {
    const mockResponse = {
      items: mockProducts,
      totalCount: 2,
      totalPages: 1,
      page: 1,
      pageSize: 10,
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const { result } = renderHook(
      () => useProducts({ page: 1, pageSize: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toHaveLength(2);
    expect(result.current.data?.totalCount).toBe(2);
  });
});

describe('useDeleteProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes product successfully', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useDeleteProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('product-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.delete).toHaveBeenCalledWith('/products/product-1');
  });
});

describe('useBulkDeleteProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes multiple products successfully', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useBulkDeleteProducts(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(['product-1', 'product-2']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.delete).toHaveBeenCalledTimes(2);
  });
});
