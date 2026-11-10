function addTransactionBalance(balance, transaction) {
  if (transaction.type === "EXPENSE") {
    return balance - transaction.amount;
  }
  return balance + transaction.amount;
}

export function walletBalance(wallet, transactions) {
  return transactions
    .filter((transaction) => transaction.walletId === wallet.id)
    .reduce(addTransactionBalance, wallet.initialBalance);
}

export function totalBalance(wallets, transactions) {
  return wallets.reduce(
    (total, wallet) => total + walletBalance(wallet, transactions),
    0
  );
}

export function monthSummary(transactions) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const summary = { income: 0, expense: 0, saving: 0 };

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    if (date >= start && date < end) {
      const key = transaction.type.toLowerCase();
      summary[key] += transaction.amount;
    }
  });

  return summary;
}

// Example: 150000 + 500000 + 100000 - 25050 = 724950 paise.
