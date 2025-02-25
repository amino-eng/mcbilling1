import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Navbar = () => {
  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        {/* Search Bar */}
        <form className="d-flex mx-auto" style={{ maxWidth: "500px", width: "100%" }}>
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search..."
            aria-label="Search"
          />
          <button className="btn btn-outline-primary" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </form>
        
        {/* User Profile */}
        <div className="dropdown">
          <button
            className="btn btn-light dropdown-toggle d-flex align-items-center"
            type="button"
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src="https://via.placeholder.com/30"
              alt="User"
              className="rounded-circle me-2"
              style={{ width: "30px", height: "30px" }}
            />
            <span className="fw-medium">Eya</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li>
              <Link className="dropdown-item" to="/profile">
                <i className="bi bi-person-circle me-2"></i> Profile
              </Link>
            </li>
            <li>
              <button className="dropdown-item text-danger">
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;