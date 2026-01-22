export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  categoryId: string
  stockQuantity: number
  createdAt: string
  updatedAt?: string
}

export interface CreateProductDto {
  name: string
  description: string
  price: number
  currency?: string
  categoryId: string
  stockQuantity: number
}

export interface UpdateProductDto {
  name?: string
  description?: string
  price?: number
  currency?: string
  categoryId?: string
  stockQuantity?: number
}

export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt?: string
}

export interface CreateCategoryDto {
  name: string
  description: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
}

export interface CategoryStats {
  categoryName: string
  productCount: number
}

export interface DashboardStats {
  totalProducts: number
  totalStockValue: number
  lowStockCount: number
  categoryStats: CategoryStats[]
  lowStockProducts: Product[]
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
