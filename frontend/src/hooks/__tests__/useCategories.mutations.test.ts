import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateCategory, useDeleteCategory } from '../useCategories';
import { api } from '@/services/api';
import { mockCategories } from '@/test/mocks/api';

vi.mock('@/services/api', () => ({
  api: {
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

describe('useUpdateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates category successfully', async () => {
    const updatedCategory = { ...mockCategories[0], name: 'Updated Category' };
    vi.mocked(api.put).mockResolvedValue({ data: updatedCategory });

    const { result } = renderHook(() => useUpdateCategory(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: 'cat-1',
      data: { name: 'Updated Category' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.put).toHaveBeenCalledWith('/categories/cat-1', {
      name: 'Updated Category',
    });
  });
});

describe('useDeleteCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes category successfully', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useDeleteCategory(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('cat-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.delete).toHaveBeenCalledWith('/categories/cat-1');
  });
});
