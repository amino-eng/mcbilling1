import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./sidebar.css";

// Menu data structure
const menuItems = {

  DIDs: [
    { path: "/DIDs/DIDs", icon: "bi-telephone", label: "DIDs" },
    { path: "/DIDs/DIDDestination", icon: "bi-signpost", label: "DID Destination" },
    { path: "/DIDs/DIDsUse", icon: "bi-person", label: "DIDs Use" },
    { path: "/DIDs/IVRs", icon: "bi-sliders", label: "IVRs" },
    { path: "/DIDs/Queues", icon: "bi-speedometer2", label: "Queues" },
    { path: "/DIDs/QueuesMembres", icon: "bi-people", label: "Queues Membres" },
    { path: "/DIDs/QueuesDashboard", icon: "bi-speedometer2", label: "Queues Dashboard" },
    { path: "/DIDs/Holidays", icon: "bi-calendar-event", label: "Holidays" },
    { path: "/DIDs/DIDHistory", icon: "bi-clock-history", label: "DID History" }
  ],
  clients: [
    { path: "/clients/caller-id", icon: "bi-phone", label: "Caller ID" },
    { path: "/clients/Users", icon: "bi-people", label: "Users" },
    { path: "/clients/Iax", icon: "bi-building", label: "Iax" },
    { path: "/clients/SipUser", icon: "bi-telephone-forward", label: "SIP Users" },
    { path: "/clients/RestricNumber", icon: "bi-ban", label: "RestricNumber" }
  ],
  Billing: [
    { path: "/Billing/Refills", icon: "bi-cash-stack", label: "Refills" },
    { path: "/Billing/PaymentMethods", icon: "bi-credit-card", label: "Payment Methods" },
    { path: "/Billing/Voucher", icon: "bi-ticket-perforated", label: "Voucher" },
    { path: "/Billing/RefillProviders", icon: "bi-shop", label: "Refill Providers" }
  ],
  Rates: [
    { path: "/Rates/PlanS", icon: "bi-list-ul", label: "Plans" },
    { path: "/Rates/Tariffs", icon: "bi-currency-exchange", label: "Tariffs" },
    { path: "/Rates/Prefixes", icon: "bi-123", label: "Prefixes" },
    { path: "/Rates/UserCustomRates", icon: "bi-person-gear", label: "User Custom Rates" },
    { path: "/Rates/Offers", icon: "bi-gift", label: "Offers" },
    { path: "/Rates/OfferCDR", icon: "bi-file-earmark-bar-graph", label: "Offer CDR" },
    { path: "/Rates/OfferUse", icon: "bi-graph-up-arrow", label: "Offer Use" }
  ],
  reports: [
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
  ],
  Routes: [
    { path: "/Routes/Providers", icon: "bi-building", label: "Providers" },
    { path: "/Routes/Trunks", icon: "bi-diagram-3", label: "Trunks" },
    { path: "/Routes/TrunkGroups", icon: "bi-diagram-3-fill", label: "Trunk Groups" },
    { path: "/Routes/ProviderRates", icon: "bi-cash-stack", label: "Provider Rates" },
    { path: "/Routes/Servers", icon: "bi-hdd-network", label: "Servers" },
    { path: "/Routes/TrunkErrors", icon: "bi-exclamation-triangle", label: "Trunk Errors" }
  ]
};

// Menu category icons and labels
const menuCategories = {
  dashboard: { icon: "bi-speedometer2", label: "Dashboard" },
  DIDs: { icon: "bi-telephone-inbound", label: "DIDs" },
  clients: { icon: "bi-people-fill", label: "Clients" },
  Billing: { icon: "bi-wallet2", label: "Billing" },
  Rates: { icon: "bi-cash-coin", label: "Rates" },
  reports: { icon: "bi-graph-up-arrow", label: "Reports" },
  Routes: { icon: "bi-signpost-split", label: "Routes" }
};

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState({});
  const location = useLocation();

  // Auto-expand the menu containing the current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find which menu contains the current path
    for (const [menu, items] of Object.entries(menuItems)) {
      const found = items.some(item => currentPath === item.path);
      if (found) {
        setOpenMenus(prev => ({ ...prev, [menu]: true }));
        break;
      }
    }
  }, [location.pathname]);

  // Handle search functionality
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(menuItems);
      return;
    }

    const filtered = {};
    
    Object.entries(menuItems).forEach(([category, items]) => {
      const matchingItems = items.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems;
      }
    });
    
    setFilteredItems(filtered);
    
    // Open all menus that have matching items
    const newOpenMenus = {};
    Object.keys(filtered).forEach(menu => {
      newOpenMenus[menu] = true;
    });
    setOpenMenus(newOpenMenus);
    
  }, [searchTerm]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };


          {openMenus.dashboard && (
            <ul className="nav flex-column mt-2">
              <li className="nav-item">
                <Link to="/dashboard/activitydash" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-bar-chart me-2"></i> Activity-Dash
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link to="/dashboard/rechargehistory" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
                  <i className="bi bi-credit-card me-2"></i> Recharge History
                </Link>
              </li> */}
            </ul>
          )}
        </li>
        
        {[
          { path: "/clients/live-calls", icon: "bi-broadcast", label: "Live Calls" },
          
          // { path: "/Sda", icon: "bi-telephone", label: "My SDA Numbers" },
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
  onClick={() => toggleMenu("DIDs")}
  style={{ cursor: "pointer", transition: "0.3s" }}
>
  <span><i className="bi bi-telephone-inbound me-2"></i> DIDs</span>
  <i className={`bi ${openMenus.DIDs ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
</div>

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };


  const isActive = (path) => {
    return location.pathname === path;
  };


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
{/* <li className="nav-item">
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
      */}
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
  const renderMenuItems = (items) => (
    <div className={`sidebar-submenu ${collapsed ? 'collapsed' : ''}`}>
      {items.map((item, index) => (
        <Link 
          to={item.path} 
          className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
          key={index}
        >
          <i className={`${item.icon} menu-icon`}></i>
          <span className="menu-text">{item.label}</span>
          {isActive(item.path) && <span className="active-indicator"></span>}
        </Link>
      ))}
    </div>
  );

  const renderMenu = (menu) => {
    const items = filteredItems[menu] || [];
    if (items.length === 0) return null;
    
    const { icon, label } = menuCategories[menu];
    
    return (
      <div className="sidebar-menu" key={menu}>
        <button
          className={`sidebar-menu-header ${openMenus[menu] ? 'open' : ''}`}
          onClick={() => toggleMenu(menu)}
        >
          <div className="menu-header-content">
            <i className={`${icon} menu-icon`}></i>
            <span className="menu-text">{label}</span>
          </div>
          <i className={`bi ${openMenus[menu] ? "bi-chevron-down" : "bi-chevron-right"} menu-arrow`}></i>
        </button>

        <div className={`sidebar-submenu-container ${openMenus[menu] ? 'open' : ''}`}>
          {openMenus[menu] && renderMenuItems(items)}
        </div>
      </div>
    );
  };

  return (
    <div className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
    
        <button className="collapse-btn" onClick={toggleSidebar}>
          <i className={`bi ${collapsed ? 'bi-arrow-right-circle' : 'bi-arrow-left-circle'}`}></i>
        </button>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-content">
        <Link to="/dashboard/activitydash" className={`sidebar-item standalone ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="bi bi-grid-3x3-gap-fill menu-icon"></i>
          <span className="menu-text">Dashboard</span>
          {isActive('/dashboard') && <span className="active-indicator"></span>}
        </Link>
      </li>
      {/* <li className="nav-item">
        <Link to="/Rates/UserCustomRates" className="nav-link text-dark py-3 px-3 bg-light rounded hover-effect">
          <i className="bi bi-person-gear me-2"></i> User Custom Rates
        </Link>
      </li> */}
      {/* <li className="nav-item">
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
      </li> */}
    </ul>
  )}
</li>


       
        


        {Object.keys(menuCategories).map(menu => renderMenu(menu))}

        <div className="sidebar-divider"></div>

  {openMenus.reports && (
    <ul className="nav flex-column mt-2">
      {[
        { path: "/reports/CDR", icon: "bi-file-earmark-text", label: "CDR" },
        { path: "/reports/CDRFailed", icon: "bi-x-circle", label: "CDR Failed" },
        { path: "/reports/summary-day", icon: "bi-calendar-day", label: "Summary Per Day" },
        { path: "/reports/summary-month", icon: "bi-calendar-month", label: "Summary Per Month" },
        // { path: "/reports/destination", icon: "bi-geo-alt", label: "Reports / Destination" },
        // { path: "/reports/inbound", icon: "bi-arrow-down-circle", label: "Inbound Reports" },
        { path: "/reports/SummarymonthUser", icon: "bi-calendar-month", label: "Summary Month User" },
        { path: "/reports/summaryperuser", icon: "bi-person-lines-fill", label: "Summary Per User" },
        // { path: "/reports/summarypertrunk", icon: "bi-diagram-3", label: "Summary Per Trunk" },
        // { path: "/reports/SummaryMonthTrunk", icon: "bi-calendar3", label: "Summary Month Trunk" },
        // { path: "/reports/SummaryDayTrunk", icon: "bi-calendar3-week", label: "Summary Day Trunk" },
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
        // { path: "/Routes/TrunkErrors", icon: "bi-exclamation-triangle", label: "Trunk Errors" }
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
        <Link to="/clients/live-calls" className={`sidebar-item standalone ${isActive('/clients/live-calls') ? 'active' : ''}`}>
          <i className="bi bi-broadcast menu-icon"></i>
          <span className="menu-text">Live Calls</span>
          {isActive('/clients/live-calls') && <span className="active-indicator"></span>}
        </Link>
        
        <Link to="/Sda" className={`sidebar-item standalone ${isActive('/Sda') ? 'active' : ''}`}>
          <i className="bi bi-telephone menu-icon"></i>
          <span className="menu-text">My SDA Numbers</span>
          {isActive('/Sda') && <span className="active-indicator"></span>}
        </Link>
        
        <Link to="/profile" className={`sidebar-item standalone ${isActive('/profile') ? 'active' : ''}`}>
          <i className="bi bi-person-circle menu-icon"></i>
          <span className="menu-text">My Profile</span>
          {isActive('/profile') && <span className="active-indicator"></span>}
        </Link>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <i className="bi bi-person"></i>
          </div>
          <div className="user-details">
            <span className="user-name">Admin User</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
