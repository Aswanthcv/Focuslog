import { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import ConfirmModal from "../components/ConfirmModal";
import TransactionForm from "../components/TransactionForm";
import { useApp } from "../context/AppContext";
import { formatDate } from "../utils/format";
import { formatRupees } from "../utils/money";

const typeNames = {
  INCOME: "Income",
  EXPENSE: "Expense",
  SAVING: "Saving",
};

function transactionDate(transaction) {
  return new Date(transaction.date);
}

function amountClass(type) {
  return type === "INCOME"
    ? "text-success"
    : type === "EXPENSE"
      ? "text-danger"
      : "text-primary";
}

function displayAmount(transaction) {
  const sign = transaction.type === "EXPENSE" ? "-" : "+";
  return `${sign}${formatRupees(transaction.amount)}`;
}

export default function Transactions() {
  const {
    wallets,
    transactions,
    deleteTransaction,
  } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [walletFilter, setWalletFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const invalidDateRange = fromDate && toDate && fromDate > toDate;
  const visibleTransactions = transactions
    .filter((transaction) => {
      const date = transactionDate(transaction);
      if (walletFilter && transaction.walletId !== walletFilter) return false;
      if (typeFilter && transaction.type !== typeFilter) return false;
      if (fromDate && date < new Date(`${fromDate}T00:00:00`)) return false;
      if (toDate && date > new Date(`${toDate}T23:59:59.999`)) return false;
      return !invalidDateRange;
    })
    .sort((a, b) => transactionDate(b) - transactionDate(a));

  function openAddForm() {
    setEditingTransaction(null);
    setShowForm(true);
  }

  function openEditForm(transaction) {
    setEditingTransaction(transaction);
    setShowForm(true);
  }

  function clearFilters() {
    setWalletFilter("");
    setTypeFilter("");
    setFromDate("");
    setToDate("");
  }

  function walletName(walletId) {
    return wallets.find((wallet) => wallet.id === walletId)?.name || "Unknown wallet";
  }

  function confirmDelete() {
    deleteTransaction(transactionToDelete.id);
    setTransactionToDelete(null);
  }

  function renderActions(transaction) {
    return (
      <div className="d-flex gap-2 justify-content-end">
        <Button size="sm" variant="outline-primary" onClick={() => openEditForm(transaction)}>
          Edit
        </Button>
        <Button size="sm" variant="outline-danger" onClick={() => setTransactionToDelete(transaction)}>
          Delete
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Transactions</h1>
        <Button className="btn-brand" onClick={openAddForm}>Add transaction</Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label htmlFor="walletFilter">Wallet</Form.Label>
              <Form.Select id="walletFilter" value={walletFilter} onChange={(event) => setWalletFilter(event.target.value)}>
                <option value="">All wallets</option>
                {wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label htmlFor="typeFilter">Type</Form.Label>
              <Form.Select id="typeFilter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">All types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="SAVING">Saving</option>
              </Form.Select>
            </Col>
            <Col sm={6} md={2}>
              <Form.Label htmlFor="fromDate">From</Form.Label>
              <Form.Control id="fromDate" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </Col>
            <Col sm={6} md={2}>
              <Form.Label htmlFor="toDate">To</Form.Label>
              <Form.Control id="toDate" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </Col>
            <Col md={3}>
              <Button variant="outline-secondary" onClick={clearFilters}>Clear filters</Button>
            </Col>
          </Row>
          {invalidDateRange && <small className="text-danger">From date must be before To date</small>}
        </Card.Body>
      </Card>

      {visibleTransactions.length === 0 ? (
        <p className="text-muted">No transactions found.</p>
      ) : (
        <>
          <div className="d-none d-md-block">
            <Table responsive hover className="align-middle">
              <thead><tr><th>Details</th><th>Date</th><th className="text-end">Amount</th><th></th></tr></thead>
              <tbody>
                {visibleTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td><div>{transaction.note || typeNames[transaction.type]}</div><small className="text-muted">{walletName(transaction.walletId)}</small></td>
                    <td>{formatDate(transaction.date)}</td>
                    <td className={`text-end ${amountClass(transaction.type)}`}>{displayAmount(transaction)}</td>
                    <td>{renderActions(transaction)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="d-md-none">
            <div className="d-grid gap-3">
              {visibleTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <Card.Body>
                    <div className="d-flex justify-content-between gap-2">
                      <div><div>{transaction.note || typeNames[transaction.type]}</div><small className="text-muted">{walletName(transaction.walletId)}</small></div>
                      <strong className={amountClass(transaction.type)}>{displayAmount(transaction)}</strong>
                    </div>
                    <small className="text-muted d-block mt-2">{formatDate(transaction.date)}</small>
                    <div className="mt-3">{renderActions(transaction)}</div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <TransactionForm
        show={showForm}
        onClose={() => setShowForm(false)}
        transaction={editingTransaction}
      />
      <ConfirmModal
        show={Boolean(transactionToDelete)}
        title="Delete transaction?"
        message="This transaction will be permanently deleted."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setTransactionToDelete(null)}
      />
    </>
  );
}
