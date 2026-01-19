export interface Product {
  id: string
  name: string
  description: string
  price: {
    amount: number
    currency: string
  }
  categoryId: string
  stockQuantity: number
  createdAt: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt?: string
}

export interface DashboardStats {
  totalProducts: number
  totalStockValue: number
  lowStockProducts: Product[]
  productsByCategory: {
    categoryName: string
    count: number
  }[]
}
