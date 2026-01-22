import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LowStockList } from '../LowStockList';

const mockProducts = [
  {
    id: '1',
    name: 'Product 1',
    stockQuantity: 5,
    price: 100,
    currency: 'BRL',
    categoryId: 'cat-1',
  },
  {
    id: '2',
    name: 'Product 2',
    stockQuantity: 3,
    price: 200,
    currency: 'BRL',
    categoryId: 'cat-2',
  },
] as any;

describe('LowStockList', () => {
  it('renders products list when products are provided', () => {
    render(<LowStockList products={mockProducts} />);
    
    expect(screen.getByText('Produtos com Estoque Baixo')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('5 unidades')).toBeInTheDocument();
    expect(screen.getByText('3 unidades')).toBeInTheDocument();
  });

  it('renders empty state when no products', () => {
    render(<LowStockList products={[]} />);
    
    expect(screen.getByText('Nenhum produto com estoque baixo')).toBeInTheDocument();
  });

  it('displays correct stock quantity with singular form', () => {
    const singleProduct = [{
      id: '1',
      name: 'Product 1',
      stockQuantity: 1,
      price: 100,
      currency: 'BRL',
      categoryId: 'cat-1',
    }];

    render(<LowStockList products={singleProduct} />);
    
    expect(screen.getByText('1 unidade')).toBeInTheDocument();
  });

  it('formats price correctly', () => {
    render(<LowStockList products={mockProducts} />);
    
    // Verifica se o preço está formatado
    expect(screen.getByText(/R\$/)).toBeInTheDocument();
  });
});
