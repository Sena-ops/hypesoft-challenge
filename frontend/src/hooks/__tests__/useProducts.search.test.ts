import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchProducts, useLowStockProducts } from '../useProducts';
import { api } from '@/services/api';
import { mockProducts } from '@/test/mocks/api';

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

describe('useSearchProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches products successfully', async () => {
    const mockResponse = {
      items: [mockProducts[0]],
      totalCount: 1,
      totalPages: 1,
      page: 1,
      pageSize: 10,
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const { result } = renderHook(
      () => useSearchProducts({ name: 'Test', page: 1, pageSize: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      '/products/search?name=Test&page=1&pageSize=10'
    );
  });

  it('does not fetch when search term is empty', () => {
    const { result } = renderHook(
      () => useSearchProducts({ name: '', page: 1 }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isFetching).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('returns empty result when search term is empty', async () => {
    const { result } = renderHook(
      () => useSearchProducts({ name: '   ', page: 1 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      if (result.current.data) {
        expect(result.current.data.items).toEqual([]);
        expect(result.current.data.totalCount).toBe(0);
      }
    });
  });
});

describe('useLowStockProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches low stock products successfully', async () => {
    const lowStockProducts = mockProducts.filter(p => p.stockQuantity < 10);
    vi.mocked(api.get).mockResolvedValue({ data: lowStockProducts });

    const { result } = renderHook(() => useLowStockProducts(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(lowStockProducts);
    expect(api.get).toHaveBeenCalledWith('/products/low-stock?threshold=10');
  });

  it('uses custom threshold', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useLowStockProducts(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/products/low-stock?threshold=5');
  });
});
