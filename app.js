/**
 * Interactive Portfolio Logic - Jiya Darshini
 * 1. Background Artwork & Eye Overlay Alignment Engine
 * 2. Real-Time Cursor Eye-Tracking with Smooth Vector Lerp
 * 3. Dreamy Ambient Star Sparkles Overlay
 * 4. Modal Navigation & Interactive UI Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundLayoutAndEyes();
  initEyeTracking();
  initAmbientSparkles();
  initModalsAndNav();
  initCursorGlow();
});

/* ==========================================================================
   1. Background Image & Eye Overlay Dynamic Alignment
   ========================================================================== */
function initBackgroundLayoutAndEyes() {
  const bgImg = document.getElementById('hero-bg-img');
  const eyeContainer = document.getElementById('eye-container');
  if (!bgImg || !eyeContainer) return;

  const NATURAL_W = 2752;
  const NATURAL_H = 1536;
  const IMG_RATIO = NATURAL_W / NATURAL_H;

  // Exact percentage bounds of eyes in the 2752x1536 image:
  // x1=1666, y1=330, width=451, height=256
  const EYE_LEFT_PCT = 1666 / NATURAL_W; // ~0.60538
  const EYE_TOP_PCT = 330 / NATURAL_H;   // ~0.21484
  const EYE_WIDTH_PCT = 451 / NATURAL_W; // ~0.16388
  const EYE_HEIGHT_PCT = 256 / NATURAL_H;// ~0.16667

  function updateLayout() {
    const containerW = window.innerWidth;
    const containerH = window.innerHeight;
    const containerRatio = containerW / containerH;

    let renderW, renderH, renderX, renderY;

    if (containerRatio > IMG_RATIO) {
      // Viewport is wider than image (ultrawide) -> fit width, crop top/bottom
      renderW = containerW;
      renderH = containerW / IMG_RATIO;
      renderX = 0;
      renderY = (containerH - renderH) / 2;
    } else {
      // Viewport is narrower (standard / mobile / laptop) -> fit height, align right so girl stays in view
      renderH = containerH;
      renderW = containerH * IMG_RATIO;
      renderX = containerW - renderW; // Pin to right side
      renderY = 0;
    }

    // Apply exact pixel dimensions and offsets
    bgImg.style.width = `${renderW}px`;
    bgImg.style.height = `${renderH}px`;
    bgImg.style.left = `${renderX}px`;
    bgImg.style.top = `${renderY}px`;

    // Position eye overlay container precisely over the girl's face
    const eyeX = renderX + renderW * EYE_LEFT_PCT;
    const eyeY = renderY + renderH * EYE_TOP_PCT;
    const eyeW = renderW * EYE_WIDTH_PCT;
    const eyeH = renderH * EYE_HEIGHT_PCT;

    eyeContainer.style.left = `${eyeX}px`;
    eyeContainer.style.top = `${eyeY}px`;
    eyeContainer.style.width = `${eyeW}px`;
    eyeContainer.style.height = `${eyeH}px`;

    // Store eye center for tracking calculations
    window._eyeCenterPos = {
      x: eyeX + eyeW * 0.5,
      y: eyeY + eyeH * 0.5
    };
  }

  window.addEventListener('resize', updateLayout);
  if (bgImg.complete) {
    updateLayout();
  } else {
    bgImg.addEventListener('load', updateLayout);
  }
  updateLayout();
}

/* ==========================================================================
   2. Real-Time Eye-Tracking Engine
   ========================================================================== */
function initEyeTracking() {
  const eyeCenter = document.getElementById('eye-center');
  const eyeUp = document.getElementById('eye-up');
  const eyeDown = document.getElementById('eye-down');
  const eyeLeft = document.getElementById('eye-left');
  const eyeRight = document.getElementById('eye-right');

  if (!eyeCenter || !eyeUp || !eyeDown || !eyeLeft || !eyeRight) return;

  // Target vector (-1 to 1) & current interpolated vector
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const LERP_FACTOR = 0.12; // Smooth tracking speed
  const DEADZONE_RADIUS = 0.04;

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  function onMouseMove(e) {
    if (isTouchDevice) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Use calculated eye center, fallback to viewport 70% X, 35% Y
    const origin = window._eyeCenterPos || { x: winW * 0.72, y: winH * 0.35 };

    // Normalized delta relative to eye position
    let dx = (e.clientX - origin.x) / (winW * 0.45);
    let dy = (e.clientY - origin.y) / (winH * 0.45);

    // Clamp to range [-1.0, 1.0]
    targetX = Math.max(-1.0, Math.min(1.0, dx));
    targetY = Math.max(-1.0, Math.min(1.0, dy));
  }

  function onMouseLeave() {
    targetX = 0;
    targetY = 0;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);

  // Animation Loop for Smooth Eye Movement
  function updateEyes() {
    // Linear Interpolation (Lerp) for smooth natural gaze
    currentX += (targetX - currentX) * LERP_FACTOR;
    currentY += (targetY - currentY) * LERP_FACTOR;

    const distFromCenter = Math.sqrt(currentX * currentX + currentY * currentY);

    let weightLeft = 0;
    let weightRight = 0;
    let weightUp = 0;
    let weightDown = 0;
    let weightCenter = 0;

    if (distFromCenter < DEADZONE_RADIUS) {
      weightCenter = 1;
    } else {
      weightLeft = currentX < 0 ? Math.min(1, Math.abs(currentX)) : 0;
      weightRight = currentX > 0 ? Math.min(1, currentX) : 0;
      weightUp = currentY < 0 ? Math.min(1, Math.abs(currentY)) : 0;
      weightDown = currentY > 0 ? Math.min(1, currentY) : 0;

      const sumDirectional = weightLeft + weightRight + weightUp + weightDown;
      weightCenter = Math.max(0, 1 - sumDirectional);

      const total = weightLeft + weightRight + weightUp + weightDown + weightCenter;
      if (total > 0) {
        weightLeft /= total;
        weightRight /= total;
        weightUp /= total;
        weightDown /= total;
        weightCenter /= total;
      }
    }

    // Apply opacities to directional eye layers
    eyeCenter.style.opacity = weightCenter.toFixed(3);
    eyeUp.style.opacity = weightUp.toFixed(3);
    eyeDown.style.opacity = weightDown.toFixed(3);
    eyeLeft.style.opacity = weightLeft.toFixed(3);
    eyeRight.style.opacity = weightRight.toFixed(3);

    requestAnimationFrame(updateEyes);
  }

  requestAnimationFrame(updateEyes);
}

/* ==========================================================================
   3. Dreamy Ambient Star Sparkles Overlay Canvas
   ========================================================================== */
function initAmbientSparkles() {
  const canvas = document.getElementById('ambient-sparkles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  const SPARKLES_COUNT = 35;
  const sparkles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initSparkles();
  }

  function initSparkles() {
    sparkles.length = 0;
    for (let i = 0; i < SPARKLES_COUNT; i++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1, // Float upward gently
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? 'rgba(56, 189, 248,' : 'rgba(255, 255, 255,'
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  function renderSparkles() {
    ctx.clearRect(0, 0, width, height);

    for (const s of sparkles) {
      s.phase += s.twinkleSpeed;
      s.x += s.vx;
      s.y += s.vy;

      if (s.y < -10) s.y = height + 10;
      if (s.x < -10) s.x = width + 10;
      if (s.x > width + 10) s.x = -10;

      const alpha = Math.max(0.05, Math.min(0.85, s.baseAlpha + Math.sin(s.phase) * 0.3));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${s.color} ${alpha})`;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(renderSparkles);
  }

  requestAnimationFrame(renderSparkles);
}

/* ==========================================================================
   4. Modals & Interactive Navigation
   ========================================================================== */
function initModalsAndNav() {
  const modals = {
    projects: document.getElementById('projects-modal'),
    skills: document.getElementById('skills-modal'),
    about: document.getElementById('about-modal'),
    contact: document.getElementById('contact-modal')
  };

  function openModal(modalId) {
    closeAllModals();
    if (modals[modalId]) {
      modals[modalId].classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAllModals() {
    Object.values(modals).forEach(m => {
      if (m) m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }

  // Bind Action Buttons
  document.getElementById('btn-view-projects')?.addEventListener('click', () => openModal('projects'));
  document.getElementById('btn-contact-me')?.addEventListener('click', () => openModal('contact'));
  document.getElementById('nav-contact-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('contact');
  });

  // Nav link click events
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const navTarget = link.getAttribute('data-nav');
      
      document.querySelectorAll('.nav-link').forEach(nl => nl.classList.remove('active'));
      document.querySelectorAll(`[data-nav="${navTarget}"]`).forEach(nl => nl.classList.add('active'));

      if (navTarget === 'home') {
        closeAllModals();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        openModal(navTarget);
      }

      const mobileDrawer = document.getElementById('mobile-drawer');
      if (mobileDrawer) mobileDrawer.classList.remove('active');
    });
  });

  // Modal Close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Mobile Hamburger Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
    });
  }
}

/* ==========================================================================
   5. Custom Cursor Glow
   ========================================================================== */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }, { passive: true });
}
