/* =====================================
   Header / Footer Common Parts
===================================== */

async function loadCommonParts() {
  try {
    const headerArea = document.getElementById("header");

    if (headerArea) {
      const response = await fetch("header.html");
      headerArea.innerHTML = await response.text();
    }

    const footerArea = document.getElementById("footer");

    if (footerArea) {
      const response = await fetch("footer.html");
      footerArea.innerHTML = await response.text();
    }

    setCurrentNav();
    setFooterYear();

  } catch (error) {
    console.error("共通パーツの読み込みに失敗しました", error);
  }
}

function setCurrentNav() {
  const currentPath =
    window.location.pathname.split("/").pop() || "index.html";

  const navLinks = document.querySelectorAll(".nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPath) {
      link.classList.add("active");
    }
  });
}

function setFooterYear() {
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* =====================================
   Fade Animation
===================================== */

function initializeFadeAnimation() {
  const faders = document.querySelectorAll(".fade-up");

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
        threshold: 0.16
      }
    );

    faders.forEach((element) => {
      observer.observe(element);
    });
  } else {
    faders.forEach((element) => {
      element.classList.add("visible");
    });
  }
}

/* =====================================
   Event Loading
===================================== */

async function loadEvents() {
  const topUpcomingEventsContainer =
    document.getElementById("upcoming-events");

  const eventsPageUpcomingContainer =
    document.getElementById("events-page-upcoming");

  const pastEventsContainer =
    document.getElementById("past-events");

  if (
    !topUpcomingEventsContainer &&
    !eventsPageUpcomingContainer &&
    !pastEventsContainer
  ) {
    return;
  }

  try {
    const response = await fetch("events.json");

    if (!response.ok) {
      throw new Error("events.json の取得に失敗しました");
    }

    const events = await response.json();

    const now = new Date();

    const upcomingEvents = events
      .filter((event) => {
        const eventDate = new Date(event.date);

        if (Number.isNaN(eventDate.getTime())) {
          return false;
        }

        return eventDate >= now;
      })
      .sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

    const pastEvents = events
      .filter((event) => {
        const eventDate = new Date(event.date);

        if (Number.isNaN(eventDate.getTime())) {
          return false;
        }

        return eventDate < now;
      })
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

    if (topUpcomingEventsContainer) {
      renderEvents(
        topUpcomingEventsContainer,
        upcomingEvents.slice(0, 10),
        "upcoming"
      );
    }

    if (eventsPageUpcomingContainer) {
      renderEvents(
        eventsPageUpcomingContainer,
        upcomingEvents,
        "upcoming"
      );
    }

    if (pastEventsContainer) {
      renderEvents(
        pastEventsContainer,
        pastEvents,
        "past"
      );
    }

  } catch (error) {
    console.error(error);
  }
}

function renderEvents(container, events, type) {
  if (!events || events.length === 0) {
    container.innerHTML = `
      <p class="events-message">
        ${
          type === "past"
            ? "過去のセミナー情報はまだありません。"
            : "現在、開催予定のセミナーはありません。"
        }
      </p>
    `;
    return;
  }

  container.innerHTML = events
    .map((event) => createEventCard(event, type))
    .join("");
}

function createEventCard(event, type) {
  const title = escapeHtml(event.title || "タイトル未定");
  const url = escapeHtml(event.url || "#");
  const place = escapeHtml(event.place || "");
  const date = escapeHtml(formatEventDate(event.date));
  const description = escapeHtml(event.description || "");
  const category = escapeHtml(event.category || "");
  const image = escapeHtml(event.image || "");

  return `
    <article class="event-card">

      ${
        image
          ? `
          <div class="event-image-wrap">
            <img
              src="${image}"
              alt="${title}"
              class="event-image"
            />
          </div>
        `
          : ""
      }

      <div class="event-body">

        ${
          category
            ? `
            <div class="event-category">
              ${category}
            </div>
          `
            : ""
        }

        <div class="event-date">
          ${date}
        </div>

        <h3 class="event-title">
          ${title}
        </h3>

        <div class="event-place">
          ${place}
        </div>

        ${
          description
            ? `
            <p class="event-description">
              ${description}
            </p>
          `
            : ""
        }

        <a
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
          class="event-link"
        >
          ${
            type === "past"
              ? "開催ページを見る"
              : "詳細を見る"
          }
        </a>

      </div>

    </article>
  `;
}

function formatEventDate(dateString) {
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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* =====================================
   Initialize
===================================== */

document.addEventListener("DOMContentLoaded", async () => {

  await loadCommonParts();

  initializeFadeAnimation();

  await loadEvents();

});
