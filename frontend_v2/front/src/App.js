// App.js

import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import QueueDash from './Pages/titleside/QueueDash';
import Pricing from './Pages/titleside/pricing';
import Sda from './Pages/titleside/Sda';
import Clients from './Pages/clients/clients';
import Reports from './Pages/Reports/Reports';
import CallerID from './Pages/clients/CallerID';
import LiveCalls from './Pages/titleside/LiveCalls';
import SipUser from './Pages/clients/SipUser';
import SummaryPerDay from './Pages/Reports/SummaryPerDay';
import SummaryPerMonth from './Pages/Reports/SummaryPerMonth';
import ReportsDestination from './Pages/Reports/ReportsDestination';
import InboundReports from './Pages/Reports/InboundReports';
import ActivityDash from './Pages/Dashboard/ActivityDash';
import RechargeHistory from './Pages/Dashboard/RechargeHistory';
import Profile from './components/UserProfile/profile';
import RestricNumber from './Pages/clients/RestricNumber'; // Import the renamed component

function App() {
  const user = {
    username: 'Eya',
    email: 'eya@example.com'
  };

  // 🔹 State for storing backend data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 useEffect to fetch data from the backend on component mount
  useEffect(() => {
    axios.get('http://localhost:3000/api/data')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data', error);
        setError('Error fetching data');
        setLoading(false);
      });
  }, []);

  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        {/* Navbar at the top */}
        <Navbar username={user.username} email={user.email} />

        <div className="d-flex flex-grow-1">
          {/* Sidebar on the left */}
          <Sidebar />

          {/* Main content */}
          <div className="p-4 flex-grow-1">
            <Routes>
              <Route path="/" element={
                <div>
                  <h2>Dashboard</h2>
                  <h3>Data from Backend:</h3>
                  {loading ? <p>Loading data...</p> : 
                    error ? <p>{error}</p> :
                    <ul>
                      {data.map(item => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                    </ul>
                  }
                </div>
              } />
              <Route path="/queue" element={<QueueDash />} />
              <Route path="/profile" element={<Profile username={user.username} email={user.email} />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/Sda" element={<Sda />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/caller-id" element={<CallerID />} />
              <Route path="/clients/live-calls" element={<LiveCalls />} />
              <Route path="/clients/RestricNumber" element={<RestricNumber />} /> {/* Use the renamed route */}
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
