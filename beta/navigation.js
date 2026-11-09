// History entries contain small UI hints; planner results stay in memory.
// After a reload, the URL reconstructs entries that are no longer cached.
export function createNavigation({ capture, restore, restorePosition, onError }) {
  const marker = "irailBeta", entries = new Map();
  let ready = false, revision = 0;
  let currentId = history.state?.[marker]?.id ?? crypto.randomUUID();
  let currentUrl = location.href;
  const metadata = snapshot => ({ id: currentId, scroll: snapshot.scroll, expanded: snapshot.expanded, trainHighlight: snapshot.trainHighlight });
  function remember({ persist = true } = {}) {
    if (!ready) return;
    const snapshot = capture(new URL(currentUrl));
    // A detail link checkpoints before changing tabs. A search in the new
    // tab must not overwrite the departing view's saved scroll position.
    if (snapshot.view !== snapshot.activeView) return;
    entries.set(currentId, snapshot);
    if (persist) history.replaceState({ ...history.state, [marker]: metadata(snapshot) }, "", currentUrl);
    while (entries.size > 40) entries.delete(entries.keys().next().value);
  }
  function position(snapshot, mine) {
    requestAnimationFrame(() => { if (mine === revision) restorePosition(snapshot); });
  }
  async function traverse(event) {
    // The browser has already changed the URL. Save the departing view in
    // memory without replacing the destination's browser history entry.
    remember({ persist: false });
    const mine = ++revision;
    currentId = event.state?.[marker]?.id ?? crypto.randomUUID();
    currentUrl = location.href;
    const snapshot = entries.get(currentId);
    const ui = snapshot ?? event.state?.[marker] ?? { scroll: [0, 0] };
    await restore(snapshot, new URL(currentUrl));
    if (mine !== revision) return;
    remember();
    position(ui, mine);
  }
  return {
    remember,
    start() {
      const ui = history.state?.[marker];
      ready = true; history.scrollRestoration = "manual";
      remember();
      if (ui) position(ui, revision);
      window.addEventListener("popstate", event => { traverse(event).catch(onError); });
    },
    commit(url, { replace = false } = {}) {
      if (!ready) return;
      const target = new URL(url, location.href).href;
      ++revision;
      if (target !== currentUrl && !replace) currentId = crypto.randomUUID();
      const snapshot = capture(new URL(target));
      const data = { ...history.state, [marker]: metadata(snapshot) };
      if (replace || target === currentUrl) history.replaceState(data, "", target);
      else history.pushState(data, "", target);
      currentUrl = target; entries.set(currentId, snapshot);
    },
  };
}
