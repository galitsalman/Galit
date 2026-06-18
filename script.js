(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const body = document.body;
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;

  function safeLocalGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeLocalSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  /* תפריט מובייל */
  const menuBtn = $('#menuBtn');
  const primaryNav = $('#primaryNav');
  function setMenu(open) {
    body.classList.toggle('menu-open', !!open);
    menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMenu(false);
      $('#access')?.classList.remove('open');
    }
  });
  document.addEventListener('click', event => {
    if (!body.classList.contains('menu-open')) return;
    if (primaryNav?.contains(event.target) || menuBtn?.contains(event.target)) return;
    setMenu(false);
  });

  /* פס התקדמות */
  const progress = $('#progress');
  function updateProgress() {
    if (!progress) return;
    const max = root.scrollHeight - root.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* אנימציות כניסה */
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12 });
    revealItems.forEach(el => io.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('visible'));
  }

  /* אפקטים רק במחשב, לא בנייד */
  if (supportsFinePointer && !prefersReducedMotion) {
    const cursor = $('#cursor');
    window.addEventListener('pointermove', event => {
      root.style.setProperty('--mx', `${event.clientX}px`);
      root.style.setProperty('--my', `${event.clientY}px`);
      if (cursor) {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      }
    }, { passive: true });

    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateY(${x * -7}deg) rotateX(${y * 7}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', event => {
        const rect = el.getBoundingClientRect();
        el.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.12}px, ${(event.clientY - rect.top - rect.height / 2) * 0.12}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* סליידר עדויות */
  const slides = $$('.slide');
  let slideIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
  function showSlide(nextIndex) {
    if (!slides.length) return;
    slides[slideIndex]?.classList.remove('active');
    slideIndex = (nextIndex + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
  }
  $('#next')?.addEventListener('click', () => showSlide(slideIndex + 1));
  $('#prev')?.addEventListener('click', () => showSlide(slideIndex - 1));
  if (slides.length > 1 && !prefersReducedMotion) setInterval(() => showSlide(slideIndex + 1), 5200);

  /* טופס וואטסאפ */
  window.sendWhatsApp = function sendWhatsApp(event) {
    event.preventDefault();
    const privacy = $('#privacy-ok');
    if (privacy && !privacy.checked) {
      privacy.focus();
      return;
    }
    const name = $('#name')?.value.trim() || '';
    const phone = $('#phone')?.value.trim() || '';
    const message = $('#msg')?.value.trim() || '';
    const text = [
      'שלום גלית, אשמח לקבוע שיחת היכרות.',
      `שם: ${name}`,
      `טלפון: ${phone}`,
      `מה מביא אותי: ${message}`
    ].join('\n');
    window.open(`https://wa.me/972507800713?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  /* נגישות */
  const access = $('#access');
  const accessToggle = $('.access-toggle');
  const accessKey = 'galitAccessSettings';
  let fontSize = 100;
  try {
    const saved = JSON.parse(safeLocalGet(accessKey) || '{}');
    if (saved.fontSize) fontSize = Number(saved.fontSize) || 100;
    if (saved.contrast) body.classList.add('high-contrast');
    if (saved.motion) body.classList.add('no-motion');
    root.style.fontSize = `${fontSize}%`;
  } catch (_) {}

  function saveAccess() {
    safeLocalSet(accessKey, JSON.stringify({
      fontSize,
      contrast: body.classList.contains('high-contrast'),
      motion: body.classList.contains('no-motion')
    }));
  }

  accessToggle?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    access?.classList.toggle('open');
  });

  access?.addEventListener('click', event => {
    const action = event.target?.dataset?.act;
    if (!action) return;
    event.preventDefault();
    if (action === 'fontPlus') fontSize = Math.min(132, fontSize + 8);
    if (action === 'fontMinus') fontSize = Math.max(88, fontSize - 8);
    if (action === 'contrast') body.classList.toggle('high-contrast');
    if (action === 'motion') body.classList.toggle('no-motion');
    if (action === 'reset') {
      fontSize = 100;
      body.classList.remove('high-contrast', 'no-motion');
    }
    root.style.fontSize = `${fontSize}%`;
    saveAccess();
  });

  document.addEventListener('click', event => {
    if (!access?.classList.contains('open')) return;
    if (access.contains(event.target)) return;
    access.classList.remove('open');
  });

  /* מדיניות details */
  $$('details').forEach(details => {
    const summary = $('summary', details);
    if (!summary) return;
    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    details.addEventListener('toggle', () => {
      summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    });
  });
  function openHashDetails() {
    const hash = decodeURIComponent(location.hash || '');
    if (!hash) return;
    const target = $(hash);
    if (target?.tagName?.toLowerCase() === 'details') target.open = true;
  }
  window.addEventListener('hashchange', openHashDetails);
  openHashDetails();

  /* הודעת עוגיות */
  const cookieBanner = $('#cookieBanner');
  const cookieKey = 'galitCookieChoice';
  function syncCookieState() {
    const isOpen = !!cookieBanner?.classList.contains('show');
    body.classList.toggle('cookie-open', isOpen);
    if (isOpen) $('.v9-mini-cta')?.classList.remove('show');
  }
  function closeCookie(choice) {
    safeLocalSet(cookieKey, choice);
    cookieBanner?.classList.remove('show');
    syncCookieState();
  }
  $('#cookieAccept')?.addEventListener('click', () => closeCookie('accepted'));
  $('#cookieReject')?.addEventListener('click', () => closeCookie('rejected'));
  if (cookieBanner && !safeLocalGet(cookieKey)) {
    setTimeout(() => {
      cookieBanner.classList.add('show');
      syncCookieState();
    }, 2200);
  }

  /* CTA תחתון עדין - רק בדסקטופ/טאבלט רחב, לא בנייד צפוף */
  const mini = document.createElement('div');
  mini.className = 'v9-mini-cta';
  mini.innerHTML = '<span class="mini-bubble">שיחה חינמית?</span><a href="tel:0507800713" aria-label="התקשרות לגלית סלמן">050-7800713</a>';
  body.appendChild(mini);
  let miniAllowed = false;
  function updateMiniCta() {
    const mobile = window.innerWidth <= 768;
    const cookieOpen = cookieBanner?.classList.contains('show');
    mini.classList.toggle('show', !mobile && miniAllowed && window.scrollY > 520 && !cookieOpen);
  }
  setTimeout(() => { miniAllowed = true; updateMiniCta(); }, 9000);
  window.addEventListener('scroll', updateMiniCta, { passive: true });
  window.addEventListener('resize', updateMiniCta);

  setTimeout(() => body.classList.add('floating-ready'), 7000);
})();
