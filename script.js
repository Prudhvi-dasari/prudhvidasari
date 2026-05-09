/* =================== CURSOR =================== */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; });
(function animFollower() { fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12; follower.style.left = fx + 'px'; follower.style.top = fy + 'px'; requestAnimationFrame(animFollower); })();
document.querySelectorAll('a, button, .project-card, .article-card').forEach(el => {
  el.addEventListener('mouseenter', () => { follower.style.transform = 'translate(-50%,-50%) scale(2)'; follower.style.opacity = '.5'; });
  el.addEventListener('mouseleave', () => { follower.style.transform = 'translate(-50%,-50%) scale(1)'; follower.style.opacity = '1'; });
});

/* =================== NAV =================== */
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); });
hamburger.addEventListener('click', () => { mobileMenu.classList.toggle('open'); });
document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));

/* =================== PARTICLES =================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '167,139,250' : '99,102,241';
  }
  update() {
    this.x += this.speedX; this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
    ctx.fill();
  }
}
for (let i = 0; i < 80; i++) particles.push(new Particle());
function animParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  // Connect nearby
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        ctx.strokeStyle = `rgba(167,139,250,${0.08 * (1 - dist/100)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animParticles);
}
animParticles();

/* =================== TYPED TEXT =================== */
const words = ['Convert.', 'Perform.', 'Stand Out.', 'Scale Fast.', 'Wow Clients.'];
let wi = 0, ci = 0, deleting = false;
const typedEl = document.getElementById('typed');
function typeLoop() {
  const word = words[wi];
  typedEl.textContent = deleting ? word.substring(0, ci--) : word.substring(0, ci++);
  let delay = deleting ? 60 : 100;
  if (!deleting && ci > word.length) { delay = 1800; deleting = true; }
  else if (deleting && ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; delay = 300; }
  setTimeout(typeLoop, delay);
}
typeLoop();

/* =================== REVEAL ON SCROLL =================== */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
reveals.forEach(el => observer.observe(el));

/* =================== COUNTER ANIMATION =================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 25);
}
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(el => animateCounter(el));
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* =================== PROJECT FILTER =================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.classList.toggle('hidden', !match);
        if (match) { requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }); }
      }, 200);
    });
  });
});
projectCards.forEach(card => { card.style.transition = 'opacity .3s, transform .3s'; });

/* =================== CONTACT FORM =================== */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
form.addEventListener('submit', async e => {
  e.preventDefault();
  submitBtn.innerHTML = '<span>Sending...</span>';
  submitBtn.disabled = true;

  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: json
    });
    const data = await res.json();
    if (data.success) {
      submitBtn.innerHTML = '<span>✓ Message Sent!</span>';
      submitBtn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      form.reset();
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (err) {
    submitBtn.innerHTML = '<span>✗ Error — Try Again</span>';
    submitBtn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
  } finally {
    setTimeout(() => {
      submitBtn.innerHTML = '<span>Send Message</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 3500);
  }
});

/* =================== SMOOTH ACTIVE NAV =================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navLinks.forEach(l => { l.style.color = l.getAttribute('href') === '#' + current ? '#e8e8f0' : ''; });
});
