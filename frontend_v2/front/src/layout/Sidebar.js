import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Menu data structure
const menuItems = {
  DIDs: [
    { path: "/DIDs", icon: "bi-telephone", label: "DIDs" },
    { path: "/DIDs/DIDDestination", icon: "bi-signpost", label: "DID Destination" },
    { path: "/DIDs/DIDsUse", icon: "bi-person", label: "DIDs Use" },
    { path: "/DIDs/IVRs", icon: "bi-sliders", label: "IVRs" },
    { path: "/DIDs/Queues", icon: "bi-speedometer2", label: "Queues" },
    { path: "/DIDs/QueuesMembres", icon: "bi-people", label: "Queues Membres" },
    // { path: "/DIDs/QueuesDashboard", icon: "bi-speedometer2", label: "Queues Dashboard" },
    // { path: "/DIDs/DIDHistory", icon: "bi-clock-history", label: "DID History" }
  ],
  clients: [
    { path: "/clients/caller-id", icon: "bi-phone", label: "Caller ID" },
    { path: "/clients/Users", icon: "bi-people", label: "Users" },
    { path: "/clients/Iax", icon: "bi-building", label: "Iax" },
    { path: "/clients/SipUser", icon: "bi-telephone-forward", label: "SIP Users" },
    { path: "/clients/RestrictNumber", icon: "bi-ban", label: "RestricNumber" }
  ],
  Billing: [
    { path: "/Billing/Refills", icon: "bi-cash-stack", label: "Refills" },
    { path: "/Billing/PaymentMethods", icon: "bi-credit-card", label: "Payment Methods" },
    { path: "/Billing/Voucher", icon: "bi-ticket-perforated", label: "Voucher" },
    { path: "/Billing/RefillProviders", icon: "bi-shop", label: "Refill Providers" }
  ],
  Rates: [
    { path: "/Rates/Plans", icon: "bi-list-ul", label: "Plans" },
    { path: "/Rates/Tariffs", icon: "bi-currency-exchange", label: "Tariffs" },
    { path: "/Rates/Prefixes", icon: "bi-123", label: "Prefixes" },
    { path: "/Rates/UserCustomRates", icon: "bi-person-gear", label: "User Custom Rates" },
  ],
  reports: [
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
    // { path: "/reports/CallArchive", icon: "bi-archive", label: "Call Archive" },
    { path: "/reports/SummaryDayUser", icon: "bi-calendar3-week", label: "Summary Day User" }
  ],
  Routes: [
    { path: "/Routes/Providers", icon: "bi-building", label: "Providers" },
    { path: "/Routes/Trunks", icon: "bi-diagram-3", label: "Trunks" },
    { path: "/Routes/TrunkGroups", icon: "bi-diagram-3-fill", label: "Trunk Groups" },
    { path: "/Routes/ProviderRates", icon: "bi-cash-stack", label: "Provider Rates" },
    { path: "/Routes/Servers", icon: "bi-hdd-network", label: "Servers" },
    // { path: "/Routes/TrunkErrors", icon: "bi-exclamation-triangle", label: "Trunk Errors" }
  ]
};

// Menu category icons and labels
const menuCategories = {
  dashboard: { icon: "bi-speedometer2", label: "Dashboard", path: "/" },
  DIDs: { icon: "bi-telephone-inbound", label: "DIDs" },
  clients: { icon: "bi-people-fill", label: "Clients" },
  Billing: { icon: "bi-wallet2", label: "Billing" },
  Rates: { icon: "bi-cash-coin", label: "Rates" },
  reports: { icon: "bi-graph-up-arrow", label: "Reports" },
  Routes: { icon: "bi-signpost-split", label: "Routes" }
};

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);

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

  // Toggle menu open/close
  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Render a menu category
  const renderMenuCategory = (category) => {
    const { icon, label, path } = menuCategories[category];
    const isOpen = openMenus[category];
    const isDashboard = category === 'dashboard';
    
    // For Dashboard, create a direct link instead of a dropdown
    if (isDashboard) {
      if (collapsed) {
        // Collapsed view - only show icon
        return (
          <div className="mb-2 px-2" key={category}>
            <Link
              to={path}
              className="btn d-flex justify-content-center align-items-center mb-1"
              style={{
                background: isActive(path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: isActive(path) ? '#3b82f6' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                width: '45px',
                height: '45px',
                transition: 'all 0.2s ease'
              }}
              title={label}
            >
              <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: isActive(path) ? '#3b82f6' : '#64748b' }}></i>
            </Link>
          </div>
        );
      }
      
      // Expanded view - show full menu item as a link
      return (
        <div className="mb-2" key={category}>
          <Link
            to={path}
            className="btn w-100 text-start d-flex justify-content-between align-items-center mb-1"
            style={{
              background: isActive(path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: isActive(path) ? '#3b82f6' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 15px',
              transition: 'all 0.2s ease',
              fontWeight: isActive(path) ? '600' : '500'
            }}
          >
            <span>
              <i className={`bi ${icon} me-2`} style={{ color: isActive(path) ? '#3b82f6' : '#64748b' }}></i>
              {label}
            </span>
          </Link>
        </div>
      );
    }
    
    // For other categories - collapsed view
    if (collapsed) {
      return (
        <div className="mb-2 px-2" key={category}>
          <button 
            className="btn d-flex justify-content-center align-items-center mb-1"
            onClick={() => toggleMenu(category)}
            style={{
              background: isOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: isOpen ? '#3b82f6' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              width: '45px',
              height: '45px',
              transition: 'all 0.2s ease'
            }}
            title={label}
          >
            <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: isOpen ? '#3b82f6' : '#64748b' }}></i>
          </button>
        </div>
      );
    }
    
    // For other categories - expanded view with submenu
    return (
      <div className="mb-2" key={category}>
        <button 
          className="btn w-100 text-start d-flex justify-content-between align-items-center mb-1"
          onClick={() => toggleMenu(category)}
          style={{
            background: isOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: isOpen ? '#3b82f6' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 15px',
            transition: 'all 0.2s ease',
            fontWeight: isOpen ? '600' : '500'
          }}
        >
          <span>
            <i className={`bi ${icon} me-2`} style={{ color: isOpen ? '#3b82f6' : '#64748b' }}></i>
            {label}
          </span>
          <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
        </button>
        
        {isOpen && !collapsed && menuItems[category] && (
          <div className="ms-3 mt-2">
            {menuItems[category].map((item, index) => (
              <Link 
                key={index} 
                to={item.path} 
                className="d-flex align-items-center text-decoration-none py-2 px-3 mb-1"
                style={{
                  color: isActive(item.path) ? '#3b82f6' : '#64748b',
                  background: isActive(item.path) ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive(item.path) ? '500' : 'normal'
                }}
              >
                <i className={`bi ${item.icon} me-2`} style={{ fontSize: '1rem', color: isActive(item.path) ? '#3b82f6' : '#64748b' }}></i>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="d-flex flex-column" style={{ 
      width: collapsed ? '70px' : '280px', 
      height: '100vh', 
      overflow: 'hidden', 
      background: '#ffffff', 
      color: '#333', 
      boxShadow: '0 0 15px rgba(0,0,0,0.05)',
      transition: 'width 0.3s ease'
    }}>
      {/* Sidebar Header */}
      <div className="d-flex align-items-center justify-content-between p-3" style={{ background: '#3b82f6' }}>
        {/* <div className="d-flex align-items-center">
          <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.2)' }}>
            <i className="bi bi-headset fs-4 text-white"></i>
          </div>
        </div> */}
        <button 
          className="btn btn-sm text-white" 
          type="button" 
          onClick={toggleSidebar}
          style={{ background: 'transparent', border: 'none' }}
        >
          <i className={`bi ${collapsed ? 'bi-arrow-right-circle' : 'bi-arrow-left-circle'} fs-4`}></i>
        </button>
      </div>

      {/* Sidebar Content - Scrollable Area */}
      <div className="overflow-auto flex-grow-1" style={{ height: '0' }}>
        <div className={collapsed ? 'py-2' : 'p-2'}>
          {/* Render all menu categories with subtle dividers between them */}
          {Object.keys(menuCategories).map((category, index) => (
            <React.Fragment key={category}>
              {index > 0 && <div className={collapsed ? 'my-2' : 'my-3'} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}></div>}
              {renderMenuCategory(category)}
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
