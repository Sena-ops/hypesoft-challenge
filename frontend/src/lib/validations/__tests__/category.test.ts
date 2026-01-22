import { describe, it, expect } from 'vitest';
import { createCategorySchema, updateCategorySchema } from '../category';

describe('createCategorySchema', () => {
  it('validates valid category data', () => {
    const validData = {
      name: 'Test Category',
      description: 'Test Description',
    };

    const result = createCategorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects category with name too short', () => {
    const invalidData = {
      name: 'A',
      description: 'Test Description',
    };

    const result = createCategorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres');
    }
  });

  it('rejects category with name too long', () => {
    const invalidData = {
      name: 'A'.repeat(201),
      description: 'Test Description',
    };

    const result = createCategorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects category with empty description', () => {
    const invalidData = {
      name: 'Test Category',
      description: '',
    };

    const result = createCategorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('obrigatória');
    }
  });

  it('rejects category with description too long', () => {
    const invalidData = {
      name: 'Test Category',
      description: 'A'.repeat(1001),
    };

    const result = createCategorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('trims whitespace from name and description', () => {
    const dataWithWhitespace = {
      name: '  Test Category  ',
      description: '  Test Description  ',
    };

    const result = createCategorySchema.safeParse(dataWithWhitespace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Test Category');
      expect(result.data.description).toBe('Test Description');
    }
  });
});

describe('updateCategorySchema', () => {
  it('validates update category data (same as create)', () => {
    const validData = {
      name: 'Updated Category',
      description: 'Updated Description',
    };

    const result = updateCategorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
