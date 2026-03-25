// src/blog-list.js
import { initHeader, initContactDropdown } from './shared.js';

initHeader({ alwaysScrolled: true });
initContactDropdown();

// ─── Scatter layout (desktop only) ───
function scatterCards() {
  if (window.innerWidth <= 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('blogCanvas');
  if (!canvas) return;

  const cards = Array.from(canvas.querySelectorAll('.blog-card'));
  const cols = 3;
  const colWidth = canvas.offsetWidth / cols;
  const rotations = [-3, 1.5, -1, 2.5, -2];
  const yOffsets = [0, 60, 20, 80, 40];

  // Pass 1: set --card-rotate and position each card in a rough grid
  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rotate = rotations[i % rotations.length];
    const jitterX = (((i * 37) % 60) - 30);
    const jitterY = yOffsets[i % yOffsets.length];

    card.style.setProperty('--card-rotate', `${rotate}deg`);
    card.style.left = `${col * colWidth + jitterX}px`;
    card.style.top = `${row * 320 + jitterY}px`;
  });

  // Pass 2: after reflow, measure heights and set canvas height
  requestAnimationFrame(() => {
    let maxBottom = 0;
    cards.forEach((card) => {
      const bottom = card.offsetTop + card.offsetHeight;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    canvas.style.height = `${maxBottom + 80}px`;
  });
}

scatterCards();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(scatterCards, 150);
});
