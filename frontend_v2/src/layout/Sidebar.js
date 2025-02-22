import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className="d-flex flex-column bg-white text-dark vh-100 shadow p-4" style={{ width: "300px" }}>
      {/* ✅ Logo avec Effet */}
      <h4 className="mb-5 text-center text-primary fw-bold">
        <i className="bi bi-grid-fill me-2"></i> MCBILLING
      </h4>

      <ul className="nav flex-column gap-3">
        {/* ✅ Dashboard avec sous-menus */}
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
        {/* ✅ Clients avec sous-menus */}
        <li className="nav-item">
          <div
            className="nav-link text-dark d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm"
            onClick={() => toggleMenu("clients")}
            style={{ cursor: "pointer", transition: "0.3s" }}
          >
            <span><i className="bi bi-people-fill me-2"></i> Clients</span>
            <i className={`bi ${openMenus.clients ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>
          {openMenus.clients && (
            <ul className="nav flex-column mt-2">
              {[
                { path: "/clients/caller-id", icon: "bi-telephone-inbound", label: "Caller ID" },
                { path: "/clients/live-calls", icon: "bi-broadcast", label: "Live Calls" },
                { path: "/clients/sip-users", icon: "bi-person-bounding-box", label: "SIP Users" }
              ].map((item, index) => (
                <li className="nav-item" key={index}>
                  <Link to={item.path} className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                    <i className={`bi ${item.icon} me-2`}></i> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* ✅ Autres éléments du menu */}
        {[
          { path: "/queue", icon: "bi-list-check", label: "QueueDash" },
          { path: "/Sda", icon: "bi-telephone", label: "My SDA Numbers" },
          { path: "/profile", icon: "bi-person-circle", label: "My Profile" },
          { path: "/pricing", icon: "bi-cash-stack", label: "Pricing" }
        ].map((item, index) => (
          <li className="nav-item" key={index}>
            <Link to={item.path} className="nav-link text-dark py-3 px-3 bg-light rounded shadow-sm hover-effect">
              <i className={`bi ${item.icon} me-2`}></i> {item.label}
            </Link>
          </li>
        ))}

       

        {/* ✅ Reports avec sous-menus */}
        <li className="nav-item">
          <div
            className="nav-link text-dark d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm"
            onClick={() => toggleMenu("reports")}
            style={{ cursor: "pointer", transition: "0.3s" }}
          >
            <span><i className="bi bi-graph-up me-2"></i> Reports</span>
            <i className={`bi ${openMenus.reports ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>
          {openMenus.reports && (
            <ul className="nav flex-column mt-2">
              {[
                { path: "/reports/summary-day", icon: "bi-calendar-day", label: "Summary Per Day" },
                { path: "/reports/summary-month", icon: "bi-calendar-month", label: "Summary Per Month" },
                { path: "/reports/destination", icon: "bi-geo-alt", label: "Reports / Destination" },
                { path: "/reports/inbound", icon: "bi-download", label: "Inbound Reports" }
              ].map((item, index) => (
                <li className="nav-item" key={index}>
                  <Link to={item.path} className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                    <i className={`bi ${item.icon} me-2`}></i> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
