// =========================================
// Footer year
// =========================================
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// =========================================
// Fade up animation
// =========================================
const faders = document.querySelectorAll('.fade-up');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16
  });

  faders.forEach((el) => io.observe(el));
} else {
  faders.forEach((el) => el.classList.add('visible'));
}


// =========================================
// Active navigation
// =========================================
const navLinks = document.querySelectorAll('.nav a');
const sections = [...document.querySelectorAll('main section[id]')];

const activateNav = () => {
  const offset = window.scrollY + 140;
  let currentId = '';

  sections.forEach((section) => {
    if (offset >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === `#${currentId}`);
  });
};

window.addEventListener('scroll', activateNav, { passive: true });
window.addEventListener('load', activateNav);


// =========================================
// Smooth close for mobile navigation feel
// =========================================
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});
