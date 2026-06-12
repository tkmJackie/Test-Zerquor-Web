// Zerquor 共通 JavaScript

// ==============================
// 設定
// ==============================

const AI_WORKER_URL = "hhttps://zerquor-ai.tkm12325.workers.dev/";

// ==============================
// 初期化
// ==============================

document.addEventListener("DOMContentLoaded", async function () {
  await loadCommonParts();
  setCurrentNav();
  setFooterYear();
  initializeAIChat();
  initializeFaq();
  initializeMobileNav();
  loadEventsIfNeeded();
});

// ==============================
// header / footer 読み込み
// ==============================

async function loadCommonParts() {
  await loadHtmlPart("header-placeholder", "header.html");
  await loadHtmlPart("footer-placeholder", "footer.html");
}

async function loadHtmlPart(elementId, filePath) {
  const target = document.getElementById(elementId);

  if (!target) {
    return;
  }

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      return;
    }

    const html = await response.text();
    target.innerHTML = html;
  } catch (error) {
    console.error(filePath + " の読み込みに失敗しました。", error);
  }
}

// ==============================
// 現在ページのナビ強調
// ==============================

function setCurrentNav() {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";

  const navLinks = document.querySelectorAll(".site-nav a, .footer-nav a");

  navLinks.forEach(function (link) {
    const href = link.getAttribute("href");

    if (!href) {
      return;
    }

    const hrefFile = href.substring(href.lastIndexOf("/") + 1);

    if (
      hrefFile === currentFile ||
      (currentFile === "" && hrefFile === "index.html") ||
      (currentFile === "index.html" && hrefFile === "")
    ) {
      link.classList.add("is-current");
    }
  });
}

// ==============================
// フッター年表示
// ==============================

function setFooterYear() {
  const yearElements = document.querySelectorAll("[data-current-year]");
  const currentYear = new Date().getFullYear();

  yearElements.forEach(function (element) {
    element.textContent = currentYear;
  });
}

// ==============================
// モバイルナビ
// ==============================

function initializeMobileNav() {
  const button = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
    button.classList.toggle("is-open");

    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
  });
}

// ==============================
// FAQ
// ==============================

function initializeFaq() {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) {
    return;
  }

  faqItems.forEach(function (item) {
    const question = item.querySelector(".faq-question");

    if (!question) {
      return;
    }

    question.addEventListener("click", function () {
      item.classList.toggle("is-open");
    });
  });
}

// ==============================
// イベント表示
// ==============================

async function loadEventsIfNeeded() {
  const upcomingContainer = document.getElementById("upcoming-events");
  const pastContainer = document.getElementById("past-events");

  if (!upcomingContainer && !pastContainer) {
    return;
  }

  try {
    const response = await fetch("events.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      renderEventsError(upcomingContainer, pastContainer);
      return;
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
      renderEventsError(upcomingContainer, pastContainer);
      return;
    }

    renderEvents(events, upcomingContainer, pastContainer);
  } catch (error) {
    console.error("events.json の読み込みに失敗しました。", error);
    renderEventsError(upcomingContainer, pastContainer);
  }
}

function renderEvents(events, upcomingContainer, pastContainer) {
  const now = new Date();

  const normalizedEvents = events
    .map(function (event) {
      return {
        title: event.title || "タイトル未定",
        date: event.date || "",
        format: event.format || event.place || "未定",
        description: event.description || "",
        url: event.url || event.link || "",
        category: event.category || "",
        dateObject: parseDate(event.date)
      };
    })
    .filter(function (event) {
      return event.dateObject !== null;
    })
    .sort(function (a, b) {
      return a.dateObject - b.dateObject;
    });

  const upcomingEvents = normalizedEvents.filter(function (event) {
    return event.dateObject >= now;
  });

  const pastEvents = normalizedEvents.filter(function (event) {
    return event.dateObject < now;
  });

  if (upcomingContainer) {
    if (upcomingEvents.length === 0) {
      upcomingContainer.innerHTML = `
        <div class="empty-card">
          <p>現在、開催予定のセミナーはありません。</p>
        </div>
      `;
    } else {
      upcomingContainer.innerHTML = upcomingEvents
        .map(function (event) {
          return createEventCard(event, true);
        })
        .join("");
    }
  }

  if (pastContainer) {
    if (pastEvents.length === 0) {
      pastContainer.innerHTML = `
        <div class="empty-card">
          <p>過去のセミナーはまだありません。</p>
        </div>
      `;
    } else {
      pastContainer.innerHTML = pastEvents
        .reverse()
        .map(function (event) {
          return createEventCard(event, false);
        })
        .join("");
    }
  }
}

function createEventCard(event, isUpcoming) {
  const dateText = formatDateForDisplay(event.dateObject);
  const escapedTitle = escapeHtml(event.title);
  const escapedFormat = escapeHtml(event.format);
  const escapedDescription = escapeHtml(event.description);
  const escapedUrl = escapeHtml(event.url);

  const buttonHtml =
    isUpcoming && event.url
      ? `
        <a
          class="event-button"
          href="${escapedUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          詳細を見る
        </a>
      `
      : "";

  return `
    <article class="event-card">
      <div class="event-meta">
        <span>${dateText}</span>
        <span>${escapedFormat}</span>
      </div>
      <h3>${escapedTitle}</h3>
      ${
        escapedDescription
          ? `<p>${escapedDescription}</p>`
          : ""
      }
      ${buttonHtml}
    </article>
  `;
}

function renderEventsError(upcomingContainer, pastContainer) {
  const html = `
    <div class="empty-card">
      <p>セミナー情報を読み込めませんでした。</p>
    </div>
  `;

  if (upcomingContainer) {
    upcomingContainer.innerHTML = html;
  }

  if (pastContainer) {
    pastContainer.innerHTML = html;
  }
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDateForDisplay(date) {
  if (!date) {
    return "";
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}年${month}月${day}日（${weekday}）${hour}:${minute}〜`;
}

// ==============================
// AIチャット
// ==============================

function initializeAIChat() {
  if (document.getElementById("ai-chat")) {
    return;
  }

  const chatHtml = `
    <div id="ai-chat" class="ai-chat">
      <button
        id="ai-chat-toggle"
        class="ai-chat-toggle"
        type="button"
        aria-label="AIチャットを開く"
      >
        AI
      </button>

      <section id="ai-chat-window" class="ai-chat-window" aria-label="AIチャット">
        <div class="ai-chat-header">
          <div>
            <strong>Zerquor AI</strong>
            <span>サイト案内</span>
          </div>
          <button
            id="ai-chat-close"
            class="ai-chat-close"
            type="button"
            aria-label="AIチャットを閉じる"
          >
            ×
          </button>
        </div>

        <div id="ai-chat-messages" class="ai-chat-messages">
          <div class="ai-message ai-message-bot">
            こんにちは。Zerquorのサービス、セミナー、ブログについてご案内できます。
          </div>
        </div>

        <form id="ai-chat-form" class="ai-chat-form">
          <input
            id="ai-chat-input"
            type="text"
            placeholder="質問を入力してください"
            autocomplete="off"
          />
          <button type="submit">送信</button>
        </form>
      </section>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", chatHtml);

  const toggleButton = document.getElementById("ai-chat-toggle");
  const closeButton = document.getElementById("ai-chat-close");
  const chatWindow = document.getElementById("ai-chat-window");
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");

  if (!toggleButton || !closeButton || !chatWindow || !form || !input) {
    return;
  }

  toggleButton.addEventListener("click", function () {
    chatWindow.classList.toggle("is-open");

    if (chatWindow.classList.contains("is-open")) {
      input.focus();
    }
  });

  closeButton.addEventListener("click", function () {
    chatWindow.classList.remove("is-open");
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = input.value.trim();

    if (!message) {
      return;
    }

    input.value = "";

    await sendAIChatMessage(message);
  });
}

async function sendAIChatMessage(message) {
  const messages = document.getElementById("ai-chat-messages");

  if (!messages) {
    return;
  }

  addChatMessage(message, "user");

  const loadingId = addChatMessage("回答を作成しています...", "bot", true);

  try {
    const response = await fetch(AI_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const responseData = await response.json();

    removeChatMessageById(loadingId);

    if (!response.ok) {
      addChatMessage(
        "申し訳ありません。現在AIチャットでエラーが発生しています。",
        "bot"
      );
      return;
    }

    const answer =
      responseData && responseData.answer
        ? responseData.answer
        : "申し訳ありません。回答を取得できませんでした。";

    addChatMessage(answer, "bot");

    renderAIActionButtons(responseData);
  } catch (error) {
    console.error("AIチャットの送信に失敗しました。", error);

    removeChatMessageById(loadingId);

    addChatMessage(
      "申し訳ありません。現在AIチャットに接続できません。",
      "bot"
    );
  }
}

function addChatMessage(text, sender, isLoading) {
  const messages = document.getElementById("ai-chat-messages");

  if (!messages) {
    return "";
  }

  const messageId = "ai-message-" + Date.now() + "-" + Math.random().toString(36).slice(2);

  const messageElement = document.createElement("div");
  messageElement.id = messageId;
  messageElement.className =
    sender === "user"
      ? "ai-message ai-message-user"
      : "ai-message ai-message-bot";

  if (isLoading) {
    messageElement.classList.add("is-loading");
  }

  messageElement.textContent = text;

  messages.appendChild(messageElement);
  scrollChatToBottom();

  return messageId;
}

function removeChatMessageById(messageId) {
  if (!messageId) {
    return;
  }

  const element = document.getElementById(messageId);

  if (element) {
    element.remove();
  }
}

function renderAIActionButtons(responseData) {
  const messages = document.getElementById("ai-chat-messages");

  if (!messages || !responseData) {
    return;
  }

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "ai-action-buttons";

  let hasButton = false;

  if (responseData.showContactButton) {
    const contactButton = createAIButton(
      "お問い合わせする",
      "contact.html",
      false
    );

    buttonGroup.appendChild(contactButton);
    hasButton = true;
  }

  if (responseData.showSeminarButton && responseData.seminarUrl) {
    const seminarButton = createAIButton(
      responseData.seminarButtonText || "セミナー詳細を見る",
      responseData.seminarUrl,
      true
    );

    buttonGroup.appendChild(seminarButton);
    hasButton = true;
  }

  if (responseData.showBlogButton && responseData.blogUrl) {
    const blogButton = createAIButton(
      responseData.blogButtonText || "ブログを読む",
      responseData.blogUrl,
      true
    );

    buttonGroup.appendChild(blogButton);
    hasButton = true;
  }

  if (!hasButton) {
    return;
  }

  messages.appendChild(buttonGroup);
  scrollChatToBottom();
}

function createAIButton(label, href, isExternal) {
  const link = document.createElement("a");

  link.className = "ai-contact-button";
  link.href = href;
  link.textContent = label;

  if (isExternal) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  return link;
}

function scrollChatToBottom() {
  const messages = document.getElementById("ai-chat-messages");

  if (!messages) {
    return;
  }

  messages.scrollTop = messages.scrollHeight;
}

// ==============================
// 汎用
// ==============================

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
