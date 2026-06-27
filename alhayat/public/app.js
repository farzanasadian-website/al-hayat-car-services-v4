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

  // ── Data ──────────────────────────────────────────────
  var isArabic = document.documentElement.lang === 'ar';

  var QUESTIONS = isArabic ? [
    { id:'mileage', text:'ما هو عداد المسافات الحالي لسيارتك؟',
      options:[
        { label:'أقل من 30,000 كم',      risk:{} },
        { label:'30,000 – 60,000 كم',    risk:{} },
        { label:'60,000 – 100,000 كم',   risk:{engine:'alert', tyres:'alert'} },
        { label:'أكثر من 100,000 كم',    risk:{engine:'alert', suspension:'alert', tyres:'alert'} }
      ]
    },
    { id:'oil', text:'متى كان آخر تغيير للزيت؟',
      options:[
        { label:'خلال 3 أشهر',           risk:{engine:'good'} },
        { label:'منذ 3 – 6 أشهر',        risk:{engine:'good'} },
        { label:'منذ 6 – 12 شهراً',      risk:{engine:'alert'} },
        { label:'منذ أكثر من سنة',       risk:{engine:'critical'} }
      ]
    },
    { id:'brakes', text:'كيف أداء الفرامل؟',
      options:[
        { label:'ممتازة — لا مشاكل',    risk:{brakes:'good'} },
        { label:'صوت طرق خفيف',         risk:{brakes:'alert'} },
        { label:'اهتزاز عند الكبح',     risk:{brakes:'alert', suspension:'alert'} },
        { label:'ضعف في قوة الإيقاف',   risk:{brakes:'critical'} }
      ]
    },
    { id:'warning', text:'هل توجد أضواء تحذير على لوحة القيادة؟',
      options:[
        { label:'لا توجد أضواء تحذير', risk:{} },
        { label:'ضوء المحرك',           risk:{engine:'critical'} },
        { label:'ضوء البطارية',         risk:{battery:'critical'} },
        { label:'أضواء متعددة',         risk:{engine:'critical', battery:'alert'} }
      ]
    },
    { id:'ac', text:'كيف تبريد مكيف الهواء؟',
      options:[
        { label:'بارد جداً — ممتاز',    risk:{ac:'good'} },
        { label:'أقل برودة قليلاً',     risk:{ac:'alert'} },
        { label:'لا يبرد بشكل صحيح',   risk:{ac:'critical'} },
        { label:'لا يعمل على الإطلاق', risk:{ac:'critical'} }
      ]
    },
    { id:'suspension', text:'هل تشعر باهتزاز أو أصوات غير عادية؟',
      options:[
        { label:'ناعمة — لا مشاكل',    risk:{suspension:'good', tyres:'good'} },
        { label:'اهتزاز خفيف بالسرعة', risk:{tyres:'alert'} },
        { label:'صوت طرق أو طقطقة',    risk:{suspension:'alert'} },
        { label:'اهتزاز شديد',         risk:{suspension:'critical', tyres:'alert'} }
      ]
    }
  ] : [
    { id:'mileage', text:'What is your current mileage?',
      options:[
        { label:'Under 30,000 km',      risk:{} },
        { label:'30,000 – 60,000 km',   risk:{} },
        { label:'60,000 – 100,000 km',  risk:{engine:'alert', tyres:'alert'} },
        { label:'Over 100,000 km',      risk:{engine:'alert', suspension:'alert', tyres:'alert'} }
      ]
    },
    { id:'oil', text:'When was your last oil change?',
      options:[
        { label:'Within 3 months',      risk:{engine:'good'} },
        { label:'3 – 6 months ago',     risk:{engine:'good'} },
        { label:'6 – 12 months ago',    risk:{engine:'alert'} },
        { label:'Over 1 year ago',      risk:{engine:'critical'} }
      ]
    },
    { id:'brakes', text:'How are your brakes performing?',
      options:[
        { label:'Excellent — no issues', risk:{brakes:'good'} },
        { label:'Slight squeaking noise', risk:{brakes:'alert'} },
        { label:'Vibration when braking', risk:{brakes:'alert', suspension:'alert'} },
        { label:'Poor stopping power',   risk:{brakes:'critical'} }
      ]
    },
    { id:'warning', text:'Any dashboard warning lights?',
      options:[
        { label:'No warning lights',    risk:{} },
        { label:'Engine / Check engine', risk:{engine:'critical'} },
        { label:'Battery warning',      risk:{battery:'critical'} },
        { label:'Multiple lights on',   risk:{engine:'critical', battery:'alert'} }
      ]
    },
    { id:'ac', text:'How is your A/C cooling?',
      options:[
        { label:'Ice cold — excellent', risk:{ac:'good'} },
        { label:'Slightly less cool',   risk:{ac:'alert'} },
        { label:'Not cooling properly', risk:{ac:'critical'} },
        { label:'Not working at all',   risk:{ac:'critical'} }
      ]
    },
    { id:'suspension', text:'Any vibration or unusual noise?',
      options:[
        { label:'Smooth — no issues',   risk:{suspension:'good', tyres:'good'} },
        { label:'Slight vibration at speed', risk:{tyres:'alert'} },
        { label:'Knocking or clunking', risk:{suspension:'alert'} },
        { label:'Heavy vibration',      risk:{suspension:'critical', tyres:'alert'} }
      ]
    }
  ];

  var SYSTEMS = ['engine','ac','brakes','battery','tyres','suspension'];

  var SYS_LABELS = isArabic ? {
    engine:'المحرك', ac:'مكيف الهواء', brakes:'الفرامل',
    battery:'البطارية', tyres:'الإطارات', suspension:'نظام التعليق'
  } : {
    engine:'Engine', ac:'A/C System', brakes:'Brakes',
    battery:'Battery', tyres:'Tyres', suspension:'Suspension'
  };

  var SYS_STATUS_TEXT = isArabic ? {
    good:'حالة جيدة', alert:'يحتاج اهتماماً', critical:'يتطلب صيانة', '':'لم يتم الفحص'
  } : {
    good:'Good condition', alert:'Needs attention', critical:'Service required', '':'Not checked'
  };

  var SERVICE_MAP = isArabic ? {
    engine:   { label:'صيانة المحرك',      level:'urgent' },
    battery:  { label:'فحص البطارية',      level:'urgent' },
    brakes:   { label:'صيانة الفرامل',     level:'urgent' },
    ac:       { label:'صيانة مكيف الهواء', level:'soon' },
    suspension:{ label:'فحص نظام التعليق', level:'soon' },
    tyres:    { label:'فحص الإطارات',      level:'optional' }
  } : {
    engine:   { label:'Engine Service',    level:'urgent' },
    battery:  { label:'Battery Check',     level:'urgent' },
    brakes:   { label:'Brake Service',     level:'urgent' },
    ac:       { label:'A/C Service',       level:'soon' },
    suspension:{ label:'Suspension Check', level:'soon' },
    tyres:    { label:'Tyre Inspection',   level:'optional' }
  };

  var PRIORITY = { '':0, good:1, alert:2, critical:3 };

  // ── State ─────────────────────────────────────────────
  var current = 0;
  var answers = {}; // { mileage: 2, oil: 0, ... }

  // ── DOM refs ──────────────────────────────────────────
  var el = {
    area:          document.getElementById('advisorQuestionArea'),
    stepLabel:     document.getElementById('advisorStepLabel'),
    progress:      document.getElementById('advisorProgress'),
    back:          document.getElementById('advisorBack'),
    next:          document.getElementById('advisorNext'),
    scoreCircle:   document.getElementById('advisorScoreCircle'),
    scoreNum:      document.getElementById('advisorScoreNum'),
    scoreValue:    document.getElementById('advisorScoreValue'),
    scoreSub:      document.getElementById('advisorScoreSub'),
    resultBar:     document.getElementById('advisorResultBar'),
    resultServices:document.getElementById('advisorResultServices')
  };

  // ── Core: recalculate everything from scratch ─────────
  function recalculate() {
    // Merge risks from all current answers only
    var merged = {}; // { engine: 'critical', brakes: 'alert', ... }

    QUESTIONS.forEach(function(q) {
      var idx = answers[q.id];
      if (idx === undefined) return;
      var opt = q.options[idx];
      Object.keys(opt.risk).forEach(function(sys) {
        var newState = opt.risk[sys];
        var curState = merged[sys] || '';
        if ((PRIORITY[newState] || 0) > (PRIORITY[curState] || 0)) {
          merged[sys] = newState;
        }
      });
    });

    return merged;
  }

  // ── Update system cards based on merged state ─────────
  function updateSystems(merged) {
    SYSTEMS.forEach(function(sys) {
      var card   = document.getElementById('sys-' + sys);
      var status = document.getElementById('sys-' + sys + '-status');
      if (!card || !status) return;
      var state = merged[sys] || '';
      card.className = 'advisor-system-card' + (state ? ' ' + state : '');
      status.textContent = SYS_STATUS_TEXT[state] !== undefined
        ? SYS_STATUS_TEXT[state] : SYS_STATUS_TEXT[''];
    });
  }

  // ── Update score ring ─────────────────────────────────
  function updateScore(merged) {
    var deduction = 0;
    var weights = { critical: 22, alert: 10, good: 0, '': 0 };
    SYSTEMS.forEach(function(sys) {
      deduction += weights[merged[sys] || ''] || 0;
    });
    var score = Math.max(5, Math.min(100, 100 - deduction));

    var circumference = 251.2;
    var offset = circumference - (score / 100) * circumference;
    var color = score >= 80 ? '#22C55E' : score >= 50 ? '#F97316' : '#EF4444';

    var answered = Object.keys(answers).length;
    var total    = QUESTIONS.length;
    var label    = score >= 80
      ? (isArabic ? 'حالة جيدة' : 'Good Condition')
      : score >= 50
        ? (isArabic ? 'يحتاج اهتماماً' : 'Needs Attention')
        : (isArabic ? 'صيانة مطلوبة' : 'Service Required');
    var sub = answered === total
      ? (isArabic ? 'بناءً على إجاباتك' : 'Based on your answers')
      : (isArabic
          ? answered + ' من ' + total + ' أسئلة'
          : answered + ' of ' + total + ' questions answered');

    if (el.scoreCircle) {
      el.scoreCircle.style.strokeDashoffset = offset;
      el.scoreCircle.style.stroke = color;
    }
    if (el.scoreNum)   { el.scoreNum.textContent = score + '%'; el.scoreNum.style.color = color; }
    if (el.scoreValue) { el.scoreValue.textContent = label; el.scoreValue.style.color = color; }
    if (el.scoreSub)   el.scoreSub.textContent = sub;
  }

  // ── Full UI refresh after any answer change ───────────
  function refresh() {
    var merged = recalculate();
    updateSystems(merged);
    updateScore(merged);
  }

  // ── Render current question ───────────────────────────
  function render() {
    if (!el.area) return;
    var q = QUESTIONS[current];

    // Step label
    if (el.stepLabel) el.stepLabel.textContent = isArabic
      ? 'خطوة ' + (current + 1) + ' من ' + QUESTIONS.length
      : 'Step ' + (current + 1) + ' of ' + QUESTIONS.length;

    // Progress dots
    if (el.progress) {
      var dots = el.progress.querySelectorAll('.advisor-progress-dot');
      dots.forEach(function(d, i) {
        d.classList.toggle('active', i === current);
        d.classList.toggle('done', i < current);
      });
    }

    // Back / Next state
    if (el.back) el.back.disabled = current === 0;
    if (el.next) {
      var isLast = current === QUESTIONS.length - 1;
      el.next.textContent = isLast
        ? (isArabic ? 'عرض النتائج ←' : 'See Results →')
        : (isArabic ? 'التالي ←' : 'Next →');
      el.next.style.background = '';
    }

    // Question HTML
    var sel = answers[q.id];
    var opts = q.options.map(function(opt, i) {
      var icons = ['✅','🟡','🟠','🔴'];
      var isSelected = sel === i;
      return '<button class="advisor-opt' + (isSelected ? ' selected' : '') + '" data-idx="' + i + '" type="button">'
        + '<span class="advisor-opt-icon">' + icons[i] + '</span>'
        + '<span style="flex:1;">' + opt.label + '</span>'
        + '<span class="advisor-opt-check">' + (isSelected ? '✓' : '') + '</span>'
        + '</button>';
    }).join('');

    el.area.innerHTML = '<div class="advisor-question visible">'
      + '<div class="advisor-q-text">' + q.text + '</div>'
      + '<div class="advisor-options">' + opts + '</div>'
      + '</div>';

    el.area.querySelectorAll('.advisor-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        answers[q.id] = parseInt(btn.dataset.idx);
        refresh(); // recalculate all from scratch
        render();  // re-render question with new selection
      });
    });
  }

  // ── Show final results ────────────────────────────────
  function showResults() {
    var merged = recalculate();
    var pills = [];

    SYSTEMS.forEach(function(sys) {
      var state = merged[sys];
      if (state === 'critical' || state === 'alert') {
        if (SERVICE_MAP[sys]) {
          var level = state === 'critical' ? 'urgent' : 'soon';
          pills.push({ label: SERVICE_MAP[sys].label, level: level });
        }
      }
    });

    if (!pills.length) {
      pills.push({ label: isArabic ? 'فحص دوري شامل' : 'Routine Service Check', level: 'optional' });
    }

    if (el.resultServices) {
      el.resultServices.innerHTML = pills.map(function(p, i) {
        return '<span class="advisor-service-pill ' + p.level + '" style="animation-delay:' + (i * 0.08) + 's">' + p.label + '</span>';
      }).join('');
    }

    if (el.resultBar) el.resultBar.classList.add('visible');
    if (el.next) { el.next.textContent = isArabic ? '✓ تم' : '✓ Done'; el.next.style.background = '#22C55E'; }
  }

  // ── Reset (exposed globally) ──────────────────────────
  window.advisorReset = function() {
    current = 0;
    answers = {};
    if (el.resultBar) el.resultBar.classList.remove('visible');
    if (el.next) { el.next.textContent = isArabic ? 'التالي ←' : 'Next →'; el.next.style.background = ''; }
    refresh();
    render();
  };

  // ── Nav handlers ──────────────────────────────────────
  if (el.next) {
    el.next.addEventListener('click', function() {
      if (answers[QUESTIONS[current].id] === undefined) return; // must select first
      if (current < QUESTIONS.length - 1) { current++; render(); }
      else showResults();
    });
  }

  if (el.back) {
    el.back.addEventListener('click', function() {
      if (current > 0) { current--; render(); }
    });
  }

  // ── Init ──────────────────────────────────────────────
  refresh();
  render();
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
