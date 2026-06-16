/* =========================
   Blog Template
   記事ページ用の補助処理
========================= */

function addBlogSectionNumbers() {
  const sections = document.querySelectorAll(".blog-post > section");

  sections.forEach((section, index) => {
    if (section.querySelector(".blog-section-label")) {
      return;
    }

    const label = document.createElement("div");

    label.className = "blog-section-label";

    label.textContent =
      `SECTION ${String(index + 1).padStart(2, "0")}`;

    section.prepend(label);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  addBlogSectionNumbers();
});
