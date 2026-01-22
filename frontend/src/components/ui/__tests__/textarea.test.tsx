import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea';

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea placeholder="Enter description" />);
    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Textarea onChange={handleChange} placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text') as HTMLTextAreaElement;
    
    await user.type(textarea, 'test description');
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    const textarea = screen.getByPlaceholderText('Disabled textarea');
    expect(textarea).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Textarea className="custom-textarea" placeholder="Custom" />
    );
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} placeholder="Ref textarea" />);
    expect(ref).toHaveBeenCalled();
  });
});
