// =========================================
// Footer year
// =========================================

const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// =========================================
// Fade animation
// =========================================

const fadeTargets = document.querySelectorAll(".fade-up");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  fadeTargets.forEach((target) => observer.observe(target));
} else {
  fadeTargets.forEach((target) => {
    target.classList.add("visible");
  });
}


// =========================================
// Active navigation
// =========================================

const navLinks = document.querySelectorAll(".nav a");

const currentPage =
  window.location.pathname.split("/").pop() || "index.html";

navLinks.forEach((link) => {
  const href = link.getAttribute("href");

  if (href === currentPage) {
    link.classList.add("active");
  }
});


// =========================================
// Connpass RSS
// =========================================

const WORKER_BASE_URL =
  "https://connpass-api.tkm12325.workers.dev";

const upcomingContainer =
  document.getElementById("upcoming-events");

const allEventsContainer =
  document.getElementById("all-events");

if (upcomingContainer) {
  loadUpcomingEvents();
}

if (allEventsContainer) {
  loadAllEvents();
}


// =========================================
// TOPページ
// =========================================

async function loadUpcomingEvents() {
  try {
    const response = await fetch(
      `${WORKER_BASE_URL}/events`
    );

    if (!response.ok) {
      throw new Error("イベント取得失敗");
    }

    const data = await response.json();

    const events = Array.isArray(data.events)
      ? data.events
      : [];

    if (events.length === 0) {
      upcomingContainer.innerHTML = `
        <p class="events-message">
          現在開催予定のセミナーはありません。
        </p>
      `;
      return;
    }

    upcomingContainer.innerHTML = events
      .slice(0, 10)
      .map(createEventCard)
      .join("");

  } catch (error) {
    console.error(error);

    upcomingContainer.innerHTML = `
      <p class="events-message">
        イベント情報を取得できませんでした。
      </p>
    `;
  }
}


// =========================================
// セミナー一覧ページ
// =========================================

async function loadAllEvents() {
  try {
    const response = await fetch(
      `${WORKER_BASE_URL}/events`
    );

    if (!response.ok) {
      throw new Error("イベント取得失敗");
    }

    const data = await response.json();

    const events = Array.isArray(data.events)
      ? data.events
      : [];

    if (events.length === 0) {
      allEventsContainer.innerHTML = `
        <p class="events-message">
          イベントがありません。
        </p>
      `;
      return;
    }

    allEventsContainer.innerHTML = events
      .map(createEventCard)
      .join("");

  } catch (error) {
    console.error(error);

    allEventsContainer.innerHTML = `
      <p class="events-message">
        イベント情報を取得できませんでした。
      </p>
    `;
  }
}


// =========================================
// Event Card
// =========================================

function createEventCard(event) {
  const title = escapeHtml(
    event.title || "タイトル未設定"
  );

  const eventUrl = escapeHtml(
    event.event_url || "#"
  );

  const date = formatDate(
    event.started_at
  );

  const summary = escapeHtml(
    event.summary || ""
  );

  return `
    <article class="event-card">
      <p class="event-date">
        ${date}
      </p>

      <h3 class="event-title">
        ${title}
      </h3>

      <p class="event-place">
        ${summary}
      </p>

      <a
        class="event-link"
        href="${eventUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        詳細を見る
      </a>
    </article>
  `;
}


// =========================================
// Date format
// =========================================

function formatDate(dateString) {
  if (!dateString) {
    return "日付未定";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "日付未定";
  }

  return date.toLocaleDateString(
    "ja-JP",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }
  );
}


// =========================================
// HTML Escape
// =========================================

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
