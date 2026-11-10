import { useState } from "react";
import { Container, Nav, Navbar as BootstrapNavbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../context/AuthContext";

const links = [
  ["Dashboard", "/"],
  ["Wallets", "/wallets"],
  ["Transactions", "/transactions"],
  ["Settings", "/settings"],
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  function confirmLogout() {
    logout();
    setShowLogout(false);
    navigate("/login");
  }

  return (
    <>
      <BootstrapNavbar expand="md" bg="white" className="border-bottom">
      <Container>
        <BootstrapNavbar.Brand as={NavLink} to="/" className="text-brand">
          Kash-Wallet
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="main-navigation" />
        <BootstrapNavbar.Collapse id="main-navigation">
          <Nav className="ms-auto">
            {links.map(([label, path]) => (
              <Nav.Link
                as={NavLink}
                to={path}
                end={path === "/"}
                key={path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </Nav.Link>
            ))}
            <Nav.Item className="d-flex align-items-center ms-md-3">
              <span className="text-muted me-3">{user?.name}</span>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowLogout(true)}>
                Logout
              </button>
            </Nav.Item>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
      </BootstrapNavbar>
      <ConfirmModal
        show={showLogout}
        title="Log out?"
        message="You can log in again whenever you return."
        confirmText="Logout"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogout(false)}
      />
    </>
  );
}
