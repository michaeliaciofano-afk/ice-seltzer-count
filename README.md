# Ice Seltzer Count

A lightweight, browser-based daily tally app for tracking **Seltzer** usage. No backend required—data is saved locally in your browser (`localStorage`). Export or import your data anytime.

## Features
- Preloaded item: **Seltzer**
- Increment/decrement counts for the selected day
- Navigate days (previous/next, jump to today)
- Reset counts for the selected day
- Export data as **JSON** or **CSV**
- Import from **JSON**
- Mobile-friendly design

## Run locally
Open `index.html` in your browser.

## Host on GitHub Pages
1. Push this project to a public repo named **Ice Seltzer Count** (GitHub may slug it as `Ice-Seltzer-Count`).
2. In GitHub, go to **Settings → Pages**.
3. Under **Branch**, select `main` and **/ (root)**, then **Save**.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Notes
- Data is device-specific. Use **Export JSON** to back up.
- To add more items later, unhide the Add Item section in `styles.css` by removing `.add-item--hidden`.
