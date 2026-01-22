import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useProduct, useCreateProduct } from '../useProducts';
import { api } from '@/services/api';
import { mockProducts } from '@/test/mocks/api';

// Mock da API
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches products successfully', async () => {
    const mockResponse = {
      items: mockProducts,
      totalCount: 2,
      totalPages: 1,
      page: 1,
      pageSize: 10,
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      '/products?page=1&pageSize=10'
    );
  });

  it('fetches products with filters', async () => {
    const mockResponse = {
      items: [mockProducts[0]],
      totalCount: 1,
      totalPages: 1,
      page: 1,
      pageSize: 10,
    };

    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const { result } = renderHook(
      () => useProducts({ page: 1, pageSize: 5, categoryId: 'cat-1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith(
      '/products?page=1&pageSize=5&categoryId=cat-1'
    );
  });
});

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches single product successfully', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProducts[0] });

    const { result } = renderHook(() => useProduct('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProducts[0]);
    expect(api.get).toHaveBeenCalledWith('/products/1');
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useProduct(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('useCreateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates product successfully', async () => {
    const newProduct = {
      name: 'New Product',
      description: 'New Description',
      price: { amount: 100, currency: 'BRL' },
      categoryId: 'cat-1',
      stockQuantity: 10,
    };

    const createdProduct = { ...mockProducts[0], ...newProduct };

    vi.mocked(api.post).mockResolvedValue({ data: createdProduct });

    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newProduct as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith('/products', newProduct);
  });
});
