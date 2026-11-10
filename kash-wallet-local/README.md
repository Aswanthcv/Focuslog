# Kash-Wallet

Kash-Wallet is a frontend-only personal finance tracker for managing wallets
and recording income, expenses, and savings.

## Features

- Create, rename, and delete wallets
- Track income, expenses, and savings in each wallet
- View balances, monthly summaries, and recent transactions
- Filter transactions by wallet, type, and date range
- Export and import JSON backups
- Store money as integer paise to avoid decimal calculation errors

## Tech stack

React with Vite, JavaScript, React-Bootstrap, Bootstrap 5,
bootstrap-icons, and react-router-dom.

## Run locally

```bash
npm install
npm run dev
```

## Data storage

All data stays in the browser's localStorage under the single key
`kashwallet:v1`:

```js
{
  profile: { name } | null,
  wallets: [{ id, name, initialBalance, createdAt }],
  transactions: [{ id, walletId, type, amount, date, note }]
}
```

Money amounts are stored as integer paise. There is no backend, so data does
not leave the browser. Export regular backups from Settings, especially before
clearing browser storage or changing devices.
