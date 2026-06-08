const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const faders = document.querySelectorAll(".fade-up");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16
    }
  );

  faders.forEach((el) => io.observe(el));
} else {
  faders.forEach((el) => el.classList.add("visible"));
}

const navLinks = document.querySelectorAll(".nav a");
const currentPath = window.location.pathname.split("/").pop() || "index.html";

navLinks.forEach((link) => {
  const href = link.getAttribute("href");

  if (href === currentPath) {
    link.classList.add("active");
  }
});

const topUpcomingEventsContainer = document.getElementById("upcoming-events");
const eventsPageUpcomingContainer = document.getElementById("events-page-upcoming");
const pastEventsContainer = document.getElementById("past-events");

if (topUpcomingEventsContainer || eventsPageUpcomingContainer || pastEventsContainer) {
  loadEvents();
}

async function loadEvents() {
  try {
    const response = await fetch("events.json");

    if (!response.ok) {
      throw new Error("events.json の取得に失敗しました");
    }

    const events = await response.json();
    const normalizedEvents = Array.isArray(events) ? events : [];

    const upcomingEvents = normalizedEvents
      .filter((event) => isUpcomingEvent(event))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const pastEvents = normalizedEvents
      .filter((event) => !isUpcomingEvent(event))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (topUpcomingEventsContainer) {
      renderEvents(topUpcomingEventsContainer, upcomingEvents.slice(0, 8), "upcoming");
    }

    if (eventsPageUpcomingContainer) {
      renderEvents(eventsPageUpcomingContainer, upcomingEvents, "upcoming");
    }

    if (pastEventsContainer) {
      renderEvents(pastEventsContainer, pastEvents, "past");
    }
  } catch (error) {
    console.error(error);

    const message = `
      <p class="events-message">
        イベント情報を取得できませんでした。
      </p>
    `;

    if (topUpcomingEventsContainer) {
      topUpcomingEventsContainer.innerHTML = message;
    }

    if (eventsPageUpcomingContainer) {
      eventsPageUpcomingContainer.innerHTML = message;
    }

    if (pastEventsContainer) {
      pastEventsContainer.innerHTML = message;
    }
  }
}

function isUpcomingEvent(event) {
  if (event.status === "past") {
    return false;
  }

  if (event.status === "upcoming") {
    return true;
  }

  const eventDate = new Date(event.date);

  if (Number.isNaN(eventDate.getTime())) {
    return true;
  }

  return eventDate >= new Date();
}

function renderEvents(container, events, type) {
  if (!events || events.length === 0) {
    container.innerHTML = `
      <p class="events-message">
        ${type === "past" ? "過去のセミナー情報はまだありません。" : "現在、開催予定のセミナーはありません。"}
      </p>
    `;
    return;
  }

  container.innerHTML = events.map((event) => createEventCard(event, type)).join("");
}

function createEventCard(event, type) {
  const title = escapeHtml(event.title || "タイトル未定");
  const url = escapeHtml(event.url || "#");
  const place = escapeHtml(event.place || "オンライン / 詳細はリンク先をご確認ください");
  const date = escapeHtml(formatEventDate(event.date));
  const description = escapeHtml(event.description || "");
  const image = escapeHtml(event.image || "");

  const imageHtml = image
    ? `
      <div class="event-image-wrap">
        <img src="${image}" alt="${title}" class="event-image" />
      </div>
    `
    : "";

  return `
    <article class="event-card">
      ${imageHtml}

      <div class="event-body">
        <p class="event-date">${date}</p>
        <h3 class="event-title">${title}</h3>
        <p class="event-place">${place}</p>

        ${
          description
            ? `<p class="event-description">${description}</p>`
            : ""
        }

        <a
          class="event-link"
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${type === "past" ? "開催ページを見る" : "詳細を見る"}
        </a>
      </div>
    </article>
  `;
}

function formatEventDate(dateString) {
  if (!dateString) {
    return "開催日未定";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "開催日未定";
  }

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
