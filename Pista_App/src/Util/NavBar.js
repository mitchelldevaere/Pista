import React from "react";
import { Link } from "react-router-dom";
import "../styles/navBar.css";

const NavBar = () => {
  return (
    <nav className="navbar">
      <span className="navbar-brand">La Pista</span>
      <ul className="navbar-links">
        <li>
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li>
          <Link to="/GetProducts" className="navbar-link">Dashboard</Link>
        </li>
        <li>
          <Link to="/products" className="navbar-link">Producten</Link>
        </li>
        <li>
          <Link to="/ordersHistory" className="navbar-link">Bestellingen</Link>
        </li>
        <li>
          <Link to="/financial" className="navbar-link">Financieel</Link>
        </li>
        <li>
          <Link to="/CreateProduct" className="navbar-link">Create</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
