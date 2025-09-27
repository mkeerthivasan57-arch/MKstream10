
MKstream_full_combined_v19 - Static Demo Build
=============================================

This is a single-shot, fully combined static web project intended as a complete, editable starting point for your MKstream web app. It is a client-side demo (no server backend) that implements the majority of features you specified, with localStorage used to persist admin uploads and settings.

Included files:
- index.html            (Home page)
- player.html           (Player view)
- admin.html            (Admin panel: login, video editor, web editor, ads manager, password change)
- assets/css/style.css  (Theme + layout; dark-navy)
- assets/js/app.js      (All client-side logic: menus, grids, player, admin)
- data/sample.vtt       (Sample subtitle file)
- README.md             (this file)
- QA_REPORT.txt         (automated QA notes)

Key implemented features (high-level):
- Home: Recently Uploaded, Most Viewed, Today's / Yesterday's specials.
- Categories and subcategories (create via admin).
- Responsive grid: 2 columns mobile, 3 tablet, 5 desktop.
- Centered pagination and centered 'Load More' buttons.
- Hamburger menu (slides from left), close X, categories inside menu. Desktop shows categories in header bar.
- Sky-blue Admin button in header (visible on all pages).
- Search icon toggles into overlay search bar that overlaps the screen.
- Video player (player.html):
  - Works with direct video sources and embed iframe sources.
  - Server dropdown to switch sources; supports multiple servers per episode.
  - Subtitles (.vtt) are supported via <track> elements.
  - Quality selector (playbackRate demo), Download button for direct sources.
  - Gesture controls: double-tap skip +10s, long-press to speed playback, pinch-zoom scale on mobile.
  - Dubbed vs Original versions UI (language select) toggles simulated behavior.
  - Autoplay next episode when current ends.
  - Episode container under player with range selectors (1-100, 101-200...)
- Admin Panel:
  - Default login: admin123 (changeable in Admin > Change Password)
  - Category/Subcategory creation.
  - Video editor: add series, episodes, thumbnail by URL, servers list, subtitles list. 'Upload' = saves to localStorage.
  - Web Editor: change site name, logo URL, header/accent colors, font.
  - Ads manager: paste ad code + frequency.
  - Password change.
- Technical:
  - Lazy-loading images, minimal prefetch demonstration, localStorage caching for DB.
  - Clean install: no demo junk beyond included sample series (editable).
  - Dark navy theme; per-component color settings available in admin.

Limitations & Notes:
- This is a static client-side demo. For production, you will want a backend (DB + media hosting).
- Download button works only for direct video sources (CORS and hosting permitting).
- SEO "auto-updater" updates title/description dynamically client-side but server-rendered meta tags + sitemap are recommended for SEO ranking.
- Ads are injected as raw HTML from admin; be careful when pasting third-party ad code.
- This build focuses on preserving all requested UI/UX features and admin controls in a fully editable single package.

How to use:
1. Unzip and open index.html in a modern browser. Admin is at admin.html. Player opens via Play buttons.
2. Login with password 'admin123' to edit settings and upload content.
3. Uploaded series and changes are saved to your browser's localStorage.

This deliverable was created to respect your instruction: keep all features, do not shorten code, and present a full single combined package for immediate testing and further extension.
