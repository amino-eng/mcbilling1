const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Import routes
const routeClient = require('./route/client');
const routeCDR = require('./route/rapport/CDRroute');
const routeSummaryPerDay = require('./route/rapport/SummaryPerDay');
const routeSummaryPerMonth = require('./route/rapport/SummaryPerMonth');
const routeCDRFailed = require('./route/rapport/CDRFailed');
const routeUsers = require('./route/client/users');
const routeUserHistory = require('./route/client/UserHistory');
const routeCallerId = require('./route/client/CallerId');
const routeSIPUsers = require('./route/client/SIPUsers');
const routeIax = require('./route/client/Iax');
const routeSummaryPerUser = require('./route/rapport/SummaryPerUser');
const routeSummaryDayUser = require('./route/rapport/SummaryDayUser');
const routeSummaryMonthUser = require('./route/rapport/SummaryMonthUser');
const routeCallArchive = require('./route/rapport/CallArchive');
const routePayMeth = require('./route/billing/PayMeth');
const routeRefills = require('./route/Billing/Refills');
const routeDIDs = require('./route/DIDs/DIDs');
const routeDIDDestination = require('./route/DIDs/DIDDestination');
const routeDIDUse = require('./route/DIDs/DIDUse');
const routeIVRs = require('./route/DIDs/IVRs');
const routeQueuesMembers = require('./route/DIDs/QueuesMembers');
const routeQueues = require('./route/DIDs/Queues');
const routeTrunks = require('./route/routes/trunks');
const routeVoucher = require('./route/billing/voucher');
const routeRefillProviders = require('./route/Billing/RefillProviders');

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/admin/agent', routeClient);
app.use('/api/admin/CDR', routeCDR);
app.use('/api/admin/SummaryPerDay', routeSummaryPerDay);
app.use('/api/admin/SummaryPerMonth', routeSummaryPerMonth);
app.use('/api/admin/CdrFailed', routeCDRFailed);
app.use('/api/admin/users', routeUsers);
app.use('/api/admin/UserHistory', routeUserHistory);
app.use('/api/admin/CallerId', routeCallerId);
app.use('/api/admin/SIPUsers', routeSIPUsers);
app.use('/api/admin/SummaryPerUser', routeSummaryPerUser);
app.use('/api/admin/CallArchive', routeCallArchive);
app.use('/api/admin/SummaryMonthUser', routeSummaryMonthUser);
app.use('/api/admin/PayMeth', routePayMeth);
app.use('/api/admin/SummaryDayUser', routeSummaryDayUser);
app.use('/api/admin/Refills', routeRefills);
app.use('/api/admin/DIDs', routeDIDs);
app.use('/api/admin/DIDDestination', routeDIDDestination);
app.use('/api/admin/DIDUse', routeDIDUse);
app.use('/api/admin/IVRs', routeIVRs);
app.use('/api/admin/QueuesMembers', routeQueuesMembers);
app.use('/api/admin/Queues', routeQueues);
app.use('/api/admin/Iax', routeIax);
app.use('/api/admin/Trunks', routeTrunks);
app.use('/api/admin/voucher', routeVoucher); // Add the voucher route
app.use('/api/admin/refillProviders', routeRefillProviders);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});