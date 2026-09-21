/**
 * Interactive Portfolio Logic - Jiya Darshini
 * 1. Interactive Video Background Crossfading & Scrubbing Engine (Up, Down, Left, Right)
 * 2. Dreamy Ambient Star Sparkles Overlay
 * 3. Modal Navigation & Interactive UI Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  initVideoEngine();
  initAmbientSparkles();
  initModalsAndNav();
  initCursorGlow();
});

/* ==========================================================================
   1. Interactive Video Crossfading & Scrubbing Engine
   ========================================================================== */
function initVideoEngine() {
  const vidUp = document.getElementById('vid-up');
  const vidDown = document.getElementById('vid-down');
  const vidLeft = document.getElementById('vid-left');
  const vidRight = document.getElementById('vid-right');

  const videos = [
    { el: vidUp, dir: 'up' },
    { el: vidDown, dir: 'down' },
    { el: vidLeft, dir: 'left' },
    { el: vidRight, dir: 'right' }
  ];

  // Initialize and ensure playback for all videos
  videos.forEach(({ el }) => {
    if (!el) return;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    
    // Start playback when loaded
    el.addEventListener('loadedmetadata', () => {
      el.play().catch(() => {});
    });
    
    // Try immediate play
    el.play().catch(() => {
      // Autoplay fallback on first user interaction
      const playOnInteract = () => {
        el.play().catch(() => {});
        window.removeEventListener('click', playOnInteract);
        window.removeEventListener('mousemove', playOnInteract);
      };
      window.addEventListener('click', playOnInteract, { once: true });
      window.addEventListener('mousemove', playOnInteract, { once: true });
    });
  });

  // Gaze target vectors (-1.0 to 1.0)
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const LERP_FACTOR = 0.14; // Responsive smooth lerp
  const DEADZONE_RADIUS = 0.05;

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  function onMouseMove(e) {
    if (isTouchDevice) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Face origin on right side (~70% X, ~35% Y)
    const originX = winW * 0.70;
    const originY = winH * 0.35;

    // Normalized offset from face
    let dx = (e.clientX - originX) / (winW * 0.45);
    let dy = (e.clientY - originY) / (winH * 0.45);

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

  // Render loop to smoothly crossfade directional video layers
  function updateVideos() {
    currentX += (targetX - currentX) * LERP_FACTOR;
    currentY += (targetY - currentY) * LERP_FACTOR;

    const dist = Math.sqrt(currentX * currentX + currentY * currentY);

    let weightUp = 0;
    let weightDown = 0;
    let weightLeft = 0;
    let weightRight = 0;

    if (dist > DEADZONE_RADIUS) {
      // Calculate directional weights
      weightUp = currentY < 0 ? Math.min(1, Math.abs(currentY)) : 0;
      weightDown = currentY > 0 ? Math.min(1, currentY) : 0;
      weightLeft = currentX < 0 ? Math.min(1, Math.abs(currentX)) : 0;
      weightRight = currentX > 0 ? Math.min(1, currentX) : 0;

      // Soft non-linear curve for natural transition
      weightUp = Math.pow(weightUp, 1.2);
      weightDown = Math.pow(weightDown, 1.2);
      weightLeft = Math.pow(weightLeft, 1.2);
      weightRight = Math.pow(weightRight, 1.2);
    }

    // Apply opacities to video layers
    if (vidUp) vidUp.style.opacity = weightUp.toFixed(3);
    if (vidDown) vidDown.style.opacity = weightDown.toFixed(3);
    if (vidLeft) vidLeft.style.opacity = weightLeft.toFixed(3);
    if (vidRight) vidRight.style.opacity = weightRight.toFixed(3);

    requestAnimationFrame(updateVideos);
  }

  requestAnimationFrame(updateVideos);
}

/* ==========================================================================
   2. Dreamy Ambient Star Sparkles Overlay Canvas
   ========================================================================== */
function initAmbientSparkles() {
  const canvas = document.getElementById('ambient-sparkles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  const SPARKLES_COUNT = 30;
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
        vy: -Math.random() * 0.3 - 0.08,
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
   3. Modals & Interactive Navigation
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
   4. Custom Cursor Glow
   ========================================================================== */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }, { passive: true });
}
