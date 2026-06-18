
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const root = document.documentElement;
  const menuBtn = $('#menuBtn');
  const nav = $('#primaryNav');
  function setMenu(open){
    body.classList.toggle('menu-open', !!open);
    menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if(e.key === 'Escape'){ setMenu(false); $('#access')?.classList.remove('open'); }});

  const progress = $('#progress');
  if(progress){
    addEventListener('scroll', () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.transform = `scaleX(${max ? h.scrollTop / max : 0})`;
    }, {passive:true});
  }

  const reveal = $$('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), {threshold:.1});
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add('visible'));

  const slides = $$('.slide');
  let idx = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
  function show(n){ if(!slides.length) return; slides[idx]?.classList.remove('active'); idx = (n + slides.length) % slides.length; slides[idx].classList.add('active'); }
  $('#next')?.addEventListener('click', () => show(idx+1));
  $('#prev')?.addEventListener('click', () => show(idx-1));
  if(slides.length > 1) setInterval(() => show(idx+1), 5200);

  window.sendWhatsApp = function(e){
    e.preventDefault();
    const ok = $('#privacy-ok');
    if(ok && !ok.checked){ ok.focus(); return; }
    const name = ($('#name')?.value || '').trim();
    const phone = ($('#phone')?.value || '').trim();
    const msg = ($('#msg')?.value || '').trim();
    const text = `שלום גלית, אשמח לקבוע שיחת היכרות.\nשם: ${name}\nטלפון: ${phone}\nמה מביא אותי: ${msg}`;
    window.open('https://wa.me/972507800713?text=' + encodeURIComponent(text), '_blank', 'noopener');
  };

  const access = $('#access');
  const accessToggle = $('.access-toggle');
  let fs = Number(localStorage.getItem('galitFontSize') || 100);
  root.style.fontSize = fs + '%';
  if(localStorage.getItem('galitContrast') === '1') body.classList.add('high-contrast');
  if(localStorage.getItem('galitMotion') === '1') body.classList.add('no-motion');
  accessToggle?.addEventListener('click', () => access?.classList.toggle('open'));
  access?.addEventListener('click', e => {
    const act = e.target?.dataset?.act;
    if(!act) return;
    if(act === 'fontPlus') fs = Math.min(140, fs + 8);
    if(act === 'fontMinus') fs = Math.max(85, fs - 8);
    if(act === 'contrast') body.classList.toggle('high-contrast');
    if(act === 'motion') body.classList.toggle('no-motion');
    if(act === 'reset') { fs = 100; body.classList.remove('high-contrast','no-motion'); }
    root.style.fontSize = fs + '%';
    localStorage.setItem('galitFontSize', String(fs));
    localStorage.setItem('galitContrast', body.classList.contains('high-contrast') ? '1' : '0');
    localStorage.setItem('galitMotion', body.classList.contains('no-motion') ? '1' : '0');
  });

  $$('details').forEach(d => {
    const s = $('summary', d);
    if(!s) return;
    s.setAttribute('role','button');
    s.setAttribute('aria-expanded', d.open ? 'true' : 'false');
    d.addEventListener('toggle', () => s.setAttribute('aria-expanded', d.open ? 'true' : 'false'));
  });

  const mini = document.createElement('div');
  mini.className = 'v9-mini-cta';
  mini.innerHTML = '<span class="mini-bubble">שיחה חינמית?</span><a href="tel:0507800713">050-7800713</a>';
  body.appendChild(mini);
  let miniAllowed = false;
  function showMini(){
    const cookieOpen = $('#cookieBanner')?.classList.contains('show');
    const ok = miniAllowed && scrollY > 520 && !cookieOpen && innerWidth > 920;
    mini.classList.toggle('show', ok);
  }
  setTimeout(() => { miniAllowed = true; showMini(); }, 9000);
  addEventListener('scroll', showMini, {passive:true});

  const cookie = $('#cookieBanner');
  const cookieKey = 'galitCookieChoice';
  const syncFloating = () => body.classList.toggle('cookie-open', !!cookie?.classList.contains('show'));
  if(cookie && !localStorage.getItem(cookieKey)){
    setTimeout(() => { cookie.classList.add('show'); syncFloating(); showMini(); }, innerWidth <= 920 ? 3500 : 1400);
  }
  function closeCookie(choice){ localStorage.setItem(cookieKey, choice); cookie?.classList.remove('show'); syncFloating(); showMini(); }
  $('#cookieAccept')?.addEventListener('click', () => closeCookie('accepted'));
  $('#cookieReject')?.addEventListener('click', () => closeCookie('rejected'));

  const navLinks = $$('.nav-links a[href^="#"]');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window){
    const spy = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = '#' + entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    }), {rootMargin:'-45% 0px -48% 0px'});
    sections.forEach(s => spy.observe(s));
  }
})();
