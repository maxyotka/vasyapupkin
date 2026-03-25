// src/magnetic.js — magnetic repulsion offset calculation

/**
 * Calculate repulsion offset for a character when the mouse is nearby.
 * @param {number} mouseX  - mouse X in viewport coordinates
 * @param {number} mouseY  - mouse Y in viewport coordinates
 * @param {number} charX   - character center X
 * @param {number} charY   - character center Y
 * @param {number} radius  - influence radius in px
 * @returns {{ x: number, y: number }}
 */
export function calcMagneticOffset(mouseX, mouseY, charX, charY, radius) {
  const dx = mouseX - charX;
  const dy = mouseY - charY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= radius || dist === 0) return { x: 0, y: 0 };

  // Repulsion strength: 1 at center, 0 at radius edge
  const force = (radius - dist) / radius;
  const scale = 0.3; // max displacement = radius * scale

  return {
    x: -(dx / dist) * force * radius * scale,
    y: -(dy / dist) * force * radius * scale,
  };
}
