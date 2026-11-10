import { useEffect, useState } from "react";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { nowInputValue, toInputValue } from "../utils/format";
import { toPaise } from "../utils/money";

const types = [
  ["INCOME", "Income", "success"],
  ["EXPENSE", "Expense", "danger"],
  ["SAVING", "Saving", "primary"],
];

export default function TransactionForm({ show, onClose, transaction }) {
  const { wallets, addTransaction, updateTransaction } = useApp();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [walletId, setWalletId] = useState("");
  const [date, setDate] = useState(nowInputValue());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount / 100));
      setType(transaction.type);
      setWalletId(transaction.walletId);
      setDate(toInputValue(transaction.date));
      setNote(transaction.note || "");
    } else {
      setAmount("");
      setType("INCOME");
      setWalletId(wallets[0]?.id || "");
      setDate(nowInputValue());
      setNote("");
    }
    setError("");
  }, [transaction, show, wallets]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function clearFormForAnother() {
    setAmount("");
    setNote("");
    setError("");
  }

  function handleSubmit(event, addAnother = false) {
    event.preventDefault();
    let isoDate;
    try {
      isoDate = new Date(date).toISOString();
    } catch {
      setError("Please enter a valid date.");
      return;
    }

    const values = {
      walletId,
      type,
      amount: toPaise(amount),
      date: isoDate,
      note,
    };
    const returnedError = transaction
      ? updateTransaction(transaction.id, values)
      : addTransaction(values);
    if (returnedError) {
      setError(returnedError);
      return;
    }
    if (transaction || !addAnother) {
      onClose();
    } else {
      clearFormForAnother();
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{transaction ? "Edit transaction" : "Add transaction"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!wallets.length ? (
          <p className="mb-0">Create a wallet first. <Link to="/wallets" onClick={onClose}>Go to wallets</Link></p>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="transactionAmount">
              <Form.Label>Amount</Form.Label>
              <InputGroup>
                <InputGroup.Text>Rs.</InputGroup.Text>
                <Form.Control autoFocus type="number" step="0.01" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} isInvalid={Boolean(error)} />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionType">
              <Form.Label>Type</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {types.map(([value, label, variant]) => (
                  <Button key={value} type="button" variant={type === value ? variant : `outline-${variant}`} onClick={() => setType(value)}>
                    {label}
                  </Button>
                ))}
              </div>
              {type === "SAVING" && <Form.Text className="text-muted">Gifts, vouchers, money from family. Adds to your wallet.</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionWallet">
              <Form.Label>Wallet</Form.Label>
              <Form.Select value={walletId} onChange={(event) => setWalletId(event.target.value)} isInvalid={Boolean(error)}>
                {wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionDate">
              <Form.Label>Date &amp; time</Form.Label>
              <Form.Control type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} isInvalid={Boolean(error)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionNote">
              <Form.Label>Note (optional)</Form.Label>
              <Form.Control maxLength={60} placeholder="e.g. Coffee, Auto fare" value={note} onChange={(event) => setNote(event.target.value)} isInvalid={Boolean(error)} />
            </Form.Group>
            <div className="d-flex flex-wrap justify-content-end gap-2">
              <Button variant="outline-secondary" type="button" onClick={onClose}>Cancel</Button>
              {transaction ? (
                <Button className="btn-brand" type="submit">Save changes</Button>
              ) : (
                <>
                  <Button className="btn-brand" type="button" onClick={(event) => handleSubmit(event, true)}>Save and add another</Button>
                  <Button className="btn-brand" type="submit">Save</Button>
                </>
              )}
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}
