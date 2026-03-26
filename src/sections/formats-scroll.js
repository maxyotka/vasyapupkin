// src/sections/formats-scroll.js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Mobile only — desktop footer reveal is handled inside initFormatsScroll
export function initFooterReveal() {
  if (window.innerWidth > 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const footer = document.querySelector('.footer');
  if (!footer) return;

  gsap.set(footer, { clipPath: 'inset(100% 0 0 0)', y: 40 });
  gsap.to(footer, {
    clipPath: 'inset(0% 0 0 0)',
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: footer,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
}

// Mobile format panels — staggered scroll reveal
export function initMobileFormats() {
  if (window.innerWidth > 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const panels = gsap.utils.toArray('.format-panel');
  panels.forEach((panel) => {
    const fill = panel.querySelector('.format-panel__fill');
    const name = panel.querySelector('.format-panel__name');
    const desc = panel.querySelector('.format-panel__desc');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    if (fill) {
      gsap.set(fill, { clipPath: 'inset(100% 0 0 0)' });
      tl.to(fill, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power3.out' }, 0);
    }
    if (name) {
      gsap.set(name, { y: 30, opacity: 0 });
      tl.to(name, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.2);
    }
    if (desc) {
      gsap.set(desc, { y: 20, opacity: 0 });
      tl.to(desc, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.35);
    }
  });
}

export function initFormatsScroll() {
  if (window.innerWidth <= 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const track = document.querySelector('.formats__track');
  if (!track) return;

  const panels = gsap.utils.toArray('.format-panel');
  let horizontalScroll = panels.length * window.innerWidth - window.innerWidth;

  // Set track width based on actual panel count
  track.style.width = `${panels.length * 100}vw`;

  // Pin the .formats section and scrub horizontally.
  // containerAnimation requires pin and x-animation in the SAME ScrollTrigger.
  const pinST = gsap.to(track, {
    x: () => -horizontalScroll,
    ease: 'none',
    scrollTrigger: {
      id: 'formats-pin',
      trigger: '.formats',
      start: 'top top',
      end: () => `+=${horizontalScroll}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  // Recompute scroll distance on resize so end value stays correct
  ScrollTrigger.addEventListener('refreshInit', () => {
    horizontalScroll = panels.length * window.innerWidth - window.innerWidth;
    track.style.width = `${panels.length * 100}vw`;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) ScrollTrigger.refresh();
    }, 200);
  });

  // Panel reveal animations triggered as each panel enters the pinned container
  panels.forEach((panel, i) => {
    const name = panel.querySelector('.format-panel__name');
    const desc = panel.querySelector('.format-panel__desc');
    const fill = panel.querySelector('.format-panel__fill');

    // First panel is visible immediately when section pins — reveal it right away
    if (i === 0) {
      if (fill) gsap.set(fill, { clipPath: 'inset(0% 0 0 0)' });
      if (name) gsap.set(name, { y: 0, opacity: 1 });
      if (desc) gsap.set(desc, { y: 0, opacity: 1 });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        containerAnimation: pinST,
        start: 'left 100%',  // start reveal as soon as panel enters viewport
        toggleActions: 'play none none reverse',
      },
    });

    if (fill) tl.to(fill, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power3.out' }, 0);
    if (name) tl.to(name, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.1);
    if (desc) tl.to(desc, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.3);
  });

  // Footer: clip-path reveal when it enters the viewport after the pin releases
  const footer = document.querySelector('.footer');
  if (footer) {
    gsap.set(footer, { clipPath: 'inset(100% 0 0 0)', y: 40 });
    gsap.to(footer, {
      clipPath: 'inset(0% 0 0 0)',
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footer,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }
}
