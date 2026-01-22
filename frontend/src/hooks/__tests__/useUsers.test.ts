import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers, useUpdateUserRoles, useCurrentUser } from '../useUsers';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
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

const mockUsers = [
  {
    userId: 'user-1',
    username: 'user1',
    email: 'user1@example.com',
    firstName: 'User',
    lastName: 'One',
    roles: ['editor'],
    enabled: true,
  },
  {
    userId: 'user-2',
    username: 'user2',
    email: 'user2@example.com',
    roles: ['leitor'],
    enabled: true,
  },
];

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches users successfully', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockUsers });

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
    expect(api.get).toHaveBeenCalledWith('/users');
  });

  it('handles error correctly', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(api.get).mockRejectedValue(error);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe('useUpdateUserRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates user roles successfully', async () => {
    const updatedUser = { ...mockUsers[0], roles: ['admin', 'editor'] };
    vi.mocked(api.put).mockResolvedValue({ data: updatedUser });

    const { result } = renderHook(() => useUpdateUserRoles(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 'user-1',
      roles: ['admin', 'editor'],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.put).toHaveBeenCalledWith('/users/user-1/roles', {
      roles: ['admin', 'editor'],
    });
  });
});

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches current user successfully', async () => {
    const currentUser = { id: 'current-user', email: 'current@example.com' };
    vi.mocked(api.get).mockResolvedValue({ data: currentUser });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(currentUser);
    expect(api.get).toHaveBeenCalledWith('/debug/me');
  });
});
