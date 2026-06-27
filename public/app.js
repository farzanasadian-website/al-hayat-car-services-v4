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

/* ── Premium Vehicle Health Advisor ── */
function initHealthCheck() {
  if (!document.getElementById('advisorWrap')) return;

  const QUESTIONS = [
    {
      id: 'mileage',
      text: 'What is your current mileage?',
      icon: '📍',
      bg: '/public/assets/exterior-day.jpg',
      system: null,
      options: [
        { label: 'Under 30,000 km', icon: '✅', systems: {}, score: 0 },
        { label: '30,000 – 60,000 km', icon: '🟡', systems: {}, score: 5 },
        { label: '60,000 – 100,000 km', icon: '🟠', systems: { engine: 'soon', tyres: 'soon' }, score: 10 },
        { label: 'Over 100,000 km', icon: '🔴', systems: { engine: 'alert', suspension: 'alert', tyres: 'alert' }, score: 20 }
      ]
    },
    {
      id: 'oil',
      text: 'When was your last oil change?',
      icon: '🛢️',
      bg: '/public/assets/oilchange.png',
      system: 'engine',
      options: [
        { label: 'Within 3 months', icon: '✅', systems: { engine: 'good' }, score: 0 },
        { label: '3 – 6 months ago', icon: '🟡', systems: { engine: 'good' }, score: 5 },
        { label: '6 – 12 months ago', icon: '🟠', systems: { engine: 'alert' }, score: 15 },
        { label: 'Over 1 year ago', icon: '🔴', systems: { engine: 'critical' }, score: 25 }
      ]
    },
    {
      id: 'brakes',
      text: 'How are your brakes performing?',
      icon: '🛑',
      bg: '/public/assets/mechanical-lift.jpg',
      system: 'brakes',
      options: [
        { label: 'Excellent — no issues', icon: '✅', systems: { brakes: 'good' }, score: 0 },
        { label: 'Slight squeaking noise', icon: '🟡', systems: { brakes: 'alert' }, score: 12 },
        { label: 'Vibration when braking', icon: '🟠', systems: { brakes: 'alert', suspension: 'alert' }, score: 18 },
        { label: 'Poor stopping power', icon: '🔴', systems: { brakes: 'critical' }, score: 28 }
      ]
    },
    {
      id: 'warning',
      text: 'Any dashboard warning lights?',
      icon: '⚠️',
      bg: '/public/assets/diagnosis.png',
      system: 'engine',
      options: [
        { label: 'No warning lights', icon: '✅', systems: {}, score: 0 },
        { label: 'Engine / Check engine', icon: '🟠', systems: { engine: 'critical' }, score: 22 },
        { label: 'Battery warning', icon: '🟠', systems: { battery: 'critical' }, score: 20 },
        { label: 'Multiple lights on', icon: '🔴', systems: { engine: 'critical', battery: 'alert' }, score: 30 }
      ]
    },
    {
      id: 'ac',
      text: 'How is your A/C cooling?',
      icon: '❄️',
      bg: '/public/assets/ac-sign.jpg',
      system: 'ac',
      options: [
        { label: 'Ice cold — excellent', icon: '✅', systems: { ac: 'good' }, score: 0 },
        { label: 'Slightly less cool', icon: '🟡', systems: { ac: 'alert' }, score: 8 },
        { label: 'Not cooling properly', icon: '🟠', systems: { ac: 'critical' }, score: 18 },
        { label: 'Not working at all', icon: '🔴', systems: { ac: 'critical' }, score: 25 }
      ]
    },
    {
      id: 'suspension',
      text: 'Any vibration or unusual noise?',
      icon: '🔧',
      bg: '/public/assets/tyre-balance.jpg',
      system: 'suspension',
      options: [
        { label: 'Smooth — no issues', icon: '✅', systems: { suspension: 'good', tyres: 'good' }, score: 0 },
        { label: 'Slight vibration at speed', icon: '🟡', systems: { tyres: 'alert' }, score: 10 },
        { label: 'Knocking or clunking', icon: '🟠', systems: { suspension: 'alert' }, score: 18 },
        { label: 'Heavy vibration', icon: '🔴', systems: { suspension: 'critical', tyres: 'alert' }, score: 25 }
      ]
    }
  ];

  const SYSTEM_LABELS = {
    engine: 'Engine', ac: 'A/C System',
    brakes: 'Brakes', battery: 'Battery',
    tyres: 'Tyres', suspension: 'Suspension'
  };

  const SYSTEM_STATUS_TEXT = {
    good: 'Good condition', alert: 'Needs attention',
    critical: 'Service required', '': 'Not checked'
  };

  const SERVICE_MAP = {
    engine: { label: 'Engine Service', level: 'urgent' },
    battery: { label: 'Battery Check', level: 'urgent' },
    brakes: { label: 'Brake Service', level: 'urgent' },
    ac: { label: 'A/C Service', level: 'soon' },
    suspension: { label: 'Suspension Check', level: 'soon' },
    tyres: { label: 'Tyre Inspection', level: 'optional' }
  };

  let current = 0;
  let answers = {};
  let systemState = {}; // { engine: 'alert', brakes: 'good', ... }
  let totalDeduction = 0;

  const els = {
    area: document.getElementById('advisorQuestionArea'),
    stepLabel: document.getElementById('advisorStepLabel'),
    progress: document.getElementById('advisorProgress'),
    back: document.getElementById('advisorBack'),
    next: document.getElementById('advisorNext'),
    bg: document.getElementById('advisorBg'),
    scoreCircle: document.getElementById('advisorScoreCircle'),
    scoreNum: document.getElementById('advisorScoreNum'),
    scoreValue: document.getElementById('advisorScoreValue'),
    scoreSub: document.getElementById('advisorScoreSub'),
    resultBar: document.getElementById('advisorResultBar'),
    resultServices: document.getElementById('advisorResultServices')
  };

  // Expose reset globally for "Start Over" button
  window.advisorReset = function() {
    current = 0; answers = {}; systemState = {}; totalDeduction = 0;
    Object.keys(SYSTEM_LABELS).forEach(k => updateSystemCard(k, ''));
    updateScore(100);
    if (els.resultBar) els.resultBar.classList.remove('visible');
    if (els.next) { els.next.textContent = 'Next →'; els.next.style.background = ''; }
    render();
  };

  function render() {
    if (!els.area) return;
    const q = QUESTIONS[current];

    // Step label & progress
    if (els.stepLabel) els.stepLabel.textContent = `Step ${current + 1} of ${QUESTIONS.length}`;
    if (els.progress) {
      const dots = els.progress.querySelectorAll('.advisor-progress-dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.classList.toggle('done', i < current);
      });
    }

    // Back button
    if (els.back) els.back.disabled = current === 0;

    // Next button label
    if (els.next) {
      els.next.textContent = current === QUESTIONS.length - 1 ? 'See Results →' : 'Next →';
    }

    // Background image
    if (els.bg && q.bg) {
      els.bg.style.backgroundImage = `url('${q.bg}')`;
    }

    // Render question
    const selectedVal = answers[q.id];
    els.area.innerHTML = `
      <div class="advisor-question visible">
        <div class="advisor-q-text">${q.text}</div>
        <div class="advisor-options">
          ${q.options.map((opt, i) => `
            <button class="advisor-opt ${selectedVal === i ? 'selected' : ''}"
              data-idx="${i}" type="button">
              <span class="advisor-opt-icon">${opt.icon}</span>
              <span style="flex:1;">${opt.label}</span>
              <span class="advisor-opt-check">${selectedVal === i ? '✓' : ''}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Bind option clicks
    els.area.querySelectorAll('.advisor-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        selectOption(q, idx);
      });
    });
  }

  function selectOption(q, idx) {
    const opt = q.options[idx];
    answers[q.id] = idx;

    // Apply system states from this answer
    Object.entries(opt.systems).forEach(([sys, state]) => {
      // Only worsen, never improve (unless explicitly 'good')
      const current = systemState[sys] || '';
      const priority = { '': 0, 'good': 1, 'alert': 2, 'critical': 3 };
      if ((priority[state] || 0) >= (priority[current] || 0)) {
        systemState[sys] = state;
        updateSystemCard(sys, state);
      }
    });

    // Recalculate total score
    totalDeduction = 0;
    Object.keys(answers).forEach(qid => {
      const qi = QUESTIONS.find(x => x.id === qid);
      if (qi) totalDeduction += qi.options[answers[qid]].score;
    });
    const score = Math.max(10, 100 - totalDeduction);
    updateScore(score);

    // Re-render to show selection
    render();
  }

  function updateSystemCard(sys, state) {
    const card = document.getElementById(`sys-${sys}`);
    const statusEl = document.getElementById(`sys-${sys}-status`);
    if (!card || !statusEl) return;
    card.className = 'advisor-system-card' + (state ? ` ${state}` : '');
    statusEl.textContent = SYSTEM_STATUS_TEXT[state] || 'Not checked';
  }

  function updateScore(score) {
    const circumference = 251.2;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#22C55E' : score >= 55 ? '#F97316' : '#EF4444';
    const label = score >= 80 ? 'Good Condition' : score >= 55 ? 'Needs Attention' : 'Service Required';
    const answered = Object.keys(answers).length;
    const sub = answered === QUESTIONS.length
      ? `Based on your ${QUESTIONS.length} responses`
      : `${answered} of ${QUESTIONS.length} questions answered`;

    if (els.scoreCircle) {
      els.scoreCircle.style.strokeDashoffset = offset;
      els.scoreCircle.style.stroke = color;
    }
    if (els.scoreNum) { els.scoreNum.textContent = score + '%'; els.scoreNum.style.color = color; }
    if (els.scoreValue) { els.scoreValue.textContent = label; els.scoreValue.style.color = color; }
    if (els.scoreSub) els.scoreSub.textContent = sub;
  }

  function showResults() {
    // Collect all affected systems
    const urgentSystems = new Set();
    const soonSystems = new Set();
    const optionalSystems = new Set();

    Object.entries(systemState).forEach(([sys, state]) => {
      if (state === 'critical') urgentSystems.add(sys);
      else if (state === 'alert') soonSystems.add(sys);
    });

    // Build service pills
    const pills = [];
    urgentSystems.forEach(sys => {
      if (SERVICE_MAP[sys]) pills.push({ ...SERVICE_MAP[sys], level: 'urgent' });
    });
    soonSystems.forEach(sys => {
      if (SERVICE_MAP[sys] && !urgentSystems.has(sys)) pills.push({ ...SERVICE_MAP[sys], level: 'soon' });
    });

    if (!pills.length) pills.push({ label: 'Routine Service Check', level: 'optional' });

    if (els.resultServices) {
      els.resultServices.innerHTML = pills.map((p, i) =>
        `<span class="advisor-service-pill ${p.level}" style="animation-delay:${i * 0.08}s">${p.label}</span>`
      ).join('');
    }
    if (els.resultBar) els.resultBar.classList.add('visible');
  }

  // Next / Back handlers
  if (els.next) {
    els.next.addEventListener('click', () => {
      const q = QUESTIONS[current];
      if (answers[q.id] === undefined) {
        // Shake hint — select something first
        els.area.querySelector('.advisor-options').style.animation = 'none';
        els.area.querySelector('.advisor-options').offsetHeight;
        return;
      }
      if (current < QUESTIONS.length - 1) {
        current++;
        render();
      } else {
        showResults();
        els.next.textContent = '✓ Done';
        els.next.style.background = '#22C55E';
      }
    });
  }

  if (els.back) {
    els.back.addEventListener('click', () => {
      if (current > 0) { current--; render(); }
    });
  }

  // Init
  render();
  updateScore(100);
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
