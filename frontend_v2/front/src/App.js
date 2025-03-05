// App.js

import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import QueueDash from './Pages/DIDs/QueueDash';
import DIDs from './Pages/DIDs/DIDs';
import IVRs from './Pages/DIDs/IVRs';
import DIDDestination from './Pages/DIDs/DIDDestination';
import DIDsUse from './Pages/DIDs/DIDsUse';
import QueuesMembres from './Pages/DIDs/QueuesMembres';
import QueuesDashboard from './Pages/DIDs/QueuesDashboard';
import Holidays from './Pages/DIDs/Holidays';
import Sda from './Pages/titleside/Sda';
import Clients from './Pages/clients/clients';
import Reports from './Pages/Reports/Reports';
import CallerID from './Pages/clients/CallerID';
import ATALinksys from './Pages/clients/ATALinksys';
import Users from './Pages/clients/Users';
import UserHistory from './Pages/clients/UserHistory';
import LiveCalls from './Pages/titleside/LiveCalls';
import SipUser from './Pages/clients/SipUser';
import Lax from './Pages/clients/Lax';
import SummaryPerDay from './Pages/Reports/SummaryPerDay';
import CDR from './Pages/Reports/CDR';
import CDRFailed from './Pages/Reports/CDRFailed';
import SummaryPerMonth from './Pages/Reports/SummaryPerMonth';
import SummaryPerTrunk from './Pages/Reports/SummaryMonthTrunk';
import SummaryMonthTrunk from './Pages/Reports/SummaryPerTrunk';
import SummaryDayTrunk from './Pages/Reports/SummaryDayTrunk';
import ReportsDestination from './Pages/Reports/ReportsDestination';
import InboundReports from './Pages/Reports/InboundReports';
import SummaryPerUser from './Pages/Reports/SummaryPerUser';
import CallArchive from './Pages/Reports/callArchive';
import ActivityDash from './Pages/Dashboard/ActivityDash';
import RechargeHistory from './Pages/Dashboard/RechargeHistory';
import Profile from './components/UserProfile/profile';
import RestricNumber from './Pages/clients/RestricNumber'; // Import the renamed component
import DIDHistory from './Pages/DIDs/DIDHistory';
import Refills from './Pages/Billing/Refills';
import PaymentMethods from './Pages/Billing/PaymentMethods';
import Voucher from './Pages/Billing/Voucher';
import RefillProviders from './Pages/Billing/RefillRroviders';
import Plans from './Pages/Rates/Plans';
import Tariffs from './Pages/Rates/Tariffs';
import Prefixes from './Pages/Rates/Prefixes';
import UserCostomRates from './Pages/Rates/UserCustomRates';
import Offers from './Pages/Rates/offers';
import OfferCDR from './Pages/Rates/OffersCDR';
import Providers from './Pages/Routes/Providers';
import TrunkGroups from './Pages/Routes/TrunkGroups';
import ProviderRates from './Pages/Routes/ProviderRates';
import Servers from './Pages/Routes/Servers';
import Trunks from './Pages/Routes/Trunks';
import TrunkErrors from './Pages/Routes/TrunkErrors';



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
              
              <Route path="/profile" element={<Profile username={user.username} email={user.email} />} />
              
              <Route path="/Sda" element={<Sda />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/caller-id" element={<CallerID />} />
              <Route path="/clients/live-calls" element={<LiveCalls />} />
              <Route path="/clients/ATALinksys" element={<ATALinksys />} />
              <Route path="/clients/Users" element={<Users />} />
              <Route path="/clients/RestricNumber" element={<RestricNumber />} /> {/* Use the renamed route */}
 
              <Route path="/clients/SipUser" element={<SipUser />} />

              <Route path="/clients/sipUser" element={<SipUser />} />

              <Route path="/clients/Lax" element={<Lax />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/summary-day" element={<SummaryPerDay />} />
              <Route path="/reports/summaryperuser" element={<SummaryPerUser />} />
              <Route path="/reports/summarypertrunk" element={<SummaryPerTrunk />} />
              <Route path="/reports/CDR" element={<CDR />} />
              <Route path="/reports/CDRFailed" element={<CDRFailed />} />
              <Route path="/reports/summaryMonthTrunk" element={<SummaryMonthTrunk />} />
              <Route path="/reports/SummaryDayTrunk" element={<SummaryDayTrunk />} />
              <Route path="/reports/summary-month" element={<SummaryPerMonth />} />
              <Route path="/reports/destination" element={<ReportsDestination />} />
              <Route path="/reports/inbound" element={<InboundReports />} />
              <Route path="/reports/CallArchive" element={<CallArchive />} />
              <Route path="/dashboard/activitydash" element={<ActivityDash />} />
              <Route path="/dashboard/rechargehistory" element={<RechargeHistory />} />
              <Route path="/DIDs/Queue" element={<QueueDash />} />
              <Route path="/DIDs/DIDs" element={<DIDs />} />
              <Route path="/DIDs/DIDDestination" element={<DIDDestination />} />
              <Route path="/DIDs/DIDsUse" element={<DIDsUse />} />
              <Route path="/DIDs/IVRs" element={<IVRs />} />
              <Route path="/DIDs/QueuesMembres" element={<QueuesMembres/>} />
              <Route path="/DIDs/QueuesDashboard" element={<QueuesDashboard/>} />
              <Route path="/DIDs/Holidays" element={<Holidays/>} />
              <Route path="/DIDs/DIDHistory" element={<DIDHistory/>} />
              <Route path="/Billing/Refills" element={<Refills/>} />
              <Route path="/Billing/PaymentMethods" element={<PaymentMethods/>} />
              <Route path="/Billing/Voucher" element={<Voucher/>} />
              <Route path="/Billing/RefillProviders" element={<RefillProviders/>} />
              <Route path="/Rates/Plans" element={<Plans/>} />
              <Route path="/Rates/Tariffs" element={<Tariffs/>} />
              <Route path="/Rates/Prefixes" element={<Prefixes/>} />
              <Route path="/Rates/UserCostomRates" element={<UserCostomRates/>} />
              <Route path="/Rates/Offers" element={<Offers/>} />
              <Route path="/Rates/OfferCDR" element={<OfferCDR/>} />
              <Route path="/Rates/OfferUse" element={<OfferCDR/>} />
              <Route path="/Routes/Providers" element={<Providers/>} />
              <Route path="/Routes/TrunkGroups" element={<TrunkGroups/>} />
              <Route path="/Routes/ProviderRates" element={<ProviderRates/>} />
              <Route path="/Routes/Servers" element={<Servers/>} />
              <Route path="/Routes/Trunks" element={<Trunks/>} />
              <Route path="/Routes/TrunkErrors" element={<TrunkErrors/>} />
              
              


              <Route path="/clients/UserHistory" element={<UserHistory/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
