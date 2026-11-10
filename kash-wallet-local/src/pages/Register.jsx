import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: "", username: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    const result = await register(form.name, form.username, form.password, form.confirmPassword);
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
            <Form.Group className="mb-3" controlId="registerName">
              <Form.Label>Your name</Form.Label>
              <Form.Control value={form.name} onChange={(event) => update("name", event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control value={form.username} onChange={(event) => update("username", event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} required />
            </Form.Group>
            <Form.Check label="Show password" className="mb-3" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
            <Button type="submit" className="btn-brand w-100" disabled={busy}>
              {busy ? "Creating account..." : "Register"}
            </Button>
          </Form>
          <p className="text-center text-muted mt-3 mb-0">Already have an account? <Link to="/login">Log in</Link></p>
        </Card.Body>
      </Card>
    </div>
  );
}
