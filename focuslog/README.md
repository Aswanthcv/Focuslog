# Focuslog

Focuslog is a small focus timer for people with ADHD. Choose a session length,
focus on one task, then note what you did when the timer ends.

## Why it can help with time blindness

It can be hard to sense how much time has passed when your attention is on a
task. A visible countdown gives time a clear boundary, and the end-of-session
prompt helps you notice and record what you accomplished. Focuslog is a gentle
tool for reflection, not a way to measure productivity.

## Features

- Quick timer choices of 15, 25, 45, or 60 minutes, plus a custom duration.
- Countdown ring with start, pause, resume, and reset controls.
- A gentle three-note finish chime with a saved mute preference.
- Timer continues accurately after background-tab delays and can resume after
  refreshing the same tab.
- Session reflection with a note, focus rating, and optional distraction.
- Recent sessions and history summaries saved in your browser.
- Responsive dark theme.

Session history is stored in this browser's local storage. The active timer and
unfinished reflection are stored in session storage for the current tab, so
refreshing preserves the countdown and any reflection already entered.

## Screenshots

<!-- Replace this placeholder with a screenshot of the app. -->
![Focuslog screenshot placeholder](./screenshots/focuslog-placeholder.png)

## Run locally

You need Node.js 18 or newer and npm.

1. Install the project dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

3. Open the local URL printed by Vite in your browser.

To create and preview a production build:

```sh
npm run build
npm run preview
```

## Future improvements

- Browser notifications when a timer finishes in another tab.
- Export and import session history.
- Adjustable reminders and more timer presets.
- Keyboard shortcuts and additional accessibility options.
