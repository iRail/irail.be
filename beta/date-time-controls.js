import { dateInputToIso, isoToDateInput } from "./date-time.js";

// Match the main site's explicit DD/MM/YYYY and 24-hour display, with the
// browser's native picker available as an optional way to enter the value.
export function bindDateTimeControls() {
  document.querySelectorAll("[data-date-time]").forEach(input => {
    const picker = document.createElement("input");
    picker.type = input.dataset.dateTime;
    if (typeof picker.showPicker !== "function") return;
    picker.className = "date-time-native-picker";
    picker.tabIndex = -1;
    picker.setAttribute("aria-hidden", "true");
    if (picker.type === "time") picker.step = "60";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "date-time-picker-button";
    button.setAttribute("aria-label", input.dataset.dateTime === "date" ? "DD/MM/YYYY" : "HH:MM");
    button.innerHTML = picker.type === "date"
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
    button.addEventListener("click", () => {
      picker.value = picker.type === "date" ? dateInputToIso(input.value) : input.value;
      try { picker.showPicker(); } catch { input.focus(); }
    });
    picker.addEventListener("change", () => {
      input.value = picker.type === "date" ? isoToDateInput(picker.value) : picker.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });
    const control = document.createElement("div");
    control.className = "date-time-control";
    input.replaceWith(control);
    control.append(input, button, picker);
  });
}
