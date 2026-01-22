import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../StatsCard';
import { Package } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Products',
    value: 100,
    icon: Package,
  };

  it('renders title and value', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatsCard {...defaultProps} description="Total number of products" />);
    expect(screen.getByText('Total number of products')).toBeInTheDocument();
  });

  it('renders trend information when provided', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 10, label: 'vs last month' }}
      />
    );
    expect(screen.getByText(/\+10%/)).toBeInTheDocument();
    expect(screen.getByText(/vs last month/)).toBeInTheDocument();
  });

  it('shows negative trend correctly', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: -5, label: 'vs last month' }}
      />
    );
    expect(screen.getByText(/-5%/)).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { container } = render(
      <StatsCard {...defaultProps} variant="warning" />
    );
    const iconContainer = container.querySelector('.bg-amber-500\\/10');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    const { container } = render(<StatsCard {...defaultProps} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('handles string values', () => {
    render(<StatsCard {...defaultProps} value="R$ 1.000,00" />);
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
  });
});
