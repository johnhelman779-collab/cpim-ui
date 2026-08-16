import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { setToken } from "../api/client";

export default function Shell() {
  const navigate = useNavigate();

  function logout() {
    setToken(null);
    navigate("/login");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">CPIM</span>
          <span className="brand-sub">Computer Integration Management · v0.1.1</span>
        </div>
        <nav className="nav">
          <NavLink to="/devices">Devices</NavLink>
          <NavLink to="/exceptions">Exceptions</NavLink>
        </nav>
        <button type="button" className="ghost-btn" onClick={logout}>
          Sign out
        </button>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
