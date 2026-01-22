import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopProducts } from '../TopProducts';

describe('TopProducts', () => {
  it('renders top products card', () => {
    render(<TopProducts />);
    
    expect(screen.getByText('Top Products')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<TopProducts />);
    
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders product list', () => {
    render(<TopProducts />);
    
    expect(screen.getByText('Bomber Jacket')).toBeInTheDocument();
    expect(screen.getByText('Linen Shirt')).toBeInTheDocument();
    expect(screen.getByText('Ankle Pants')).toBeInTheDocument();
    expect(screen.getByText('Black Shirt')).toBeInTheDocument();
  });

  it('displays product categories', () => {
    render(<TopProducts />);
    
    expect(screen.getByText('Jacket')).toBeInTheDocument();
    expect(screen.getByText('Shirt')).toBeInTheDocument();
    expect(screen.getByText('Pants')).toBeInTheDocument();
  });
});
