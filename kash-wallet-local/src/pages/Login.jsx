import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    const result = await login(username, password);
    setError(result || "");
    setBusy(false);
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <Card className="shadow-sm w-100" style={{ maxWidth: "30rem" }}>
        <Card.Body className="p-4">
          <h1 className="text-brand">Kash-Wallet</h1>
          <p className="text-muted">Track every rupee, wallet by wallet.</p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control value={username} onChange={(event) => setUsername(event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </Form.Group>
            <Form.Check label="Show password" className="mb-3" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
            <Button type="submit" className="btn-brand w-100" disabled={busy}>
              {busy ? "Signing in..." : "Log in"}
            </Button>
          </Form>
          <p className="text-center text-muted mt-3 mb-0">New here? <Link to="/register">Create an account</Link></p>
        </Card.Body>
      </Card>
    </div>
  );
}
