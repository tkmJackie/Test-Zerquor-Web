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
    <article class="event-card ${type === "past" ? "past-event" : "upcoming-event"}">

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

  await loadAIChat();

  initializeFadeAnimation();

  await loadEvents();
});

/* =========================
   Zerquor AI Chat
========================= */

async function loadAIChat() {
  const container = document.getElementById("ai-chat-container");

  if (!container) return;

  const response = await fetch("ai-chat.html");
  const html = await response.text();

  container.innerHTML = html;

  initializeAIChat();
}

const ZERQUOR_AI_WORKER_URL =
  "https://zerquor-ai.tkm12325.workers.dev";

function initializeAIChat() {
  const button = document.getElementById("ai-chat-button");
  const windowEl = document.getElementById("ai-chat-window");
  const close = document.getElementById("ai-chat-close");
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");
  const messages = document.getElementById("ai-chat-messages");

  if (!button || !windowEl || !close || !form || !input || !messages) {
    console.error("AIチャットの要素が見つかりません");
    return;
  }

  button.addEventListener("click", () => {
    windowEl.classList.toggle("open");
  });

  close.addEventListener("click", () => {
    windowEl.classList.remove("open");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = input.value.trim();

    if (!question) {
      return;
    }

    messages.insertAdjacentHTML(
      "beforeend",
      `<div class="user-message"></div>`
    );

    const userMessage = messages.lastElementChild;
    userMessage.textContent = question;

    input.value = "";

    try {
      const response = await fetch(ZERQUOR_AI_WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: question
        })
      });

      const data = await response.json();
      const responseData = await response.json();

const answerText =
  responseData.answer || "回答を取得できませんでした。";

   messages.insertAdjacentHTML(
     "beforeend",
     `
     <div class="ai-message-wrap">
   
       <img
         src="images/AI-robo.png"
         class="ai-message-avatar"
         alt="AI"
       >
   
       <div class="ai-message">
         ${answerText}
       </div>
   
     </div>
     `
   );

const aiMessage = messages.lastElementChild;
aiMessage.textContent = answerText;

// 既存のお問い合わせボタンを削除
const oldButton = document.getElementById("ai-contact-link");

      if (oldButton) {
        oldButton.remove();
      }
      
      // お問い合わせが必要そうな場合だけ表示
      const contactKeywords = [
        "お問い合わせ",
        "問い合わせ",
        "ご相談",
        "相談してください",
        "フォーム",
        "見積",
        "個別",
        "詳しく"
      ];
      
      const needContact = contactKeywords.some((word) =>
        answerText.includes(word)
      );
      
      if (needContact) {
        messages.insertAdjacentHTML(
          "beforeend",
          `
            <a
              id="ai-contact-link"
              href="contact.html"
              class="ai-contact-button"
            >
              お問い合わせする
            </a>
          `
        );
      }
      
      messages.scrollTop = messages.scrollHeight;

      messages.insertAdjacentHTML(
        form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = input.value.trim();

  if (!question) {
    return;
  }

  messages.insertAdjacentHTML(
    "beforeend",
    `<div class="user-message"></div>`
  );

  const userMessage = messages.lastElementChild;
  userMessage.textContent = question;

  input.value = "";

  try {
    const response = await fetch(ZERQUOR_AI_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question
      })
    });

    const responseData = await response.json();

    const answerText =
      responseData.answer || "回答を取得できませんでした。";

    messages.insertAdjacentHTML(
      "beforeend",
      `<div class="ai-message"></div>`
    );

    const aiMessage = messages.lastElementChild;
    aiMessage.textContent = answerText;

    const oldButton = document.getElementById("ai-contact-link");

    if (oldButton) {
      oldButton.remove();
    }

    const contactKeywords = [
      "お問い合わせ",
      "問い合わせ",
      "ご相談",
      "相談してください",
      "フォーム",
      "見積",
      "個別",
      "詳しく"
    ];

    const needContact = contactKeywords.some((word) =>
      answerText.includes(word)
    );

    if (needContact) {
      messages.insertAdjacentHTML(
        "beforeend",
        `
          <a
            id="ai-contact-link"
            href="contact.html"
            class="ai-contact-button"
          >
            お問い合わせする
          </a>
        `
      );
    }

    messages.scrollTop = messages.scrollHeight;

  } catch (error) {
    messages.insertAdjacentHTML(
      "beforeend",
      `<div class="ai-message">エラーが発生しました。</div>`
    );

    console.error(error);
  }
});
               );

      messages.scrollTop = messages.scrollHeight;

    } catch (error) {
      messages.insertAdjacentHTML(
        "beforeend",
        `<div class="ai-message">エラーが発生しました。</div>`
      );

      console.error(error);
    }
  });
}
