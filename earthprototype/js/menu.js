export function wireMenu({ gridId, actions, initialActiveAction }) {
  const grid = document.getElementById(gridId);

  function setActiveTile(actionName) {
    const tiles = grid.querySelectorAll(".tile[data-action]");
    tiles.forEach((tile) => {
      tile.classList.toggle("is-active", tile.getAttribute("data-action") === actionName);
    });
  }

  if (initialActiveAction) {
    setActiveTile(initialActiveAction);
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".tile");
    if (!btn || btn.classList.contains("disabled") || btn.disabled) return;

    const actionName = btn.getAttribute("data-action");
    const fn = actions?.[actionName];
    if (typeof fn === "function") {
      setActiveTile(actionName);
      fn();
    }
  });
}
