import React, { useEffect, useCallback, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";

import SidebarFooter from "./SidebarFooter";

const navItems = [
  {
     name: "Dashboard", subItems: [
      { name: "Activity-Dash", path: "/", pro: false },
      { name: "Recharge History", path: "/", pro: false }
    ]
  },
  { name: "QueueDash", path: "/calendar" },
  {  name: "My Profile", path: "/profile" },
  { name: "My SDA Numbers", path: "/form-elements" },
  { name: "Pricing",  path: "/basic-tables" },
  {
    name: "Clients",  subItems: [
      { name: "Caller ID", path: "/404", pro: false },
      { name: "Live Calls", path: "/404", pro: false },
      { name: "SIP Users", path: "/blank", pro: false }
    ]
  },
  {
     name: "Reports", subItems: [
      { name: "Summary Per Day", path: "/alerts", pro: false },
      { name: "Summary Per Month", path: "/avatars", pro: false },
      { name: "Reports / Destination", path: "/badges", pro: false },
      { name: "Inbound Reports", path: "/buttons", pro: false }
    ]
  }
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const subMenuRefs = useRef({});
  
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu(prev => (prev === index ? null : index));
  };

  return (
    <aside className={`fixed mt-16 flex flex-col top-0 px-5 left-0 bg-white h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} onMouseEnter={() => !isExpanded && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="py-8 flex justify-start">
        <Link to="/">
          <img src="/images/logo/logo.svg" alt="Logo" width={150} height={40} className="dark:hidden" />
          <img src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} className="hidden dark:block" />
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <h2 className="mb-4 text-xs uppercase text-gray-400">Menu</h2>
          <ul className="flex flex-col gap-4">
            {navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <button onClick={() => handleSubmenuToggle(index)} className="menu-item group cursor-pointer">
                    <span>{nav.icon}</span>
                    <span className="menu-item-text">{nav.name}</span>
                    <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu === index ? "rotate-180 text-brand-500" : ""}`} />
                  </button>
                ) : (
                  <Link to={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                    <span>{nav.icon}</span>
                    <span className="menu-item-text">{nav.name}</span>
                  </Link>
                )}
                {nav.subItems && (
                  <div className="overflow-hidden transition-all duration-300" style={{ height: openSubmenu === index ? "auto" : "0px" }}>
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.map(subItem => (
                        <li key={subItem.name}>
                          <Link to={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>{subItem.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarFooter /> : null}
      </div>
    </aside>
  );
};

export default Sidebar;