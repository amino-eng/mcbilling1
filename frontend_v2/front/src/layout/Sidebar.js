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
        
        <li className="nav-item">
          <div
            className="nav-link text-dark d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm"
            onClick={() => toggleMenu("DIDs")}
            style={{ cursor: "pointer", transition: "0.3s" }}
          >
            <span><i className="bi bi-speedometer2 me-2"></i> DIDs</span>
            <i className={`bi ${openMenus.DIDs ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>

          {openMenus.DIDs && (
            <ul className="nav flex-column mt-2">
              <li className="nav-item">
  <Link to="/DIDs/Queue" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-list-ol me-2"></i> QueueDash
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/DIDs" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-telephone me-2"></i> DIDs
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/DIDDestination" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-signpost me-2"></i> DID Destination
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/DIDsUser" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-person me-2"></i> DIDs User
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/IVRs" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-sliders me-2"></i> IVRs
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/QueuesMembres" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-people me-2"></i> Queues Membres
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/QueuesDashboard" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-speedometer2 me-2"></i> QueuesDashboard
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/Holidays" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-calendar-event me-2"></i> Holidays
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/DIDHistory" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-clock-history me-2"></i> DID History
  </Link>
</li>
     
            </ul>
          )}
        </li>
         
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
                { path: "/clients/caller-id", icon: "bi-phone", label: "Caller ID" },
                { path: "/clients/Users", icon: "bi-people", label: "Users" },
                { path: "/clients/Users", icon: "bi-router", label: "ATA Linksys" },
                { path: "/clients/UserHistory", icon: "bi-clock-history", label: "UserHistory" },
                { path: "/clients/Lax", icon: "bi-building", label: "Lax" },
                { path: "/clients/ATALinksys", icon: "bi-hdd-network", label: "ATA Linksys" },
                { path: "/clients/sip-users", icon: "bi-telephone-forward", label: "SIP Users" },
                { path: "/clients/RestricNumber", icon: "bi-ban", label: "RestricNumber" },
                 // ✅ Updated Icon
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
        <li className="nav-item">
        <div
  className="nav-link text-dark d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm"
  onClick={() => toggleMenu("Billing")}
  style={{ cursor: "pointer", transition: "0.3s" }}
>
  <span><i className="bi bi-wallet2 me-2"></i> Billing</span>
  <i className={`bi ${openMenus.Billing ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
</div>

{openMenus.Billing && (
  <ul className="nav flex-column mt-2">
    <li className="nav-item">
      <Link to="/Billing/Refills" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
        <i className="bi bi-cash-stack me-2"></i> Refills
      </Link>
    </li>
    <li className="nav-item">
      <Link to="/Billing/PaymentMethods" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
        <i className="bi bi-credit-card me-2"></i> Payment Methods
      </Link>
    </li>
    <li className="nav-item">
      <Link to="/Billing/Voucher" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
        <i className="bi bi-ticket-perforated me-2"></i> Voucher
      </Link>
    </li>
    <li className="nav-item">
      <Link to="/Billing/RefillProviders" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
        <i className="bi bi-shop me-2"></i> Refill Providers
      </Link>
    </li>
  </ul>
)}

        </li>

        <li className="nav-item">
          <div
            className="nav-link text-dark d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm"
            onClick={() => toggleMenu("Rates")}
            style={{ cursor: "pointer", transition: "0.3s" }}
          >
            <span><i className="bi bi-speedometer2 me-2"></i> Rates</span>
            <i className={`bi ${openMenus.Rates ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>

          {openMenus.Rates && (
            <ul className="nav flex-column mt-2">
              <li className="nav-item">
                <Link to="/Rates/PlanS" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-bar-chart me-2"></i> plans
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Rates/Tariffs" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> Tariffs
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Rates/Prefixes" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> Prefixes
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Rates/UserCustomRates" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> User Custom Rates
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Rates/Offers" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> Offers
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Rates/OfferCDR" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> Offer CDR
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Rates/OfferUse" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> Offer Use
                </Link>
              </li>

            </ul>
          )}
        </li>

        {[
          { path: "/clients/live-calls", icon: "bi-broadcast", label: "Live Calls" },
          
          { path: "/Sda", icon: "bi-telephone", label: "My SDA Numbers" },
          { path: "/profile", icon: "bi-person-circle", label: "My Profile" },
          
        ].map((item, index) => (
          <li className="nav-item" key={index}>
            <Link to={item.path} className="nav-link text-dark py-3 px-3 bg-light rounded shadow-sm hover-effect">
              <i className={`bi ${item.icon} me-2`}></i> {item.label}
            </Link>
          </li>
        ))}
        

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
                { path: "/reports/CDR", icon: "bi-calendar-day", label: "CDR" },
                { path: "/reports/CDRFailed", icon: "bi-calendar-day", label: "CDR Failed" },
                { path: "/reports/summary-day", icon: "bi-calendar-day", label: "Summary Per Day" },
                
                { path: "/reports/summary-month", icon: "bi-calendar-month", label: "Summary Per Month" },
                { path: "/reports/destination", icon: "bi-geo-alt", label: "Reports / Destination" },
                { path: "/reports/inbound", icon: "bi-download", label: "Inbound Reports" },
                { path: "/reports/summaryperuser", icon: "bi-download", label: "Summary Per User" },
                { path: "/reports/summarypertrunk", icon: "bi-download", label: "Summary Per Trunk" },
                { path: "/reports/SummaryMonthTrunk", icon: "bi-download", label: "Summary Month Trunk" },
                { path: "/reports/SummaryDayTrunk", icon: "bi-download", label: "Summary Day Trunk" },
                { path: "/reports/CallArchive", icon: "bi-download", label: "Call Archive" }

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
        <li className="nav-item">
          <div
            className="nav-link text-dark d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm"
            onClick={() => toggleMenu("Routes")}
            style={{ cursor: "pointer", transition: "0.3s" }}
          >
            <span><i className="bi bi-graph-up me-2"></i> Routes</span>
            <i className={`bi ${openMenus.Routes ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>

          {openMenus.Routes && (
            <ul className="nav flex-column mt-2">
              {[
                { path: "/Routes/Providers", icon: "bi-calendar-day", label: "Providers" },
                { path: "/Routes/Trunks", icon: "bi-calendar-day", label: "Trunks" },
                { path: "/Routes/TrunkGroups", icon: "bi-calendar-day", label: "Trunk Groups" },
                { path: "/Routes/ProviderRates", icon: "bi-calendar-month", label: "Provider Rates" },
                { path: "/Routes/Servers", icon: "bi-geo-alt", label: "Servers" },
                { path: "/Routes/TrunkErrors", icon: "bi-download", label: "Trunk Errors" }
               

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
