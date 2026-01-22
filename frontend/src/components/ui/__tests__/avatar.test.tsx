import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('Avatar', () => {
  it('renders avatar with image', () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.jpg" alt="User" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );

    const image = screen.getByAltText('User');
    expect(image).toBeInTheDocument();
  });

  it('renders fallback when image fails', () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid.jpg" alt="User" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders only fallback when no image provided', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
