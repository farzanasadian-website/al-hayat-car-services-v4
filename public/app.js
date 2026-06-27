/* ========================================
   AL HAYAT CAR SERVICES — app.js v2.0
   ======================================== */

(function() {
'use strict';

/* ── Cinematic Intro ── */
function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  if (sessionStorage.getItem('alhayat-intro-shown')) {
    overlay.remove(); return;
  }

  const skip = overlay.querySelector('.intro-skip');
  if (skip) skip.addEventListener('click', dismissIntro);

  setTimeout(dismissIntro, 3200);

  function dismissIntro() {
    overlay.classList.add('hidden');
    sessionStorage.setItem('alhayat-intro-shown', '1');
    setTimeout(() => overlay.remove(), 900);
  }
}

/* ── Navbar ── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });
}

/* ── Hero BG Parallax ── */
function initHeroBg() {
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  bg.classList.add('loaded');

  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.25;
    bg.style.transform = `scale(1) translateY(${y}px)`;
  }, { passive: true });
}

/* ── Scroll Animations ── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));

  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = Array.from(entry.target.children);
        children.forEach((child, i) => {
          setTimeout(() => child.classList.add('visible'), i * 90);
        });
        staggerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.stagger-children').forEach(el => staggerObs.observe(el));
}

/* ── Active Nav ── */
function initActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-menu a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href !== '/' && path.includes(href)) link.classList.add('active');
    else if (href === '/' && (path === '/' || path === '/index.html')) link.classList.add('active');
  });
}

/* ── Lightbox ── */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const counter = document.getElementById('lightboxCounter');
  if (!lightbox) return;

  let items = [];
  let current = 0;

  function open(index) {
    current = index;
    lightboxImg.src = items[current];
    lightbox.classList.add('open');
    document.body.classList.add('no-scroll');
    if (counter) counter.textContent = `${current + 1} / ${items.length}`;
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.classList.remove('no-scroll');
    lightboxImg.src = '';
  }

  function prev() { current = (current - 1 + items.length) % items.length; open(current); }
  function next() { current = (current + 1) % items.length; open(current); }

  function buildItems() {
    items = Array.from(document.querySelectorAll('[data-lightbox]'))
      .map(el => el.getAttribute('data-lightbox'));
  }

  document.querySelectorAll('[data-lightbox]').forEach((el, i) => {
    el.addEventListener('click', () => { buildItems(); open(i); });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });
}

/* ── Gallery Filter ── */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const galleryItems = document.querySelectorAll('[data-category]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const show = filter === 'all' || item.getAttribute('data-category') === filter;
        item.style.display = show ? '' : 'none';
        if (show) {
          requestAnimationFrame(() => item.classList.add('visible'));
        }
      });
    });
  });
}

/* ── Before/After Slider ── */
function initBeforeAfter() {
  document.querySelectorAll('.before-after').forEach(el => {
    const after = el.querySelector('.before-after-after');
    const divider = el.querySelector('.before-after-divider');
    const handle = el.querySelector('.before-after-handle');
    if (!after) return;

    let dragging = false;

    function setPosition(x) {
      const rect = el.getBoundingClientRect();
      const pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
      after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      if (divider) divider.style.left = pct + '%';
      if (handle) handle.style.left = pct + '%';
    }

    el.addEventListener('mousedown', e => { dragging = true; setPosition(e.clientX); });
    el.addEventListener('touchstart', e => { dragging = true; setPosition(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });
    window.addEventListener('touchmove', e => { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('touchend', () => { dragging = false; });
  });
}

/* ── Parallax ── */
function initParallax() {
  const sections = document.querySelectorAll('.parallax-bg');
  if (!sections.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    sections.forEach(bg => {
      const rect = bg.closest('.parallax-section').getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = (rect.top / window.innerHeight) * 60;
      bg.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });
}

/* ── AI Health Check ── */
function initHealthCheck() {
  const form = document.getElementById('healthCheckForm');
  if (!form) return;

  const questions = [
    {
      id: 'mileage',
      label: 'Current Mileage',
      options: ['Under 10,000 km', '10,000–50,000 km', '50,000–100,000 km', 'Over 100,000 km'],
      parts: { 'Over 100,000 km': ['engine','suspension','brakes'] }
    },
    {
      id: 'oil',
      label: 'Last Oil Change',
      options: ['Under 3 months', '3–6 months ago', '6–12 months ago', 'Over 1 year ago'],
      parts: { 'Over 1 year ago': ['engine'], '6–12 months ago': ['engine'] }
    },
    {
      id: 'brakes',
      label: 'Brake Performance',
      options: ['Excellent', 'Slight noise', 'Vibration', 'Poor stopping'],
      parts: { 'Slight noise': ['brakes'], 'Vibration': ['brakes','suspension'], 'Poor stopping': ['brakes'] }
    },
    {
      id: 'warning',
      label: 'Warning Lights',
      options: ['None', 'Engine light', 'Battery light', 'Multiple lights'],
      parts: { 'Engine light': ['engine'], 'Battery light': ['battery'], 'Multiple lights': ['engine','battery'] }
    },
    {
      id: 'ac',
      label: 'A/C Cooling',
      options: ['Excellent', 'Slightly warm', 'Not cooling', 'Not working'],
      parts: { 'Slightly warm': ['ac'], 'Not cooling': ['ac'], 'Not working': ['ac'] }
    },
    {
      id: 'suspension',
      label: 'Suspension / Noise',
      options: ['No issues', 'Slight vibration', 'Knocking noise', 'Heavy vibration'],
      parts: { 'Slight vibration': ['suspension'], 'Knocking noise': ['suspension'], 'Heavy vibration': ['suspension','tyres'] }
    }
  ];

  const answers = {};
  let currentQ = 0;

  const qContainer = document.getElementById('hcQuestions');
  const carSvg = document.getElementById('carDiagram');
  const scoreNum = document.getElementById('healthScoreNum');
  const scoreCircle = document.getElementById('healthScoreCircle');
  const resultSection = document.getElementById('hcResult');
  const resultTags = document.getElementById('hcResultTags');
  const submitBtn = document.getElementById('hcSubmit');

  function renderQuestion(index) {
    if (!qContainer) return;
    const q = questions[index];
    qContainer.innerHTML = `
      <div class="hc-question visible">
        <div class="hc-question-label">${q.label}</div>
        <div class="hc-options">
          ${q.options.map(opt => `
            <button class="hc-option ${answers[q.id] === opt ? 'selected' : ''}"
              data-q="${q.id}" data-v="${opt}">${opt}</button>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:0.5rem;margin-top:1.5rem;align-items:center;">
        ${index > 0 ? '<button class="btn btn-ghost" id="hcPrev" style="padding:0.5rem 1rem;font-size:0.8rem;">← Back</button>' : ''}
        <span style="font-size:0.72rem;color:var(--text-muted);margin-left:auto;">${index + 1} / ${questions.length}</span>
        ${index < questions.length - 1
          ? '<button class="btn btn-primary" id="hcNext" style="padding:0.5rem 1.2rem;font-size:0.8rem;">Next →</button>'
          : '<button class="btn btn-primary" id="hcAnalyze" style="padding:0.5rem 1.2rem;font-size:0.8rem;">Analyze →</button>'
        }
      </div>
    `;

    qContainer.querySelectorAll('.hc-option').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[btn.dataset.q] = btn.dataset.v;
        qContainer.querySelectorAll('.hc-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateCarDiagram();
      });
    });

    const nextBtn = document.getElementById('hcNext');
    const prevBtn = document.getElementById('hcPrev');
    const analyzeBtn = document.getElementById('hcAnalyze');

    if (nextBtn) nextBtn.addEventListener('click', () => { currentQ++; renderQuestion(currentQ); });
    if (prevBtn) prevBtn.addEventListener('click', () => { currentQ--; renderQuestion(currentQ); });
    if (analyzeBtn) analyzeBtn.addEventListener('click', showResults);
  }

  function updateCarDiagram() {
    if (!carSvg) return;
    const affectedParts = new Set();
    questions.forEach(q => {
      const val = answers[q.id];
      if (val && q.parts[val]) q.parts[val].forEach(p => affectedParts.add(p));
    });

    carSvg.querySelectorAll('.car-part').forEach(part => {
      const pid = part.getAttribute('data-part');
      part.classList.remove('warning', 'critical', 'good');
      if (affectedParts.has(pid)) part.classList.add('warning');
    });
  }

  function showResults() {
    const affectedParts = new Set();
    questions.forEach(q => {
      const val = answers[q.id];
      if (val && q.parts[val]) q.parts[val].forEach(p => affectedParts.add(p));
    });

    const total = affectedParts.size;
    const score = Math.max(20, Math.min(100, 100 - (total * 15)));

    if (scoreNum) scoreNum.textContent = score + '%';
    if (scoreCircle) {
      const circumference = 2 * Math.PI * 40;
      const offset = circumference - (score / 100) * circumference;
      scoreCircle.style.strokeDasharray = circumference;
      scoreCircle.style.strokeDashoffset = offset;
      scoreCircle.style.stroke = score >= 80 ? '#22C55E' : score >= 50 ? '#F97316' : '#EF4444';
    }

    if (resultTags) {
      const services = [];
      if (affectedParts.has('engine')) services.push({ label: 'Engine Service', level: 'urgent' });
      if (affectedParts.has('battery')) services.push({ label: 'Battery Check', level: 'urgent' });
      if (affectedParts.has('brakes')) services.push({ label: 'Brake Service', level: 'urgent' });
      if (affectedParts.has('ac')) services.push({ label: 'A/C Service', level: 'soon' });
      if (affectedParts.has('suspension')) services.push({ label: 'Suspension Check', level: 'soon' });
      if (affectedParts.has('tyres')) services.push({ label: 'Tyre Inspection', level: 'optional' });
      if (!services.length) services.push({ label: 'Full Service Check', level: 'optional' });

      const msg = encodeURIComponent('Hi, I completed the Vehicle Health Check and would like to book a service.');
      resultTags.innerHTML = services.map(s =>
        `<span class="hc-service-tag ${s.level}">${s.label}</span>`
      ).join('') + `<div style="margin-top:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap;">
        <a href="https://wa.me/971522553418?text=${msg}" target="_blank" class="btn btn-whatsapp" style="font-size:0.82rem;padding:0.6rem 1.2rem;">
          📱 Book via WhatsApp
        </a>
        <a href="tel:+971522553418" class="btn btn-secondary" style="font-size:0.82rem;padding:0.6rem 1.2rem;">
          📞 Call Us
        </a>
      </div>`;
    }

    if (resultSection) resultSection.classList.add('visible');
  }

  renderQuestion(0);
}

/* ── Maintenance Timeline Input ── */
function initTimeline() {
  const input = document.getElementById('timelineMileage');
  if (!input) return;

  input.addEventListener('input', () => {
    const km = parseInt(input.value) || 0;
    document.querySelectorAll('.timeline-item').forEach(item => {
      const threshold = parseInt(item.getAttribute('data-km')) || 0;
      item.classList.toggle('active', km >= threshold);
    });
  });
}

/* ── Init All ── */
document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initNavbar();
  initMobileMenu();
  initHeroBg();
  initScrollAnimations();
  initActiveNav();
  initLightbox();
  initGalleryFilter();
  initBeforeAfter();
  initParallax();
  initHealthCheck();
  initTimeline();
});

})();
