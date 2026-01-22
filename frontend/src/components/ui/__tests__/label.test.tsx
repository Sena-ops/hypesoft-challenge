import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label>Product Name</Label>);
    expect(screen.getByText('Product Name')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="product-name">Product Name</Label>
        <input id="product-name" />
      </>
    );

    const label = screen.getByText('Product Name');
    const input = screen.getByLabelText('Product Name');
    
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Label className="custom-label">Custom Label</Label>
    );
    const label = container.querySelector('label');
    expect(label).toHaveClass('custom-label');
  });
});
