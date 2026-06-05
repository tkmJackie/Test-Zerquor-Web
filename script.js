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

const currentPath = window.location.pathname.split('/').pop() || 'index.html';

navLinks.forEach((link) => {
  const href = link.getAttribute('href');

  if (href === currentPath) {
    link.classList.add('active');
  }
});
