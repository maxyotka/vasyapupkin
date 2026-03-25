// tests/magnetic.test.js
import { describe, it, expect } from 'vitest';
import { calcMagneticOffset } from '../src/magnetic.js';

describe('calcMagneticOffset', () => {
  it('returns zero offset when mouse is outside radius', () => {
    const offset = calcMagneticOffset(0, 0, 500, 500, 120);
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
  });

  it('returns non-zero offset when mouse is inside radius', () => {
    // Mouse at (10,10), char center at (0,0), radius 120 → dist ~14px, inside
    const offset = calcMagneticOffset(10, 10, 0, 0, 120);
    expect(offset.x).not.toBe(0);
    expect(offset.y).not.toBe(0);
  });

  it('repels away from mouse (negative direction)', () => {
    // Mouse at (50, 0), char at (0,0) → char should move to negative X
    const offset = calcMagneticOffset(50, 0, 0, 0, 120);
    expect(offset.x).toBeLessThan(0);
  });

  it('force is proportional to proximity', () => {
    const near = calcMagneticOffset(10, 0, 0, 0, 120);
    const far  = calcMagneticOffset(80, 0, 0, 0, 120);
    // Nearer mouse → stronger repulsion
    expect(Math.abs(near.x)).toBeGreaterThan(Math.abs(far.x));
  });
});
