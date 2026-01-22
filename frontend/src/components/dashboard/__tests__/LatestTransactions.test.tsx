import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LatestTransactions } from '../LatestTransactions';

describe('LatestTransactions', () => {
  it('renders latest transactions card', () => {
    render(<LatestTransactions />);
    
    expect(screen.getByText('Latest Transaction')).toBeInTheDocument();
  });

  it('renders filter button', () => {
    render(<LatestTransactions />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders transaction table headers', () => {
    render(<LatestTransactions />);
    
    expect(screen.getByText('Transaction ID')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Qty')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders transaction data', () => {
    render(<LatestTransactions />);
    
    expect(screen.getByText('Ananda Faris')).toBeInTheDocument();
    expect(screen.getByText('Bomber Jacket')).toBeInTheDocument();
    expect(screen.getByText('Jacket')).toBeInTheDocument();
  });
});
