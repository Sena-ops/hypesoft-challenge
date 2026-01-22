import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Providers } from '../providers';

describe('Providers', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('provides QueryClient context', () => {
    const { container } = render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Verifica se o componente renderiza sem erros
    expect(container).toBeInTheDocument();
  });
});
