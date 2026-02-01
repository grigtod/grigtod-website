export function wireMenu({ gridId, actions }) {
  const grid = document.getElementById(gridId);
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".tile");
    if (!btn || btn.classList.contains("disabled") || btn.disabled) return;

    const actionName = btn.getAttribute("data-action");
    const fn = actions?.[actionName];
    if (typeof fn === "function") fn();
  });
}
