import React from "react";
// import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import Backdrop from "./Backdrop";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";

const LayoutContent = () => {
//   const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <Sidebar />
        <Backdrop />
      </div>
      <div
        className='flex-1 transition-all duration-300 ease-in-out'  >
        <Navbar />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (

      <LayoutContent />

  );
};

export default AppLayout;