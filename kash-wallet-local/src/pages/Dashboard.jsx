import { useState } from "react";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { monthSummary, totalBalance, walletBalance } from "../utils/balance";
import { formatDate } from "../utils/format";
import { formatRupees } from "../utils/money";

const typeNames = {
  INCOME: "Income",
  EXPENSE: "Expense",
  SAVING: "Saving",
};

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return "Good morning";
  if (hour >= 12 && hour <= 16) return "Good afternoon";
  return "Good evening";
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

export default function Dashboard() {
  const { user } = useAuth();
  const { wallets, transactions } = useApp();
  const [showForm, setShowForm] = useState(false);
  const summary = monthSummary(transactions);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  function walletName(walletId) {
    return wallets.find((wallet) => wallet.id === walletId)?.name || "Unknown wallet";
  }

  return (
    <>
      <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start mb-4">
        <div>
          <h1>{greeting()}, {user?.name} 👋</h1>
          <p className="text-muted mb-0">Here's your money at a glance.</p>
        </div>
        {wallets.length ? (
          <Button className="btn-brand" onClick={() => setShowForm(true)}>
            + Add transaction
          </Button>
        ) : (
          <Alert variant="warning" className="mb-0">
            Create a wallet first. <Link to="/wallets">Go to wallets</Link>
          </Alert>
        )}
      </div>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Text className="text-muted mb-1">Total balance</Card.Text>
          <div className="display-5 fw-semibold">{formatRupees(totalBalance(wallets, transactions))}</div>
        </Card.Body>
      </Card>

      <Row xs={1} sm={3} className="g-3 mb-4">
        <Col>
          <Card className="h-100"><Card.Body><Card.Text className="text-muted mb-1">Income</Card.Text><div className="fs-4 fw-semibold text-success">{formatRupees(summary.income)}</div></Card.Body></Card>
        </Col>
        <Col>
          <Card className="h-100"><Card.Body><Card.Text className="text-muted mb-1">Spent</Card.Text><div className="fs-4 fw-semibold text-danger">{formatRupees(summary.expense)}</div></Card.Body></Card>
        </Col>
        <Col>
          <Card className="h-100"><Card.Body><Card.Text className="text-muted mb-1">Savings received</Card.Text><div className="fs-4 fw-semibold text-primary">{formatRupees(summary.saving)}</div></Card.Body></Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Wallets</h2>
        <Link to="/wallets">View all</Link>
      </div>
      {wallets.length ? (
        <Row xs={1} md={2} lg={3} className="g-3 mb-4">
          {wallets.map((wallet) => (
            <Col key={wallet.id}>
              <Card className="h-100"><Card.Body><Card.Title>{wallet.name}</Card.Title><div className="fs-4">{formatRupees(walletBalance(wallet, transactions))}</div></Card.Body></Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-muted">No wallets yet.</p>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Recent transactions</h2>
        <Link to="/transactions">View all</Link>
      </div>
      {recentTransactions.length ? (
        <Card className="mb-4">
          <Card.Body className="p-0">
            {recentTransactions.map((transaction, index) => (
              <div key={transaction.id} className={`d-flex justify-content-between gap-3 p-3 ${index ? "border-top" : ""}`}>
                <div className="min-w-0"><div className="text-truncate">{transaction.note || typeNames[transaction.type]}</div><small className="text-muted">{walletName(transaction.walletId)} · {formatDate(transaction.date)}</small></div>
                <div className={`fw-semibold text-nowrap ${amountClass(transaction.type)}`}>{displayAmount(transaction)}</div>
              </div>
            ))}
          </Card.Body>
        </Card>
      ) : (
        <p className="text-muted">No transactions yet.</p>
      )}

      <TransactionForm show={showForm} onClose={() => setShowForm(false)} transaction={null} />
    </>
  );
}
