import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories, useCategory, useCreateCategory } from '../useCategories';
import { api } from '@/services/api';
import { mockCategories } from '@/test/mocks/api';

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

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches categories successfully', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockCategories });

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCategories);
    expect(api.get).toHaveBeenCalledWith('/categories');
  });
});

describe('useCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches single category successfully', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockCategories[0] });

    const { result } = renderHook(() => useCategory('cat-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCategories[0]);
    expect(api.get).toHaveBeenCalledWith('/categories/cat-1');
  });
});

describe('useCreateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates category successfully', async () => {
    const newCategory = {
      name: 'New Category',
      description: 'New Description',
    };

    const createdCategory = { ...mockCategories[0], ...newCategory };

    vi.mocked(api.post).mockResolvedValue({ data: createdCategory });

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newCategory);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith('/categories', newCategory);
  });
});
