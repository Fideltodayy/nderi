import { describe, it, expect } from 'vitest';
import { detectSuspiciousActivity } from '../useAuditLogs';

describe('detectSuspiciousActivity', () => {
  it('should detect suspicious book deletion', () => {
    const previousState = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890',
      quantity: 5,
      price: 29.99,
      status: 'available'
    };

    const result = detectSuspiciousActivity('delete', 'book', previousState, null);
    expect(result.isRisky).toBe(true);
    expect(result.riskLevel).toBe('medium');
  });

  it('should detect suspicious bulk book addition', () => {
    const newState = Array(51).fill({
      title: 'Bulk Test Book',
      author: 'Test Author',
      isbn: '1234567890',
      quantity: 1,
      price: 29.99,
      status: 'available'
    });

    const result = detectSuspiciousActivity('create', 'book', null, newState);
    expect(result.isRisky).toBe(true);
    expect(result.riskLevel).toBe('high');
  });

  it('should detect suspicious price changes', () => {
    const previousState = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890',
      quantity: 5,
      price: 29.99,
      status: 'available'
    };

    const newState = {
      ...previousState,
      price: 0.99
    };

    const result = detectSuspiciousActivity('update', 'book', previousState, newState);
    expect(result.isRisky).toBe(true);
    expect(result.riskLevel).toBe('high');
  });

  it('should detect suspicious quantity changes', () => {
    const previousState = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890',
      quantity: 5,
      price: 29.99,
      status: 'available'
    };

    const newState = {
      ...previousState,
      quantity: 50
    };

    const result = detectSuspiciousActivity('update', 'book', previousState, newState);
    expect(result.isRisky).toBe(true);
    expect(result.riskLevel).toBe('medium');
  });

  it('should not flag normal updates as suspicious', () => {
    const previousState = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890',
      quantity: 5,
      price: 29.99,
      status: 'available'
    };

    const newState = {
      ...previousState,
      title: 'Updated Test Book',
      author: 'Updated Author'
    };

    const result = detectSuspiciousActivity('update', 'book', previousState, newState);
    expect(result.isRisky).toBe(false);
  });
});