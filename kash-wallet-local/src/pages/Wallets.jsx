import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import ConfirmModal from "../components/ConfirmModal";
import { useApp } from "../context/AppContext";
import { walletBalance } from "../utils/balance";
import { formatRupees, toPaise } from "../utils/money";

export default function Wallets() {
  const { wallets, transactions, addWallet, renameWallet, deleteWallet } = useApp();
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState("");
  const [walletToDelete, setWalletToDelete] = useState(null);

  function handleAdd(event) {
    event.preventDefault();
    const error = addWallet(name, toPaise(initialBalance));
    if (error) {
      setAddError(error);
      return;
    }
    setName("");
    setInitialBalance("0");
    setAddError("");
  }

  function startRename(wallet) {
    setEditingId(wallet.id);
    setEditingName(wallet.name);
    setEditError("");
  }

  function handleRename(id) {
    const error = renameWallet(id, editingName);
    if (error) {
      setEditError(error);
      return;
    }
    setEditingId(null);
    setEditingName("");
    setEditError("");
  }

  function confirmDelete() {
    deleteWallet(walletToDelete.id);
    setWalletToDelete(null);
  }

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>Add wallet</Card.Title>
          {addError && <Alert variant="danger">{addError}</Alert>}
          <Form onSubmit={handleAdd}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="walletName">
                  <Form.Label>Wallet name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    isInvalid={Boolean(addError)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="initialBalance">
                  <Form.Label>Initial balance (Rs.)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialBalance}
                    onChange={(event) => setInitialBalance(event.target.value)}
                    isInvalid={Boolean(addError)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button type="submit" className="btn-brand w-100">
                  Add wallet
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {wallets.length === 0 ? (
        <p className="text-muted">No wallets yet. Add your first wallet above.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {wallets.map((wallet) => {
            const isEditing = editingId === wallet.id;
            return (
              <Col key={wallet.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    {isEditing ? (
                      <>
                        <Form.Label className="visually-hidden">Wallet name</Form.Label>
                        <Form.Control
                          aria-label="Wallet name"
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          isInvalid={Boolean(editError)}
                          autoFocus
                        />
                        {editError && (
                          <Alert variant="danger" className="mt-2 mb-0">
                            {editError}
                          </Alert>
                        )}
                        <div className="d-flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="btn-brand"
                            onClick={() => handleRename(wallet.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Card.Title>{wallet.name}</Card.Title>
                        <div className="fs-3 fw-semibold">
                          {formatRupees(walletBalance(wallet, transactions))}
                        </div>
                        <small className="text-muted">
                          Started with {formatRupees(wallet.initialBalance)}
                        </small>
                        <div className="d-flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => startRename(wallet)}
                          >
                            Rename
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => setWalletToDelete(wallet)}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <ConfirmModal
        show={Boolean(walletToDelete)}
        title={walletToDelete ? `Delete ${walletToDelete.name}?` : "Delete wallet"}
        message="All transactions in this wallet will also be deleted."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setWalletToDelete(null)}
      />
    </>
  );
}
