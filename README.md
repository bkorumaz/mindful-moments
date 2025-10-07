# Personal Daily Dashboard (v0.5.1)

**What’s fixed**
- Crash in **Habits** when old localStorage habits lacked a `history` object. Added a migration + guards.
- Replaced `hover:bg-muted` with safe Tailwind pairs (`hover:bg-slate-100 dark:hover:bg-slate-800`) to avoid style mismatches.
- Added a simple **ErrorBoundary** with a one-click “Reset Local Data” button to prevent blank screens.
- Kept all v0.5 features: greeting-as-title in Here & Now, global ambient, single-line Watchlist, Habits present.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

If you previously opened an older version, you might need to clear localStorage once:
- Click the “Reset Local Data” in the error screen (if shown), or
- Manually: DevTools → Application → Local Storage → Clear site data.