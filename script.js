// 年号自動更新
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// フェードイン（安全版）
const faders = document.querySelectorAll('.fade-up');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  });

  faders.forEach((el) => io.observe(el));
} else {
  faders.forEach((el) => el.classList.add('visible'));
}

// ナビの現在位置ハイライト（安全版）
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});
