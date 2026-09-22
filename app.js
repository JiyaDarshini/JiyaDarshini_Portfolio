/**
 * Portfolio Logic - Jiya Darshini
 * 1. Seamless Visual Greeting Animation Controller
 * 2. Dreamy Ambient Star Sparkles Overlay Canvas
 * 3. Modal Navigation & Interactive UI Controls
 * 4. Custom Cursor Glow
 */

document.addEventListener('DOMContentLoaded', () => {
  initGreetingAnimation();
  initAmbientSparkles();
  initModalsAndNav();
  initCursorGlow();
});

/* ==========================================================================
   1. Seamless Visual Greeting Animation
   ========================================================================== */
function initGreetingAnimation() {
  const greetingVideo = document.getElementById('greeting-video');
  if (!greetingVideo) return;

  greetingVideo.muted = true;
  greetingVideo.playsInline = true;

  function onGreetingComplete() {
    // Smoothly fade out the greeting video to reveal the exact static base image
    greetingVideo.classList.add('fade-out');
  }

  // Handle video end
  greetingVideo.addEventListener('ended', onGreetingComplete);

  // Fallback timer in case video end event is delayed
  setTimeout(() => {
    onGreetingComplete();
  }, 4200);

  // Ensure autoplay starts
  const playPromise = greetingVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Browser blocked autoplay, play on first user interaction
      const startOnInteraction = () => {
        greetingVideo.play().catch(() => {});
        window.removeEventListener('click', startOnInteraction);
        window.removeEventListener('mousemove', startOnInteraction);
        window.removeEventListener('touchstart', startOnInteraction);
      };
      window.addEventListener('click', startOnInteraction, { once: true });
      window.addEventListener('mousemove', startOnInteraction, { once: true });
      window.addEventListener('touchstart', startOnInteraction, { once: true });
    });
  }
}

/* ==========================================================================
   2. Dreamy Ambient Star Sparkles Overlay Canvas
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
