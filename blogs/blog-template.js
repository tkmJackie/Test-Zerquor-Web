function addBlogSectionNumbers() {

  const sections =
    document.querySelectorAll(".blog-post section");

  sections.forEach((section, index) => {

    const label =
      document.createElement("div");

    label.className =
      "blog-section-label";

    label.textContent =
      `SECTION ${String(index + 1).padStart(2, "0")}`;

    section.prepend(label);

  });
}
