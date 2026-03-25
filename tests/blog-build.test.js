// tests/blog-build.test.js
import { describe, it, expect } from 'vitest';
import { slugify, parseFrontMatter } from '../scripts/build-blog.js';

describe('slugify', () => {
  it('converts latin filename to slug', () => {
    expect(slugify('hello-world.md')).toBe('hello-world');
  });

  it('removes .md extension', () => {
    expect(slugify('my-post.md')).toBe('my-post');
  });

  it('lowercases', () => {
    expect(slugify('MyPost.md')).toBe('mypost');
  });
});

describe('parseFrontMatter', () => {
  it('extracts title from front-matter', () => {
    const md = `---\ntitle: Test Title\ndate: 2026-01-01\npreview: Short preview text\nreadingTime: 3\n---\n\nBody content`;
    const { data } = parseFrontMatter(md);
    expect(data.title).toBe('Test Title');
  });

  it('extracts readingTime as number', () => {
    const md = `---\ntitle: T\ndate: 2026-01-01\npreview: P\nreadingTime: 5\n---\nBody`;
    const { data } = parseFrontMatter(md);
    expect(typeof data.readingTime).toBe('number');
  });

  it('throws if required fields missing', () => {
    const md = `---\ntitle: Only title\n---\nBody`;
    expect(() => parseFrontMatter(md, { requireAll: true })).toThrow();
  });
});
