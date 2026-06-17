/* =====================================
   Config
===================================== */

const EVENTS_JSON_PATH = "/events.json";
const BLOG_POSTS_JSON_PATH = `/blog_posts.json?v=${SITE_ASSET_VERSION}`;

const ZERQUOR_AI_WORKER_URL =
  "https://zerquor-ai.tkm12325.workers.dev";

const BLOG_VIEW_WORKER_URL =
  "https://zerquor-blog.tkm12325.workers.dev";

const INFORMATION_JSON_PATH = `/information.json?v=${SITE_ASSET_VERSION}`;
const BLOG_RANKING_LIMIT = 5;

let blogPostsCache = null;
let informationCache = null;

/* =====================================
   Header / Footer / CTA Common Parts
===================================== */

async function loadCommonParts() {
  try {
    await Promise.all([
      loadHtmlIntoElement("header", "/header.html"),
      loadHtmlIntoElement("footer", "/footer.html"),
      loadHtmlIntoElement("cta", "/cta.html")
    ]);

    setCurrentNav();
    setFooterYear();

  } catch (error) {
    console.error("共通パーツの読み込みに失敗しました", error);
  }
}

async function loadHtmlIntoElement(elementId, path) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} の取得に失敗しました`);
  }

  element.innerHTML = await response.text();
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

    const cleanHref = href.split("?")[0].split("#")[0];
    const linkPath = cleanHref.split("/").pop();

    if (cleanHref === currentPath || linkPath === currentPath) {
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

  if (!faders.length) {
    return;
  }

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
    const response = await fetch(EVENTS_JSON_PATH);

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
    console.error("イベント情報の読み込みに失敗しました", error);
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
  const url = escapeAttribute(event.url || "#");
  const place = escapeHtml(event.place || "");
  const date = escapeHtml(formatEventDate(event.date));
  const description = escapeHtml(event.description || "");
  const category = escapeHtml(event.category || "");
  const image = escapeAttribute(event.image || "");

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
   Blog Posts Data
===================================== */

async function loadBlogPostsData() {
  if (blogPostsCache) {
    return blogPostsCache;
  }

  const response = await fetch(BLOG_POSTS_JSON_PATH);

  if (!response.ok) {
    throw new Error("blog_posts.json の取得に失敗しました");
  }

  const data = await response.json();

  let posts = [];

  if (Array.isArray(data)) {
    posts = data;
  } else if (Array.isArray(data.posts)) {
    posts = data.posts;
  } else if (Array.isArray(data.blogs)) {
    posts = data.blogs;
  }

  blogPostsCache = posts
    .map(normalizeBlogPost)
    .filter((post) => post.id && post.file);

  return blogPostsCache;
}

function normalizeBlogPost(post) {
  return {
    id: post.id || post.blogId || "",
    title: post.title || "タイトル未設定",
    description: post.description || post.summary || "",
    category: post.category || "ブログ",
    date: post.date || post.publishedAt || "",
    readingTime:
      post.readingTime ||
      post.reading_time ||
      post.readingTimeText ||
      post.readTime ||
      "",
    thumbnail: post.thumbnail || "",
    file:
      post.file ||
      post.url ||
      post.href ||
      post.path ||
      "#"
  };
}

function sortBlogsByNewest(posts) {
  return posts
    .slice()
    .sort((a, b) => {
      return getBlogTime(b.date) - getBlogTime(a.date);
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
    const posts = sortBlogsByNewest(await loadBlogPostsData());

    if (!posts.length) {
      container.innerHTML = `
        <div class="blog-loading">
          記事がまだありません。
        </div>
      `;
      return;
    }

    container.innerHTML = posts
      .map((post) => createSelfBlogCard(post))
      .join("");

  } catch (error) {
    console.error("自社ブログ記事の読み込みに失敗しました", error);

    container.innerHTML = `
      <div class="blog-loading">
        自社ブログ記事を読み込めませんでした。
      </div>
    `;
  }
}

function createSelfBlogCard(post) {
  const title = escapeHtml(post.title);
  const description = escapeHtml(post.description);
  const category = escapeHtml(post.category);
  const date = escapeHtml(formatBlogDate(post.date));
  const readingTime = escapeHtml(formatReadingTime(post.readingTime));
  const thumbnail = escapeAttribute(post.thumbnail);

  const url = escapeAttribute(
    normalizeBlogUrl(post.file)
  );

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
}

/* =====================================
   Information Data
===================================== */

async function loadInformationData() {
  if (informationCache) {
    return informationCache;
  }

  const response = await fetch(INFORMATION_JSON_PATH);

  if (!response.ok) {
    throw new Error("information.json の取得に失敗しました");
  }

  const data = await response.json();

  let items = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (Array.isArray(data.information)) {
    items = data.information;
  } else if (Array.isArray(data.items)) {
    items = data.items;
  }

  informationCache = items
    .map(normalizeInformationItem)
    .filter((item) => item.id && item.title);

  return informationCache;
}

function normalizeInformationItem(item) {
  return {
    id: item.id || "",
    title: item.title || "タイトル未設定",
    description: item.description || item.summary || "",
    body: item.body || item.content || "",
    category: item.category || "お知らせ",
    date: item.date || item.publishedAt || "",
    file: item.file || "",
    link: item.link || item.url || item.href || ""
  };
}

function sortInformationByNewest(items) {
  return items
    .slice()
    .sort((a, b) => {
      return getBlogTime(b.date) - getBlogTime(a.date);
    });
}

/* =====================================
   Top Information Loading
   トップページに最新お知らせ3件を表示する処理
===================================== */

async function loadTopInformation() {
  const container =
    document.getElementById("top-information-list");

  if (!container) {
    return;
  }

  try {
    const items = sortInformationByNewest(await loadInformationData())
      .slice(0, 3);

    if (!items.length) {
      container.innerHTML = `
        <div class="blog-loading">
          お知らせはまだありません。
        </div>
      `;
      return;
    }

    container.innerHTML = items
      .map((item) => createTopInformationCard(item))
      .join("");

  } catch (error) {
    console.error("最新お知らせの読み込みに失敗しました", error);

    container.innerHTML = `
      <div class="blog-loading">
        最新お知らせを読み込めませんでした。
      </div>
    `;
  }
}

function createTopInformationCard(item) {
  const title = escapeHtml(item.title);
  const description = escapeHtml(item.description);
  const category = escapeHtml(item.category);
  const date = escapeHtml(formatBlogDate(item.date));

  const url = escapeAttribute(
    normalizeInformationUrl(item)
  );

  const externalAttrs = isExternalUrl(url)
    ? ` target="_blank" rel="noopener noreferrer"`
    : "";

  const metaItems = [
    date,
    category
  ].filter(Boolean);

  return `
    <article class="top-blog-card">

      ${
        metaItems.length > 0
          ? `
            <div class="top-blog-meta">
              ${metaItems
                .map((meta) => `<span>${meta}</span>`)
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

      <a href="${url}" class="top-blog-link"${externalAttrs}>
        お知らせを見る →
      </a>

    </article>
  `;
}

/* =====================================
   Information List Loading
   information.html に全お知らせを表示する処理
===================================== */

async function loadInformationList() {
  const container =
    document.getElementById("information-list");

  if (!container) {
    return;
  }

  try {
    const items = sortInformationByNewest(await loadInformationData());

    if (!items.length) {
      container.innerHTML = `
        <div class="blog-loading">
          お知らせはまだありません。
        </div>
      `;
      return;
    }

    container.innerHTML = items
      .map((item) => createInformationCard(item))
      .join("");

  } catch (error) {
    console.error("お知らせ一覧の読み込みに失敗しました", error);

    container.innerHTML = `
      <div class="blog-loading">
        お知らせを読み込めませんでした。
      </div>
    `;
  }
}

function createInformationCard(item) {
  const id = escapeAttribute(item.id);
  const title = escapeHtml(item.title);
  const category = escapeHtml(item.category);
  const date = escapeHtml(formatBlogDate(item.date));

  const text = escapeHtml(
    item.body || item.description || ""
  ).replaceAll("\n", "<br>");

  const url = escapeAttribute(
    normalizeInformationUrl(item)
  );

  const externalAttrs = isExternalUrl(url)
    ? ` target="_blank" rel="noopener noreferrer"`
    : "";

  const metaItems = [
    date,
    category
  ].filter(Boolean);

  return `
    <article id="${id}" class="blog-card">

      <div class="blog-card-content">

        ${
          metaItems.length > 0
            ? `
              <div class="blog-card-meta">
                ${metaItems
                  .map((meta) => `<span class="blog-meta-pill">${meta}</span>`)
                  .join("")}
              </div>
            `
            : ""
        }

        <h3>${title}</h3>

        ${
          text
            ? `<p>${text}</p>`
            : ""
        }

        ${
           url && url !== "#"
             ? `
               <a
                 href="${url}"
                 class="blog-read-button"
                 ${externalAttrs}
               >
                 詳細を見る →
               </a>
             `
             : ""
        }

      </div>

    </article>
  `;
}

function normalizeInformationUrl(item) {
  if (item.file) {
    return normalizeInternalUrl(item.file);
  }

  if (item.link) {
    return normalizeInternalUrl(item.link);
  }

  if (item.id) {
    return `${item.id}.html`;
  }

  return "#";

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
    const posts = sortBlogsByNewest(await loadBlogPostsData())
      .slice(0, 3);

    if (!posts.length) {
      container.innerHTML = `
        <div class="blog-loading">
          記事がまだありません。
        </div>
      `;
      return;
    }

    container.innerHTML = posts
      .map((post) => createTopBlogCard(post))
      .join("");

  } catch (error) {
    console.error("最新記事の読み込みに失敗しました", error);

    container.innerHTML = `
      <div class="blog-loading">
        最新記事を読み込めませんでした。
      </div>
    `;
  }
}

function createTopBlogCard(post) {
  const title = escapeHtml(post.title);
  const description = escapeHtml(post.description);
  const category = escapeHtml(post.category);
  const date = escapeHtml(formatBlogDate(post.date));
  const readingTime = escapeHtml(formatTopBlogReadingTime(post.readingTime));

  const url = escapeAttribute(
    normalizeBlogUrl(post.file)
  );

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
}

/* =====================================
   Blog Popular Ranking
===================================== */

async function loadPopularBlogRanking() {
  const rankingElement =
    document.getElementById("popular-blog-ranking");

  if (!rankingElement) {
    return;
  }

  try {
    const [rankingResponse, posts] = await Promise.all([
      fetch(`${BLOG_VIEW_WORKER_URL}/api/blog/ranking?limit=${BLOG_RANKING_LIMIT}`),
      loadBlogPostsData()
    ]);

    if (!rankingResponse.ok) {
      throw new Error("人気記事ランキングAPIの取得に失敗しました");
    }

    const rankingData = await rankingResponse.json();

    const ranking = Array.isArray(rankingData.ranking)
      ? rankingData.ranking
      : [];

    if (!ranking.length) {
      rankingElement.innerHTML = `
        <div class="blog-ranking-empty">
          まだ閲覧データがありません。記事が読まれるとランキングが表示されます。
        </div>
      `;
      return;
    }

    const mergedRanking = ranking
      .map((rankingItem) => {
        const blogId = normalizeRankingBlogId(
          rankingItem.blogId ||
          rankingItem.id ||
          ""
        );

        const blog = posts.find((post) => {
          return post.id === blogId;
        });

        if (!blog) {
          return null;
        }

        return {
          ...blog,
          views: Number(rankingItem.views || 0)
        };
      })
      .filter(Boolean);

    if (!mergedRanking.length) {
      rankingElement.innerHTML = `
        <div class="blog-ranking-empty">
          ランキングデータはありますが、記事情報と一致しませんでした。
        </div>
      `;
      return;
    }

    rankingElement.innerHTML = mergedRanking
      .map((blog, index) => createRankingCard(blog, index))
      .join("");

  } catch (error) {
    console.error("人気記事ランキングの表示に失敗しました", error);

    rankingElement.innerHTML = `
      <div class="blog-ranking-empty">
        人気記事ランキングを取得できませんでした。
      </div>
    `;
  }
}

function normalizeRankingBlogId(value) {
  return String(value || "")
    .trim()
    .replace(/^view:/, "");
}

function createRankingCard(blog, index) {
  const title = escapeHtml(blog.title);
  const description = escapeHtml(blog.description);
  const category = escapeHtml(blog.category);

  const url = escapeAttribute(
    normalizeBlogUrl(blog.file)
  );

  const views = Number(blog.views || 0).toLocaleString();

  return `
    <a class="blog-ranking-card" href="${url}">

      <div class="blog-ranking-rank">
        ${index + 1}
      </div>

      <h3 class="blog-ranking-title">
        ${title}
      </h3>

      ${
        description
          ? `
            <p class="blog-ranking-description">
              ${description}
            </p>
          `
          : ""
      }

      <div class="blog-ranking-meta">
        <span>
          ${category}
        </span>

        <span class="views">
          ${views} views
        </span>
      </div>

    </a>
  `;
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

    container.innerHTML = await response.text();

    initializeAIChat();

  } catch (error) {
    console.error("AIチャットの読み込みに失敗しました", error);
  }
}

function initializeAIChat() {
  const button = document.getElementById("ai-chat-button");
  const windowEl = document.getElementById("ai-chat-window");
  const close = document.getElementById("ai-chat-close");
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");
  const messages = document.getElementById("ai-chat-messages");

  if (!button || !windowEl || !close || !form || !input || !messages) {
    return;
  }

  button.addEventListener("click", () => {
    windowEl.classList.toggle("open");
  });

  close.addEventListener("click", () => {
    windowEl.classList.remove("open");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      return;
    }

    appendUserMessage(messages, question);

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

      if (!response.ok) {
        throw new Error("AI Worker から正常な応答がありません");
      }

      const responseData = await response.json();

      const answerText =
        responseData.answer || "回答を取得できませんでした。";

      appendAIMessage(messages, answerText);
      renderAIActionButtons(responseData);

      messages.scrollTop = messages.scrollHeight;

    } catch (error) {
      console.error("AIチャットの送信に失敗しました", error);

      appendAIMessage(
        messages,
        "エラーが発生しました。時間をおいて再度お試しください。"
      );
    }
  });
}

function appendUserMessage(messages, text) {
  messages.insertAdjacentHTML(
    "beforeend",
    `<div class="user-message"></div>`
  );

  const userMessage = messages.lastElementChild;
  userMessage.textContent = text;
}

function appendAIMessage(messages, text) {
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

  aiMessage.textContent = text;

  messages.scrollTop = messages.scrollHeight;
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function getBlogTime(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
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
   Initialize
===================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadCommonParts();
  await loadAIChat();

  initializeFadeAnimation();

  await loadEvents();
  await loadTopInformation();
  await loadInformationList();
  await loadTopBlogs();
  await loadSelfBlogs();
  await loadPopularBlogRanking();
});
