import React from "react";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return React.createElement(React.Fragment, null, React.createElement(Outlet));
}
