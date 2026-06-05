document.addEventListener("DOMContentLoaded", () => {
  loadConnpassEvents();
});

async function loadConnpassEvents() {
  const container = document.getElementById("connpass-events");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("https://api.zerquor.com/connpass-events");

    if (!response.ok) {
      throw new Error("イベント情報の取得に失敗しました。");
    }

    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];

    if (events.length === 0) {
      container.innerHTML = `
        <p class="events-message">現在、開催予定のセミナーはありません。</p>
      `;
      return;
    }

    container.innerHTML = events.map(createEventCard).join("");
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p class="events-message">
        イベント情報を取得できませんでした。<br>
        最新情報はconnpassページをご確認ください。
      </p>
    `;
  }
}

function createEventCard(event) {
  const title = escapeHtml(event.title || "タイトル未定");
  const eventUrl = escapeHtml(event.event_url || "#");
  const dateText = escapeHtml(formatEventDate(event.started_at));
  const place = escapeHtml(event.place || event.address || "オンライン / 詳細はconnpassをご確認ください");
  const accepted = Number.isFinite(event.accepted) ? event.accepted : null;
  const limit = Number.isFinite(event.limit) ? event.limit : null;

  let metaText = "";

  if (accepted !== null && limit !== null && limit > 0) {
    metaText = `${accepted} / ${limit} 名`;
  } else if (accepted !== null) {
    metaText = `${accepted} 名参加予定`;
  } else {
    metaText = "詳細はconnpassをご確認ください";
  }

  return `
    <article class="event-card">
      <p class="event-date">${dateText}</p>
      <h3 class="event-title">${title}</h3>
      <p class="event-place">${place}</p>
      <p class="event-meta">${escapeHtml(metaText)}</p>
      <a class="event-link" href="${eventUrl}" target="_blank" rel="noopener noreferrer">
        詳細・申込みを見る
      </a>
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
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
