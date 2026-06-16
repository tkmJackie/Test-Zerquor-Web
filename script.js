/* =====================================
   Header / Footer Common Parts
===================================== */

async function loadCommonParts() {
  try {
    const headerArea = document.getElementById("header");

    if (headerArea) {
      const response = await fetch("/header.html");

      if (response.ok) {
        headerArea.innerHTML = await response.text();
      }
    }

    const footerArea = document.getElementById("footer");

    if (footerArea) {
      const response = await fetch("/footer.html");

      if (response.ok) {
        footerArea.innerHTML = await response.text();
      }
    }

    const ctaArea = document.getElementById("cta");

    if (ctaArea) {
      const response = await fetch("/cta.html");

      if (response.ok) {
        ctaArea.innerHTML = await response.text();
      }
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

    if (!href) {
      return;
    }

    const linkPath = href.split("/").pop();

    if (href === currentPath || linkPath === currentPath) {
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
    const response = await fetch("/events.json?v=20260616-13");

    if (!response.ok) {
      throw new Error("events.json の取得に失敗しました");
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
      throw new Error("events.json の形式が正しくありません");
    }

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
              >
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

        ${
          place
            ? `
              <div class="event-place">
                ${place}
              </div>
            `
            : ""
        }

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
              ? "開催済み"
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

/* =====================================
   Self Blog Loading
===================================== */

async function loadSelfBlogs() {
  const container =
    document.getElementById("self-blog-list");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("/blog_posts.json?v=20260616-13");

    if (!response.ok) {
      throw new Error("blog_posts.json の取得に失敗しました");
    }

    const posts = await response.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = `
        <div class="blog-loading">
          記事がまだありません。
        </div>
      `;
      return;
    }

    container.innerHTML = posts
      .map((post) => {
        const title = escapeHtml(post.title || "タイトル未設定");
        const description = escapeHtml(post.description || "");
        const category = escapeHtml(post.category || "");
        const date = escapeHtml(formatBlogDate(post.date || ""));
        const readingTime = escapeHtml(
          formatReadingTime(
            post.readingTime ||
            post.reading_time ||
            post.readingTimeText ||
            ""
          )
        );
        const thumbnail = escapeHtml(post.thumbnail || "");

        const rawUrl =
          post.file ||
          post.url ||
          post.href ||
          "#";

        const url = escapeHtml(normalizeBlogUrl(rawUrl));

        const metaItems = [
          date,
          category,
          readingTime
        ].filter(Boolean);

        return `
          <article class="blog-card">

            ${
              thumbnail
                ? `
                  <img
                    src="${thumbnail}"
                    alt="${title}"
                    class="blog-card-image"
                  >
                `
                : ""
            }

            <div class="blog-card-content">

              ${
                metaItems.length > 0
                  ? `
                    <div class="blog-card-meta">
                      ${metaItems
                        .map((item) => `<span class="blog-meta-pill">${item}</span>`)
                        .join("")}
                    </div>
                  `
                  : ""
              }

              <h3>${title}</h3>

              ${
                description
                  ? `<p>${description}</p>`
                  : ""
              }

              <a
                href="${url}"
                class="blog-read-button"
              >
                記事を読む →
              </a>

            </div>

          </article>
        `;
      })
      .join("");

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="blog-loading">
        自社ブログ記事を読み込めませんでした。
      </div>
    `;
  }
}

/* =====================================
   Top Blog Loading
   トップページに最新ブログ3件を表示する処理
===================================== */

async function loadTopBlogs() {
  const container =
    document.getElementById("top-blog-list");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("/blog_posts.json?v=20260616-16");

    if (!response.ok) {
      throw new Error("blog_posts.json の取得に失敗しました");
    }

    const posts = await response.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = `
        <div class="blog-loading">
          記事がまだありません。
        </div>
      `;
      return;
    }

    const latestPosts = posts
      .slice()
      .sort((a, b) => {
        return getBlogTime(b.date) - getBlogTime(a.date);
      })
      .slice(0, 3);

    container.innerHTML = latestPosts
      .map((post) => {
        const title = escapeHtml(post.title || "タイトル未設定");
        const description = escapeHtml(post.description || "");
        const category = escapeHtml(post.category || "");
        const date = escapeHtml(formatBlogDate(post.date || ""));
        const readingTime = escapeHtml(formatTopBlogReadingTime(
          post.readingTime ||
          post.reading_time ||
          ""
        ));

        const rawUrl =
          post.file ||
          post.url ||
          post.href ||
          "#";

        const url = escapeHtml(normalizeBlogUrl(rawUrl));

        const metaItems = [
          date,
          category,
          readingTime
        ].filter(Boolean);

        return `
          <article class="top-blog-card">

            ${
              metaItems.length > 0
                ? `
                  <div class="top-blog-meta">
                    ${metaItems
                      .map((item) => `<span>${item}</span>`)
                      .join("")}
                  </div>
                `
                : ""
            }

            <h3>${title}</h3>

            ${
              description
                ? `<p>${description}</p>`
                : ""
            }

            <a href="${url}" class="top-blog-link">
              記事を読む →
            </a>

          </article>
        `;
      })
      .join("");

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="blog-loading">
        最新記事を読み込めませんでした。
      </div>
    `;
  }
}

function getBlogTime(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}

function formatTopBlogReadingTime(readingTime) {
  if (!readingTime) {
    return "";
  }

  const text = String(readingTime).trim();

  if (!text) {
    return "";
  }

  if (text.includes("読了時間")) {
    return text;
  }

  if (/^\d+$/.test(text)) {
    return `読了時間：約${text}分`;
  }

  return `読了時間：${text}`;
}

/* =====================================
   Zerquor AI Chat
===================================== */

async function loadAIChat() {
  const container = document.getElementById("ai-chat-container");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("/ai-chat.html");

    if (!response.ok) {
      throw new Error("ai-chat.html の取得に失敗しました");
    }

    const html = await response.text();

    container.innerHTML = html;

    initializeAIChat();

  } catch (error) {
    console.error("AIチャットの読み込みに失敗しました", error);
  }
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

      const responseData = await response.json();

      const answerText =
        responseData.answer || "回答を取得できませんでした。";

      messages.insertAdjacentHTML(
        "beforeend",
        `
          <div class="ai-row">
            <div class="ai-avatar">
              <img
                src="/images/logo.png"
                alt="Zerquor"
              >
            </div>

            <div class="ai-message"></div>
          </div>
        `
      );

      const aiMessage =
        messages.lastElementChild.querySelector(".ai-message");

      aiMessage.textContent = answerText;

      renderAIActionButtons(responseData);

      messages.scrollTop = messages.scrollHeight;

    } catch (error) {
      messages.insertAdjacentHTML(
        "beforeend",
        `
          <div class="ai-row">
            <div class="ai-avatar">
              <img
                src="/images/logo.png"
                alt="Zerquor"
              >
            </div>

            <div class="ai-message">
              エラーが発生しました。
            </div>
          </div>
        `
      );

      console.error(error);
    }
  });
}

/* =====================================
   AI Chat Action Buttons
===================================== */

function renderAIActionButtons(responseData) {
  const messages = document.getElementById("ai-chat-messages");

  if (!messages || !responseData) {
    return;
  }

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "ai-action-buttons";

  let hasButton = false;

  if (responseData.showPageButton && responseData.pageUrl) {
    const pageButton = createAIButton(
      responseData.pageButtonText || "詳細を見る",
      normalizeInternalUrl(responseData.pageUrl),
      false
    );

    buttonGroup.appendChild(pageButton);
    hasButton = true;
  }

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
      normalizeBlogUrl(responseData.blogUrl),
      false
    );

    buttonGroup.appendChild(blogButton);
    hasButton = true;
  }

  if (!hasButton) {
    return;
  }

  messages.appendChild(buttonGroup);
  messages.scrollTop = messages.scrollHeight;
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

/* =====================================
   Utility
===================================== */

function normalizeBlogUrl(url) {
  if (!url) {
    return "#";
  }

  let normalizedUrl = String(url).trim();

  /*
    旧URL対策:
    旧ブログURLを新しいルート直下の記事URLへ寄せる
  */
  if (
    normalizedUrl === "/blogs/security-what-is.html" ||
    normalizedUrl === "blogs/security-what-is.html" ||
    normalizedUrl === "../blogs/security-what-is.html" ||
    normalizedUrl === "security-what-is.html" ||
    normalizedUrl === "/security-what-is.html"
  ) {
    return "blog10001-security-what-is.html";
  }

  /*
    すでに新しいファイル名ならそのまま返す
  */
  if (
    normalizedUrl === "blog10001-security-what-is.html" ||
    normalizedUrl === "/blog10001-security-what-is.html"
  ) {
    return normalizedUrl.replace(/^\//, "");
  }

  /*
    file が posts/ から始まる古い形だった場合の保険
  */
  if (
    normalizedUrl === "posts/security-what-is.html" ||
    normalizedUrl === "/posts/security-what-is.html" ||
    normalizedUrl === "posts/blog10001-security-what-is.html" ||
    normalizedUrl === "/posts/blog10001-security-what-is.html"
  ) {
    return "blog10001-security-what-is.html";
  }

  /*
    外部URLはそのまま返す
  */
  if (
    normalizedUrl.startsWith("http://") ||
    normalizedUrl.startsWith("https://")
  ) {
    return normalizedUrl;
  }

  /*
    先頭の / はルート直下配置では外す
  */
  if (normalizedUrl.startsWith("/")) {
    normalizedUrl = normalizedUrl.replace(/^\//, "");
  }

  return normalizedUrl;
}

function normalizeInternalUrl(url) {
  if (!url) {
    return "#";
  }

  const normalizedUrl = String(url).trim();

  if (
    normalizedUrl.startsWith("http://") ||
    normalizedUrl.startsWith("https://")
  ) {
    return normalizedUrl;
  }

  if (normalizedUrl.startsWith("/")) {
    return normalizedUrl.replace(/^\//, "");
  }

  return normalizedUrl;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function formatBlogDate(dateString) {
  if (!dateString) {
    return "";
  }

  const text = String(dateString).trim();

  const matchedDate = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);

  if (!matchedDate) {
    return text;
  }

  const year = matchedDate[1];
  const month = matchedDate[2].padStart(2, "0");
  const day = matchedDate[3].padStart(2, "0");

  return `${year}/${month}/${day}`;
}

function formatReadingTime(readingTime) {
  if (!readingTime) {
    return "";
  }

  const text = String(readingTime).trim();

  if (!text) {
    return "";
  }

  if (text.includes("読了時間")) {
    return text;
  }

  if (/^\d+$/.test(text)) {
    return `読了時間：約${text}分`;
  }

  return `読了時間：${text}`;
}

/* =====================================
   Initialize
===================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadCommonParts();
  await loadAIChat();

  initializeFadeAnimation();

  await loadEvents();
  await loadSelfBlogs();
});
