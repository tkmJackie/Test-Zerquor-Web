const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const faders = document.querySelectorAll('.fade-up');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  faders.forEach((el) => io.observe(el));
} else {
  faders.forEach((el) => el.classList.add('visible'));
}

const navLinks = document.querySelectorAll('.nav a');
const sections = [...document.querySelectorAll('main section[id]')];

const activateNav = () => {
  const offset = window.scrollY + 120;
  let currentId = '';

  sections.forEach((section) => {
    if (offset >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
};

window.addEventListener('scroll', activateNav);
activateNav();

const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (form && formMessage) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    formMessage.textContent = `${name} 様、お問い合わせありがとうございます。このデモサイトでは送信処理は実装していません。実運用時にはサーバー連携またはフォームサービスと接続してください。`;
    form.reset();
  });
}
