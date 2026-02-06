// === Ice Seltzer Count ===
// Data stored in localStorage under key "iceSeltzerCount_v1"
// {
//   items: ["Seltzer"],
//   tallies: { "YYYY-MM-DD": { "Seltzer": 0 } }
// }

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
};

function todayISO() {
  const d = new Date();
  const tzOff = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tzOff * 60000);
  return local.toISOString().slice(0, 10);
}

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

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let state = loadData();
let currentDate = todayISO();

function setDateInput(dateISO) {
  els.datePicker.value = dateISO;
}

function render() {
  setDateInput(currentDate);

  if (!state.tallies[currentDate]) state.tallies[currentDate] = {};

  for (const item of state.items) {
    if (state.tallies[currentDate][item] == null) {
      state.tallies[currentDate][item] = 0;
    }
  }

  els.itemsContainer.innerHTML = "";

  for (const item of state.items) {
    const count = state.tallies[currentDate][item] || 0;
    els.itemsContainer.appendChild(renderItemRow(item, count));
  }

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

function addItem(nameRaw) {
  const name = nameRaw.trim();
  if (!name) return;
  if (state.items.includes(name)) {
    alert("Item already exists.");
    return;
  }
  state.items.push(name);
  if (!state.tallies[currentDate]) state.tallies[currentDate] = {};
  state.tallies[currentDate][name] = 0;
  render();
}

function changeDay(deltaDays) {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + deltaDays);
  const tzOff = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tzOff * 60000);
  currentDate = local.toISOString().slice(0, 10);
  render();
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

function exportJson() {
  const data = JSON.stringify(state, null, 2);
  download(`ice-seltzer-count-${todayISO()}.json`, data);
}

function exportCsv() {
  const rows = [["date", "item", "count"]];
  const dates = Object.keys(state.tallies).sort();
  for (const date of dates) {
    const itemsCounts = state.tallies[date] || {};
    for (const item of Object.keys(itemsCounts)) {
      rows.push([date, item, String(itemsCounts[item] ?? 0)]);
    }
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
    } catch (e) {
      alert("Import failed: invalid JSON format.");
    }
  };
  reader.readAsText(file);
}

function resetDay() {
  if (!confirm(`Reset all counts for ${currentDate}?`)) return;
  if (!state.tallies[currentDate]) state.tallies[currentDate] = {};
  for (const item of state.items) {
    state.tallies[currentDate][item] = 0;
  }
  render();
}

window.addEventListener("DOMContentLoaded", () => {
  currentDate = todayISO();
  els.datePicker.value = currentDate;

  els.prevDay.addEventListener("click", () => changeDay(-1));
  els.nextDay.addEventListener("click", () => changeDay(1));
  els.todayBtn.addEventListener("click", () => { currentDate = todayISO(); render(); });
  els.datePicker.addEventListener("change", (e) => {
    currentDate = e.target.value || todayISO();
    render();
  });

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

  els.resetDayBtn.addEventListener("click", resetDay);
  els.exportJsonBtn.addEventListener("click", exportJson);
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.importJsonInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importJson(file);
    e.target.value = "";
  });

  render();
});
