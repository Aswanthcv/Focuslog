import { useState } from "react";
import { Alert, Button, Card, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { exportJson, validateImport } from "../storage/storage";

export default function Settings() {
  const {
    wallets,
    transactions,
    importData,
    clearAll,
  } = useApp();
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [backupToImport, setBackupToImport] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountBusy, setAccountBusy] = useState(false);

  function handleExport() {
    exportJson({ wallets, transactions });
  }

  async function handleImport(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    try {
      const imported = JSON.parse(await file.text());
      const error = validateImport(imported);
      if (error) {
        setAlert({ variant: "danger", message: error });
        return;
      }
      setAlert(null);
      setBackupToImport(imported);
    } catch {
      setAlert({ variant: "danger", message: "Could not read this backup file." });
    }
  }

  function confirmImport() {
    const error = importData(backupToImport);
    if (error) {
      setAlert({ variant: "danger", message: error });
    } else {
      setAlert({ variant: "success", message: "Backup imported successfully." });
    }
    setBackupToImport(null);
  }

  function confirmDelete() {
    clearAll();
    setShowDeleteModal(false);
  }

  async function confirmAccountDelete(event) {
    event.preventDefault();
    setAccountBusy(true);
    const error = await deleteAccount(accountPassword);
    if (error) {
      setAccountError(error);
      setAccountBusy(false);
      return;
    }
    setShowAccountModal(false);
    navigate("/login");
  }

  return (
    <>
      <h1 className="mb-4">Settings</h1>
      {alert && <Alert variant={alert.variant}>{alert.message}</Alert>}

      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Card.Title>Export backup</Card.Title>
          <Card.Text className="text-muted">
            Download a copy of your current wallets and transactions.
          </Card.Text>
          <Button className="btn-brand" onClick={handleExport}>
            Export backup
          </Button>
        </Card.Body>
      </Card>

      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Card.Title>Delete my account</Card.Title>
          <Card.Text className="text-muted">
            Delete your account, its data, and your login permanently.
          </Card.Text>
          <Button variant="danger" onClick={() => { setAccountError(""); setAccountPassword(""); setShowAccountModal(true); }}>
            Delete my account
          </Button>
        </Card.Body>
      </Card>

      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Card.Title>Import backup</Card.Title>
          <Card.Text className="text-muted">
            Choose a Kash-Wallet JSON backup to replace your current data.
          </Card.Text>
          <Form.Label htmlFor="backupFile" className="visually-hidden">
            Backup JSON file
          </Form.Label>
          <Form.Control
            id="backupFile"
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
          />
        </Card.Body>
      </Card>

      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Card.Title>Delete all data</Card.Title>
          <Card.Text className="text-muted">
            Permanently remove your profile, wallets and transactions.
          </Card.Text>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete all data
          </Button>
        </Card.Body>
      </Card>

      <p className="text-muted small">
        {wallets.length} wallet{wallets.length === 1 ? "" : "s"} · {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
      </p>

      <ConfirmModal
        show={Boolean(backupToImport)}
        title="Replace all current data with this backup?"
        message="Your current profile, wallets and transactions will be replaced."
        confirmText="Replace data"
        onConfirm={confirmImport}
        onCancel={() => setBackupToImport(null)}
      />
      <ConfirmModal
        show={showDeleteModal}
        title="Delete all data?"
        message="This will permanently delete all wallets, transactions and your profile."
        confirmText="Delete all data"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      <Modal show={showAccountModal} onHide={() => setShowAccountModal(false)} centered>
        <Form onSubmit={confirmAccountDelete}>
          <Modal.Header closeButton>
            <Modal.Title>Delete my account?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>This will permanently delete your account and all of its data.</p>
            {accountError && <Alert variant="danger">{accountError}</Alert>}
            <Form.Group controlId="accountDeletePassword">
              <Form.Label>Enter your password</Form.Label>
              <Form.Control
                type="password"
                value={accountPassword}
                onChange={(event) => setAccountPassword(event.target.value)}
                isInvalid={Boolean(accountError)}
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={() => setShowAccountModal(false)}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={accountBusy}>{accountBusy ? "Deleting..." : "Delete account"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
