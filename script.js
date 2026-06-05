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
  }, {
    threshold: 0.16
  });

  faders.forEach((el) => io.observe(el));
} else {
  faders.forEach((el) => el.classList.add('visible'));
}

const navLinks = document.querySelectorAll('.nav a');
const currentPath = window.location.pathname.split('/').pop() || 'index.html';

navLinks.forEach((link) => {
  const href = link.getAttribute('href');

  if (href === currentPath) {
    link.classList.add('active');
  }
});

const WORKER_BASE_URL = 'https://connpass-api.tkm12325.workers.dev';

const topUpcomingEventsContainer = document.getElementById('upcoming-events');
const eventsPageUpcomingContainer = document.getElementById('events-page-upcoming');
const pastEventsContainer = document.getElementById('past-events');

if (topUpcomingEventsContainer) {
  loadConnpassEvents('upcoming', topUpcomingEventsContainer, 6);
}

if (eventsPageUpcomingContainer) {
  loadConnpassEvents('upcoming', eventsPageUpcomingContainer, 20);
}

if (pastEventsContainer) {
  loadConnpassEvents('past', pastEventsContainer, 30);
}

async function loadConnpassEvents(type, container, limit) {
  try {
    const endpoint = type === 'past' ? '/past' : '/upcoming';
    const response = await fetch(`${WORKER_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error('イベント情報の取得に失敗しました');
    }

    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];

    if (events.length === 0) {
      container.innerHTML = `
        <p class="events-message">
          ${type === 'past' ? '過去のセミナー情報はまだありません。' : '現在、開催予定のセミナーはありません。'}
        </p>
      `;
      return;
    }

    container.innerHTML = events
      .slice(0, limit)
      .map((event) => createEventCard(event, type))
      .join('');
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p class="events-message">
        イベント情報を取得できませんでした。connpassページをご確認ください。
      </p>
    `;
  }
}

function createEventCard(event, type) {
  const title = escapeHtml(event.title || 'タイトル未定');
  const url = escapeHtml(event.event_url || 'https://zerquor.connpass.com/');
  const place = escapeHtml(event.place || event.address || 'オンライン / 詳細はconnpassをご確認ください');
  const date = escapeHtml(formatEventDate(event.started_at));

  const accepted = Number.isFinite(event.accepted) ? event.accepted : null;
  const limit = Number.isFinite(event.limit) ? event.limit : null;

  let meta = '';

  if (accepted !== null && limit !== null && limit > 0) {
    meta = `${accepted} / ${limit} 名`;
  } else if (accepted !== null) {
    meta = `${accepted} 名参加`;
  } else {
    meta = type === 'past' ? '開催終了' : '詳細はconnpassをご確認ください';
  }

  return `
    <article class="event-card">
      <p class="event-date">${date}</p>
      <h3 class="event-title">${title}</h3>
      <p class="event-place">${place}</p>
      <p class="event-meta">${escapeHtml(meta)}</p>
      <a class="event-link" href="${url}" target="_blank" rel="noopener noreferrer">
        ${type === 'past' ? '開催ページを見る' : '詳細を見る'}
      </a>
    </article>
  `;
}

function formatEventDate(dateString) {
  if (!dateString) {
    return '開催日未定';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '開催日未定';
  }

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
