// Size the viewport to complete news entries, including when text wraps on mobile.
document.querySelectorAll("[data-news-visible]").forEach((feed) => {
  const list = feed.querySelector(".news-list");
  const visibleCount = Math.max(1, Number.parseInt(feed.dataset.newsVisible, 10) || 5);
  const updateHeight = () => {
    const items = Array.from(list.children);
    if (items.length <= visibleCount) {
      feed.style.maxHeight = "none";
      return;
    }
    const first = items[0].getBoundingClientRect();
    const last = items[visibleCount - 1].getBoundingClientRect();
    feed.style.maxHeight = `${Math.ceil(last.bottom - first.top)}px`;
  };
  updateHeight();
  if ("ResizeObserver" in window) {
    new ResizeObserver(updateHeight).observe(list);
  } else {
    window.addEventListener("resize", updateHeight);
  }
  window.addEventListener("load", updateHeight, { once: true });
  if (document.fonts) document.fonts.ready.then(updateHeight);
});
