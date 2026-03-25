// tests/split.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { splitChars, splitWords } from '../src/split.js';

// Mock DOM
beforeEach(() => {
  document.body.innerHTML = '';
});

describe('splitChars', () => {
  it('returns one span per character', () => {
    const el = document.createElement('span');
    el.textContent = 'ABC';
    document.body.appendChild(el);
    const chars = splitChars(el);
    expect(chars.length).toBe(3);
  });

  it('preserves aria-label with original text', () => {
    const el = document.createElement('span');
    el.textContent = 'Привет';
    document.body.appendChild(el);
    splitChars(el);
    expect(el.getAttribute('aria-label')).toBe('Привет');
  });

  it('converts spaces to non-breaking spaces', () => {
    const el = document.createElement('span');
    el.textContent = 'A B';
    document.body.appendChild(el);
    const chars = splitChars(el);
    expect(chars[1].textContent).toBe('\u00A0');
  });
});

describe('splitWords', () => {
  it('returns one span per word', () => {
    const el = document.createElement('p');
    el.textContent = 'один два три';
    document.body.appendChild(el);
    const words = splitWords(el);
    expect(words.length).toBe(3);
  });
});
