import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#333",
    padding: "10px",
    color: "#fff",
  };

  const linkStyle = {
    textDecoration: "none",
    color: "#fff",
    margin: "0 10px",
  };

  return (
    <nav style={navStyle}>
      <ul style={{ listStyle: "none", display: "flex", margin: 0, padding: 0 }}>
        <li>
          <Link to="/" style={linkStyle}>Home</Link>
        </li>
        <li>
          <Link to="/GetProducts" style={linkStyle}>Producten</Link>
        </li>
        <li>
          <Link to="/CreateProduct" style={linkStyle}>Create</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
