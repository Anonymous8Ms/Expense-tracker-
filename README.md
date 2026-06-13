# Expense Tracker

Pure HTML, CSS, and JavaScript expense tracker with modular ES modules, `localStorage` persistence, filters, sorting, recent history, theme toggle, and responsive layouts.

## Features

- Add, edit, and delete income or expense transactions
- Summary cards powered by `Array.prototype.reduce()`
- Type, category, date-range filters, plus sorting
- Light and dark theme with saved preference
- Recent transactions and expense category breakdown
- Responsive UI for mobile, tablet, and desktop

## Structure

```text
expense-tracker/
├── index.html
├── css/
│   ├── styles.css
│   ├── responsive.css
│   └── theme.css
└── js/
    ├── main.js
    ├── state.js
    ├── crud.js
    ├── render.js
    └── utils.js
```
