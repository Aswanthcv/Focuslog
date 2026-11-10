import { NavLink } from "react-router-dom";
import "./Navbar.css";

// Show links to the timer home and session history.
function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink className="navbar-brand" to="/">
        focuslog<span>.</span>
      </NavLink>
      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "navbar-link active" : "navbar-link"
          }
        >
          Focus
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? "navbar-link active" : "navbar-link"
          }
        >
          History
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
