// === Ice Seltzer Count (with Grand Total & Calendar) ===
// Data stored in localStorage under key "iceSeltzerCount_v1"
// Structure: { items: ["Seltzer"], tallies: { "YYYY-MM-DD": { "Seltzer": number } } }

const STORAGE_KEY = "iceSeltzerCount_v1";

const els = {
  datePicker: document.getElementById("datePicker"),
  prevDay: document.getElementById("prevDay"),
  nextDay: document.getElementById("nextDay"),
  todayBtn: document.getElementById("todayBtn"),
  newItemInput: document.getElementById("newItemInput"),
  addItemBtn: document.getElementById("addItemBtn"),
  itemsContainer: document.getElementById("itemsContainer"),
  resetDayBtn: document.getElementById("resetDayBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  importJsonInput: document.getElementById("importJsonInput"),
  dayTotalPill: document.getElementById("dayTotalPill"),
  grandTotalPill: document.getElementById("grandTotalPill"),
  // Calendar
  calPrev: document.getElementById("calPrev"),
  calNext: document.getElementById("calNext"),
  calendarMonthLabel: document.getElementById("calendarMonthLabel"),
  calendarMonthTotal: document.getElementById("calendarMonthTotal"),
  calendarGrid: document.getElementById("calendarGrid"),
};

// --- Date helpers (local time, robust across timezones) ---
function todayISO() {
  const d = new Date();
  return toISODateLocal(d);
}
function toISODateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDaysISO(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISODateLocal(date);
}
function isoFromYMD(y, m0, d) { // m0 = 0..11
  return toISODateLocal(new Date(y, m0, d));
}
function ymdFromISO(iso) {
  const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
  return { y, m, d };
}
function monthLabel(dateObj) {
  return dateObj.toLocaleString(undefined, { month: "long", year: "numeric" });
}

// --- Data ---
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const init = { items: ["Seltzer"], tallies: {} };
    init.tallies[todayISO()] = { Seltzer: 0 };
    return init;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : ["Seltzer"],
      tallies: typeof parsed.tallies === "object" && parsed.tallies ? parsed.tallies : {},
    };
  } catch {
    return { items: ["Seltzer"], tallies: { [todayISO()]: { Seltzer: 0 } } };
  }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

let state = loadData();
let currentDate = todayISO();
let calMonth = new Date(ymdFromISO(currentDate).y, ymdFromISO(currentDate).m - 1, 1);

// --- Totals ---
function getDayTotal(dateISO) {
  const bucket = state.tallies[dateISO] || {};
  let sum = 0;
  for (const key of Object.keys(bucket)) sum += Number(bucket[key] || 0);
  return sum;
}
function getGrandTotal() {
  let sum = 0;
  for (const date of Object.keys(state.tallies)) sum += getDayTotal(date);
  return sum;
}
function getMonthTotal(dateObj) {
  const y = dateObj.getFullYear();
  const m0 = dateObj.getMonth();
  const daysInMonth = new Date(y, m0 + 1, 0).getDate();
  let sum = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = isoFromYMD(y, m0, d);
    sum += getDayTotal(iso);
  }
  return sum;
}

// --- Rendering ---
function render() {
  // Ensure bucket & items
  if (!state.tallies[currentDate]) state.tallies[currentDate] = {};
  for (const item of state.items) if (state.tallies[currentDate][item] == null) state.tallies[currentDate][item] = 0;

  // Controls
  els.datePicker.value = currentDate;

  // Items
  els.itemsContainer.innerHTML = "";
  for (const item of state.items) {
    const count = state.tallies[currentDate][item] || 0;
    els.itemsContainer.appendChild(renderItemRow(item, count));
  }

  // Totals
  els.dayTotalPill.textContent = `Total: ${getDayTotal(currentDate)}`;
  els.grandTotalPill.textContent = `All Days: ${getGrandTotal()}`;

  // Calendar
  renderCalendar();

  saveData(state);
}

function renderItemRow(itemName, count) {
  const card = document.createElement("div");
  card.className = "item-card";

  const name = document.createElement("div");
  name.className = "item-name";
  name.title = itemName;
  name.textContent = itemName;

  const countEl = document.createElement("div");
  countEl.className = "count";
  countEl.textContent = count;

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const decBtn = document.createElement("button");
  decBtn.className = "dec";
  decBtn.textContent = "−";
  decBtn.title = "Decrement";
  decBtn.addEventListener("click", () => {
    const cur = state.tallies[currentDate][itemName] || 0;
    state.tallies[currentDate][itemName] = Math.max(0, cur - 1);
    render();
  });

  const incBtn = document.createElement("button");
  incBtn.className = "inc";
  incBtn.textContent = "+";
  incBtn.title = "Increment";
  incBtn.addEventListener("click", () => {
    const cur = state.tallies[currentDate][itemName] || 0;
    state.tallies[currentDate][itemName] = cur + 1;
    render();
  });

  actions.append(decBtn, incBtn);
  card.append(name, countEl, actions);
  return card;
}

// --- Calendar ---
function renderCalendar() {
  const grid = els.calendarGrid;
  grid.innerHTML = "";

  // Week headers
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (const w of weekdayLabels) {
    const h = document.createElement("div");
    h.className = "cal-head";
    h.textContent = w;
    grid.appendChild(h);
  }

  const y = calMonth.getFullYear();
  const m0 = calMonth.getMonth();
  els.calendarMonthLabel.textContent = monthLabel(calMonth);
  els.calendarMonthTotal.textContent = `Month total: ${getMonthTotal(calMonth)}`;

  const firstOfMonth = new Date(y, m0, 1);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(y, m0 + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-cell cal-empty";
    grid.appendChild(empty);
  }

  const today = todayISO();

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "cal-cell";
    const dateISO = isoFromYMD(y, m0, d);

    if (dateISO === today) cell.classList.add("cal-today");
    if (dateISO === currentDate) cell.classList.add("cal-selected");

    const day = document.createElement("div");
    day.className = "cal-day";
    day.textContent = d;

    const total = getDayTotal(dateISO);
    const totalEl = document.createElement("div");
    totalEl.className = "cal-total";
    totalEl.textContent = total > 0 ? `Total: ${total}` : "";

    cell.title = total > 0 ? `${dateISO} • Total: ${total}` : dateISO;
    cell.append(day, totalEl);

    cell.addEventListener("click", () => {
      currentDate = dateISO;
      render();
    });

    grid.appendChild(cell);
  }
}

// --- Export / Import / Reset ---
function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  URL.revokeObjectURL(url); a.remove();
}
function exportJson() { download(`ice-seltzer-count-${todayISO()}.json`, JSON.stringify(state, null, 2)); }
function exportCsv() {
  const rows = [["date", "item", "count"]];
  const dates = Object.keys(state.tallies).sort();
  for (const date of dates) {
    const itemsCounts = state.tallies[date] || {};
    for (const item of Object.keys(itemsCounts)) rows.push([date, item, String(itemsCounts[item] ?? 0)]);
  }
  const csv = rows.map(r => r.map(field => {
    const s = String(field).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  }).join(",")).join("\n");
  download(`ice-seltzer-count-${todayISO()}.csv`, csv);
}
function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported || typeof imported !== "object") throw new Error("Invalid");
      const items = Array.isArray(imported.items) ? imported.items : ["Seltzer"];
      const tallies = typeof imported.tallies === "object" && imported.tallies ? imported.tallies : {};
      state = { items, tallies };
      render();
      alert("Import successful.");
    } catch (e) { alert("Import failed: invalid JSON format."); }
  };
  reader.readAsText(file);
}
function resetDay() {
  if (!confirm(`Reset all counts for ${currentDate}?`)) return;
  if (!state.tallies[currentDate]) state.tallies[currentDate] = {};
  for (const item of state.items) state.tallies[currentDate][item] = 0;
  render();
}

// --- Navigation ---
function changeDay(deltaDays) {
  currentDate = addDaysISO(currentDate, deltaDays);
  const { y, m } = ymdFromISO(currentDate);
  calMonth = new Date(y, m - 1, 1);
  render();
}

window.addEventListener("DOMContentLoaded", () => {
  currentDate = todayISO();
  const { y, m } = ymdFromISO(currentDate);
  calMonth = new Date(y, m - 1, 1);
  els.datePicker.value = currentDate;

  // Day nav
  els.prevDay.addEventListener("click", () => changeDay(-1));
  els.nextDay.addEventListener("click", () => changeDay(1));
  els.todayBtn.addEventListener("click", () => { currentDate = todayISO(); const { y, m } = ymdFromISO(currentDate); calMonth = new Date(y, m - 1, 1); render(); });
  els.datePicker.addEventListener("change", (e) => { currentDate = e.target.value || todayISO(); const { y, m } = ymdFromISO(currentDate); calMonth = new Date(y, m - 1, 1); render(); });

  // Add-item (works if you unhide the section in CSS)
  if (els.addItemBtn) {
    els.addItemBtn.addEventListener("click", () => {
      addItem(els.newItemInput.value);
      els.newItemInput.value = "";
      els.newItemInput.focus();
    });
    els.newItemInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addItem(els.newItemInput.value);
        els.newItemInput.value = "";
      }
    });
  }

  // Data IO
  els.resetDayBtn.addEventListener("click", resetDay);
  els.exportJsonBtn.addEventListener("click", exportJson);
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.importJsonInput.addEventListener("change", (e) => { const file = e.target.files?.[0]; if (file) importJson(file); e.target.value = ""; });

  // Calendar nav
  els.calPrev.addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); });
  els.calNext.addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); });

  render();
});

// Optional: add new items later
function addItem(nameRaw) {
  const name = nameRaw.trim();
  if (!name) return;
  if (state.items.includes(name)) return alert("Item already exists.");
  state.items.push(name);
  if (!state.tallies[currentDate]) state.tallies[currentDate] = {};
  state.tallies[currentDate][name] = 0;
  render();
}
