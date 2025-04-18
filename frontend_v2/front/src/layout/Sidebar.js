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
  <span><i className="bi bi-telephone-inbound me-2"></i> DIDs</span>
  <i className={`bi ${openMenus.DIDs ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
</div>


          {openMenus.DIDs && (
            <ul className="nav flex-column mt-2">
              
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
  <Link to="/DIDs/DIDsUse" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-person me-2"></i> DIDs Use
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/IVRs" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-sliders me-2"></i> IVRs
  </Link>
</li>
<li className="nav-item">
  <Link to="/DIDs/Queues" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
    <i className="bi bi-speedometer2 me-2"></i> Queues
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
                { path: "/clients/UserHistory", icon: "bi-clock-history", label: "UserHistory" },
                { path: "/clients/Iax", icon: "bi-building", label: "Iax" },
                { path: "/clients/SipUser", icon: "bi-telephone-forward", label: "SIP Users" },                 
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
    <span><i className="bi bi-cash-coin me-2"></i> Rates</span>
    <i className={`bi ${openMenus.Rates ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
  </div>

  {openMenus.Rates && (
    <ul className="nav flex-column mt-2">
      <li className="nav-item">
        <Link to="/Rates/PlanS" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-list-ul me-2"></i> Plans
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/Rates/Tariffs" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-currency-exchange me-2"></i> Tariffs
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/Rates/Prefixes" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-123 me-2"></i> Prefixes
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/Rates/UserCustomRates" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-person-gear me-2"></i> User Custom Rates
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/Rates/Offers" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-gift me-2"></i> Offers
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/Rates/OfferCDR" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-file-earmark-bar-graph me-2"></i> Offer CDR
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/Rates/OfferUse" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-graph-up-arrow me-2"></i> Offer Use
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
    <span><i className="bi bi-graph-up-arrow me-2"></i> Reports</span>
    <i className={`bi ${openMenus.reports ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
  </div>

  {openMenus.reports && (
    <ul className="nav flex-column mt-2">
      {[
        { path: "/reports/CDR", icon: "bi-file-earmark-text", label: "CDR" },
        { path: "/reports/CDRFailed", icon: "bi-x-circle", label: "CDR Failed" },
        { path: "/reports/summary-day", icon: "bi-calendar-day", label: "Summary Per Day" },
        { path: "/reports/summary-month", icon: "bi-calendar-month", label: "Summary Per Month" },
        { path: "/reports/destination", icon: "bi-geo-alt", label: "Reports / Destination" },
        { path: "/reports/inbound", icon: "bi-arrow-down-circle", label: "Inbound Reports" },
        { path: "/reports/SummarymonthUser", icon: "bi-calendar-month", label: "Summary Month User" },
        { path: "/reports/summaryperuser", icon: "bi-person-lines-fill", label: "Summary Per User" },
        { path: "/reports/summarypertrunk", icon: "bi-diagram-3", label: "Summary Per Trunk" },
        { path: "/reports/SummaryMonthTrunk", icon: "bi-calendar3", label: "Summary Month Trunk" },
        { path: "/reports/SummaryDayTrunk", icon: "bi-calendar3-week", label: "Summary Day Trunk" },
        { path: "/reports/CallArchive", icon: "bi-archive", label: "Call Archive" },
        { path: "/reports/SummaryDayUser", icon: "bi-calendar3-week", label: "Summary Day User" }
        
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
    <span><i className="bi bi-signpost-split me-2"></i> Routes</span>
    <i className={`bi ${openMenus.Routes ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
  </div>

  {openMenus.Routes && (
    <ul className="nav flex-column mt-2">
      {[
        { path: "/Routes/Providers", icon: "bi-building", label: "Providers" },
        { path: "/Routes/Trunks", icon: "bi-diagram-3", label: "Trunks" },
        { path: "/Routes/TrunkGroups", icon: "bi-diagram-3-fill", label: "Trunk Groups" },
        { path: "/Routes/ProviderRates", icon: "bi-cash-stack", label: "Provider Rates" },
        { path: "/Routes/Servers", icon: "bi-hdd-network", label: "Servers" },
        { path: "/Routes/TrunkErrors", icon: "bi-exclamation-triangle", label: "Trunk Errors" }
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
