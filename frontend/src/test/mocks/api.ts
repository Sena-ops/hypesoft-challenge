import { vi } from 'vitest';
import { Product, Category, DashboardStats } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Test Product 1',
    description: 'Test Description 1',
    price: 100,
    currency: 'BRL',
    categoryId: 'cat-1',
    stockQuantity: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Test Product 2',
    description: 'Test Description 2',
    price: 200,
    currency: 'BRL',
    categoryId: 'cat-2',
    stockQuantity: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Category 1',
    description: 'Category Description 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Category 2',
    description: 'Category Description 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockDashboardStats: DashboardStats = {
  totalProducts: 100,
  totalStockValue: 50000,
  lowStockCount: 5,
  categoryStats: [
    { categoryName: 'Category 1', productCount: 50 },
    { categoryName: 'Category 2', productCount: 50 },
  ],
  lowStockProducts: mockProducts.filter(p => p.stockQuantity < 10),
};

export const createMockApiResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});
