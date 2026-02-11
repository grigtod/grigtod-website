export function createPoiOverlay({
  overlayEl,
  frameEl,
  closeBtnEl,
  completeBtnEl,
  completeLabelEl
}) {
  if (!overlayEl || !frameEl) throw new Error("overlayEl and frameEl are required");

  let activePoiId = null;
  let pendingFrameUrl = null;
  let pendingFrameToken = null;

  const COMPLETED_STORAGE_KEY = "discoverTG.completedPois.v1";

  function loadCompletedSet() {
    try {
      const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function saveCompletedSet(set) {
    localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify([...set]));
  }

  const completedPois = loadCompletedSet();

  function setHidden(hidden) {
    overlayEl.classList.toggle("poi-overlay-hidden", hidden);
    overlayEl.setAttribute("aria-hidden", hidden ? "true" : "false");
  }

  function setLoading(loading) {
    overlayEl.classList.toggle("is-loading", loading);
  }

  function normalizeUrl(url) {
    try {
      return new URL(url, window.location.href).toString();
    } catch {
      return String(url);
    }
  }

  function syncCompleteUi() {
    if (!completeBtnEl || !completeLabelEl) return;
    if (!activePoiId) return;

    const isDone = completedPois.has(activePoiId);

    completeBtnEl.classList.toggle("is-complete", isDone);
    completeBtnEl.setAttribute("aria-pressed", isDone ? "true" : "false");
    completeLabelEl.textContent = isDone ? "Completed" : "Complete";
  }

  function open({ url, poiId }) {
    activePoiId = poiId ?? null;

    const u = new URL(url, window.location.href);
    if (activePoiId) u.searchParams.set("poiId", activePoiId);

    const targetUrl = u.toString();
    const token = Symbol("poi-open");
    pendingFrameUrl = targetUrl;
    pendingFrameToken = token;

    setLoading(true);
    setHidden(false);
    syncCompleteUi();

    const navigateToTarget = () => {
      if (pendingFrameToken !== token) return;
      frameEl.src = targetUrl;
    };

    if (normalizeUrl(frameEl.src) === "about:blank") {
      navigateToTarget();
      return;
    }

    frameEl.src = "about:blank";
    setTimeout(navigateToTarget, 0);
  }

  function close() {
    pendingFrameUrl = null;
    pendingFrameToken = null;
    setLoading(false);
    frameEl.src = "about:blank";
    setHidden(true);
    activePoiId = null;
  }

  function toggleComplete() {
    if (!activePoiId) return;

    if (completedPois.has(activePoiId)) completedPois.delete(activePoiId);
    else completedPois.add(activePoiId);

    saveCompletedSet(completedPois);
    syncCompleteUi();

    document.dispatchEvent(new CustomEvent("poi:complete-changed"));
  }

  function isCompleted(id) {
    return completedPois.has(id);
  }

  function getActivePoiId() {
    return activePoiId;
  }

  function isOpen() {
    return !overlayEl.classList.contains("poi-overlay-hidden");
  }

  function attachListeners() {
    if (closeBtnEl) closeBtnEl.addEventListener("click", close);
    if (completeBtnEl) completeBtnEl.addEventListener("click", toggleComplete);
    frameEl.addEventListener("load", () => {
      if (!pendingFrameUrl) return;
      if (normalizeUrl(frameEl.src) !== pendingFrameUrl) return;
      pendingFrameUrl = null;
      pendingFrameToken = null;
      setLoading(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) close();
    });
  }

  attachListeners();

  return {
    open,
    close,
    toggleComplete,
    isCompleted,
    getActivePoiId,
    isOpen
  };
}
