# Ice Seltzer Count

A lightweight, browser-based daily tally app for tracking **Seltzer** usage.

- Data is stored locally in your browser (`localStorage`)
- Navigate days, view a monthly calendar, and see **daily**, **monthly**, and **all‑days** totals
- **Share Link**: encodes the current data into the URL so others can open the exact same state
- Export/Import data as **JSON** and export **CSV**

## Features
- Preloaded item: **Seltzer**
- Increment/decrement counts for the selected day
- **Totals**: Day total, **Month total**, **All Days total**
- Calendar view: click a date to jump and edit; month total shown
- **Share link** button copies a URL with `#data=...` containing the current state
- Export JSON / CSV, Import JSON
- Mobile-friendly design

## Running Locally
Open `index.html` in your browser.

## Deploy on GitHub Pages
1. Push these files to your repo.
2. In GitHub: **Settings → Pages**
3. **Source**: `main` branch, **/ (root)`
4. After ~30–60 seconds, your app will be live.

## Data Model
```json
{
  "items": ["Seltzer"],
  "tallies": {
    "YYYY-MM-DD": { "Seltzer": 0 }
  }
}
```

## Share Link Notes
- The app encodes JSON state in the URL **hash** (after `#`) as Base64.
- Works best for small/medium datasets. If your URL gets too long, we can add compression or a tiny backend for short codes.

## Add More Items (Optional)
Unhide the Add Item section in `styles.css` by removing `.add-item--hidden`.
