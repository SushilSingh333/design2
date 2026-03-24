/* ============================================================
   GODREJ IVARA — LANDING PAGE SCRIPTS
   ============================================================ */

(function () {
  'use strict';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────
     1. PRELOADER
  ───────────────────────────────── */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.remove('modal-open', 'menu-open');
        // Trigger hero reveal after preloader
        triggerHeroReveal();
      }, prefersReducedMotion ? 0 : 1200);
    }
  });

  document.body.classList.add('menu-open');

  /* ─────────────────────────────────
     2. HERO REVEAL
  ───────────────────────────────── */
  function triggerHeroReveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 120);
    });
  }

  /* ─────────────────────────────────
     3. NAVBAR — scroll behavior
  ───────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function updateNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll();

  /* ─────────────────────────────────
     4. HAMBURGER / MOBILE MENU
  ───────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('active', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    hamburger.setAttribute('aria-expanded', String(menuOpen));
    document.body.classList.toggle('menu-open', menuOpen);
  });

  // Close on mobile link click
  document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menuOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });

  function closeMobileMenu() {
    menuOpen = false;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  /* ─────────────────────────────────
     5. SMOOTH SCROLL — nav links
  ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────
     6. SCROLL REVEAL — IntersectionObserver
  ───────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stagger children if data-stagger
        const staggerChildren = entry.target.querySelectorAll('[style*="--i"]');
        staggerChildren.forEach(child => {
          const delay = parseFloat(getComputedStyle(child).getPropertyValue('--i') || 0);
          child.style.transitionDelay = `${delay * 0.07}s`;
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────
     6.1 AMENITIES LOOP
  ───────────────────────────────── */
  function initAmenitiesLoop() {
    if (prefersReducedMotion) return;
    const track = document.querySelector('.amenities-track');
    if (!track) return;
    const cards = Array.from(track.children);
    if (!cards.length) return;
    if (track.dataset.loopInitialized === 'true') return;

    const cloneFragment = document.createDocumentFragment();
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      cloneFragment.appendChild(clone);
    });
    track.appendChild(cloneFragment);
    track.dataset.loopInitialized = 'true';

    const firstClone = track.children[cards.length];
    if (!firstClone) return;
    const resetAt = firstClone.offsetLeft - track.firstElementChild.offsetLeft;
    if (!resetAt || resetAt <= 0) return;

    let offset = 0;
    let lastTs = 0;
    let isPaused = false;
    const speed = window.innerWidth <= 768 ? 30 : 42; // px/sec

    const onEnter = () => { isPaused = true; };
    const onLeave = () => { isPaused = false; };
    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);

    function frame(ts) {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if (!isPaused) {
        offset += speed * dt;
        if (offset >= resetAt) offset -= resetAt;
        track.style.transform = `translateX(${-offset}px)`;
      }
      window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  initAmenitiesLoop();

  /* ─────────────────────────────────
     7. FLOOR PLAN TABS
  ───────────────────────────────── */
  const tabs = document.querySelectorAll('.plan-tab');
  const panes = document.querySelectorAll('.plan-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panes
      panes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === target) {
          pane.classList.add('active');
        }
      });
    });
  });

  /* ─────────────────────────────────
     8. MODAL
  ───────────────────────────────── */
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBox = modalBackdrop?.querySelector('.modal-box');
  let lastFocusedElement = null;
  let modalShown4s = false;
  let modalShown50 = false;
  let modalShown100 = false;

  window.openModal = function () {
    if (!modalBackdrop) return;
    lastFocusedElement = document.activeElement;
    modalBackdrop.classList.add('open');
    document.body.classList.add('modal-open');
    const firstField = modalBackdrop.querySelector('input, button, a, [tabindex]:not([tabindex="-1"])');
    firstField?.focus();
  };

  window.closeModal = function () {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modalBackdrop.classList.contains('open') || !modalBox) return;
    const focusable = modalBox.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Auto-show modal after 4 seconds
  setTimeout(() => {
    if (!modalShown4s) {
      modalShown4s = true;
      if (!modalBackdrop.classList.contains('open')) openModal();
    }
  }, prefersReducedMotion ? 0 : 4000);

  // Auto-show at 50% and 100% scroll
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

    if (scrollPercent >= 50 && !modalShown50) {
      modalShown50 = true;
      if (!modalBackdrop.classList.contains('open')) {
        openModal();
      }
    }
    if (scrollPercent >= 98 && !modalShown100) {
      modalShown100 = true;
      if (!modalBackdrop.classList.contains('open')) {
        openModal();
      }
    }
  }, { passive: true });

  /* ─────────────────────────────────
     9. FORM SUBMISSION
  ───────────────────────────────── */
  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    // Basic validation
    const phone = form.querySelector('[name="phone"]');
    if (phone && !/^\d{10}$/.test(phone.value.trim())) {
      shakeElement(phone);
      return;
    }
    const name = form.querySelector('[name="name"]');
    if (name && name.value.trim().length < 2) {
      shakeElement(name);
      return;
    }

    // Loading state
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Simulate submission (replace with actual API call)
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
      form.reset();

      // Close modal if form is in modal
      if (form.closest('#modalBackdrop')) {
        closeModal();
      }

      showToast();
    }, 1500);
  }

  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });

  function shakeElement(el) {
    el.style.animation = 'none';
    el.style.borderColor = '#ef4444';
    el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    }, { once: true });
  }

  /* ─────────────────────────────────
     10. TOAST NOTIFICATION
  ───────────────────────────────── */
  function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  /* ─────────────────────────────────
     11. GALLERY — simple lightbox-like highlight
  ───────────────────────────────── */
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;

      // Create simple overlay lightbox
      const overlay = document.createElement('div');
      const previousOverflow = document.body.style.overflow;
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:3000;
        background:rgba(0,0,0,0.92);
        display:flex; align-items:center; justify-content:center;
        cursor:zoom-out; opacity:0; transition:opacity 0.3s ease;
        padding:2rem;
      `;

      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.style.cssText = `
        max-width:90vw; max-height:88vh;
        object-fit:contain; border-radius:8px;
        box-shadow:0 20px 80px rgba(0,0,0,0.5);
        transform:scale(0.9); transition:transform 0.3s ease;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        position:absolute; top:24px; right:28px;
        font-size:2.5rem; color:rgba(255,255,255,0.6);
        background:none; border:none; cursor:pointer;
        line-height:1; font-family:sans-serif;
        transition:color 0.2s;
      `;
      closeBtn.onmouseenter = () => closeBtn.style.color = '#fff';
      closeBtn.onmouseleave = () => closeBtn.style.color = 'rgba(255,255,255,0.6)';

      overlay.appendChild(imgEl);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        imgEl.style.transform = 'scale(1)';
      });

      const closeLightbox = () => {
        overlay.style.opacity = '0';
        imgEl.style.transform = 'scale(0.9)';
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = previousOverflow;
        }, 300);
      };

      overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target === closeBtn) closeLightbox(); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { closeLightbox(); document.removeEventListener('keydown', esc); }
      });
    });
  });

  /* ─────────────────────────────────
     12. ACTIVE NAV LINK — scroll spy
  ───────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            // Light highlight — gentle
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => spyObserver.observe(section));

  /* ─────────────────────────────────
     13. PARALLAX — hero subtle effect
  ───────────────────────────────── */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight * 1.5) {
        heroImg.style.transform = `scale(1) translateY(${scrolled * 0.25}px)`;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────
     14. COUNTER ANIMATION — stats strip
  ───────────────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^\d.]/g, ''));
        const suffix = raw.replace(/[\d.]/g, '');
        if (isNaN(num)) return;

        let start = 0;
        const duration = 1600;
        const step = 16;
        const increment = num / (duration / step);
        const isDecimal = String(num).includes('.');

        const interval = setInterval(() => {
          start += increment;
          if (start >= num) {
            start = num;
            clearInterval(interval);
          }
          el.textContent = (isDecimal ? start.toFixed(1) : Math.floor(start)) + suffix;
        }, step);

        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  /* ─────────────────────────────────
     15. FLOATING BTNS — hide on scroll up, show down
  ───────────────────────────────── */
  let lastScroll = 0;
  const floatingCtas = document.querySelector('.floating-ctas');

  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    if (curr > 300) {
      floatingCtas.style.opacity = '1';
      floatingCtas.style.transform = 'translateY(0)';
    } else {
      floatingCtas.style.opacity = '0';
      floatingCtas.style.transform = 'translateY(20px)';
    }
    lastScroll = curr;
  }, { passive: true });

  // Initial state
  floatingCtas.style.opacity = '0';
  floatingCtas.style.transform = 'translateY(20px)';
  floatingCtas.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

})();