import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css'; // Correct importation

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className="d-flex flex-column bg-white text-dark vh-100 shadow p-4" style={{ width: "300px" }}>
      <h4 className="mb-5 text-center text-primary fw-bold">
        <i className="bi bi-grid-fill me-2"></i> MCBILLING
      </h4>

      <ul className="nav flex-column gap-3">
        <li className="nav-item">
          <div
            className="nav-link text-dark d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm"
            onClick={() => toggleMenu("dashboard")}
            style={{ cursor: "pointer", transition: "0.3s" }}
          >
            <span><i className="bi bi-speedometer2 me-2"></i> Dashboard</span>
            <i className={`bi ${openMenus.dashboard ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>
           
          {openMenus.dashboard && (
            <ul className="nav flex-column mt-2">
              <li className="nav-item">
                <Link to="/dashboard/activitydash" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-bar-chart me-2"></i> Activity-Dash
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/dashboard/rechargehistory" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> Recharge History
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Autres éléments du menu */}
      </ul>
    </div>
  );
};

export default Sidebar;
