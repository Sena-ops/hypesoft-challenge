import { describe, it, expect } from 'vitest';
import { createProductSchema, updateProductSchema } from '../product';

describe('createProductSchema', () => {
  it('validates valid product data', () => {
    const validData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100.50,
      currency: 'BRL',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: 10,
    };

    const result = createProductSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects product with name too short', () => {
    const invalidData = {
      name: 'A',
      description: 'Test Description',
      price: 100,
      currency: 'BRL',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: 10,
    };

    const result = createProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres');
    }
  });

  it('rejects product with negative price', () => {
    const invalidData = {
      name: 'Test Product',
      description: 'Test Description',
      price: -10,
      currency: 'BRL',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: 10,
    };

    const result = createProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects product with invalid currency format', () => {
    const invalidData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      currency: 'brl', // lowercase
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: 10,
    };

    const result = createProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects product with negative stock quantity', () => {
    const invalidData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      currency: 'BRL',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: -5,
    };

    const result = createProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects product with invalid category ID format', () => {
    const invalidData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      currency: 'BRL',
      categoryId: 'invalid-uuid',
      stockQuantity: 10,
    };

    const result = createProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('accepts empty description (defaults to empty string)', () => {
    const validData = {
      name: 'Test Product',
      description: '',
      price: 100,
      currency: 'BRL',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: 10,
    };

    const result = createProductSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('defaults currency to BRL when not provided', () => {
    const dataWithoutCurrency = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: 10,
    };

    const result = createProductSchema.safeParse(dataWithoutCurrency);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('BRL');
    }
  });
});

describe('updateProductSchema', () => {
  it('validates update product data (same as create)', () => {
    const validData = {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
      currency: 'USD',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stockQuantity: 20,
    };

    const result = updateProductSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
