import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SalesChart } from '../../charts/SalesChart';

const mockData = [
  { name: 'Category 1', count: 10 },
  { name: 'Category 2', count: 20 },
  { name: 'Category 3', count: 15 },
];

describe('SalesChart', () => {
  it('renders chart with data', () => {
    render(<SalesChart data={mockData} />);
    
    expect(screen.getByText('Produtos por Categoria')).toBeInTheDocument();
    expect(screen.getByText('Distribuição de produtos cadastrados por categoria')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<SalesChart data={[]} />);
    
    expect(screen.getByText('Nenhuma categoria cadastrada')).toBeInTheDocument();
  });

  it('renders chart container when data is provided', () => {
    const { container } = render(<SalesChart data={mockData} />);
    
    // Verifica se o container do gráfico está presente
    const chartContainer = container.querySelector('.h-\\[300px\\]');
    expect(chartContainer).toBeInTheDocument();
  });
});
