import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar"; // Ajout du Navbar
import QueueDash from "./Pages/titleside/QueueDash";
import Pricing from "./Pages/titleside/pricing";
import Sda from "./Pages/titleside/Sda";
import Clients from "./Pages/Clients/Client";
import Reports from "./Pages/Reports/Reports";
import CallerID from "./Pages/Clients/CallerID";
import LiveCalls from "./Pages/Clients/LiveCalls";
import SipUser from "./Pages/Clients/SipUser";
import SummaryPerDay from "./Pages/Reports/SummaryPerDay";
import SummaryPerMonth from "./Pages/Reports/SummaryPerMonth";
import ReportsDestination from "./Pages/Reports/ReportsDestination";
import InboundReports from "./Pages/Reports/InboundReports";
import ActivityDash from "./Pages/Dashboard/Activity-Dash"; 
import RechargeHistory from "./Pages/Dashboard/RechargeHistory";
import Profile from "./components/UserProfile/PersonalInformation";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const user = {
    username: "Eya",
    email: "eya@example.com"
  };

  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        {/* Navbar en haut */}
        <Navbar username={user.username} email={user.email} />

        <div className="d-flex flex-grow-1">
          {/* Sidebar à gauche */}
          <Sidebar />

          {/* Contenu principal */}
          <div className="p-4 flex-grow-1">
            <Routes>
              <Route path="/" element={<h2>Dashboard</h2>} />
              <Route path="/queue" element={<QueueDash />} />
              <Route path="/profile" element={<Profile username={user.username} email={user.email} />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/Sda" element={<Sda />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/caller-id" element={<CallerID />} />
              <Route path="/clients/live-calls" element={<LiveCalls />} />
              <Route path="/clients/sip-user" element={<SipUser />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/summary-day" element={<SummaryPerDay />} />
              <Route path="/reports/summary-month" element={<SummaryPerMonth />} />
              <Route path="/reports/destination" element={<ReportsDestination />} />
              <Route path="/reports/inbound" element={<InboundReports />} />
              <Route path="/dashboard/activitydash" element={<ActivityDash />} />
              <Route path="/dashboard/rechargehistory" element={<RechargeHistory />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;