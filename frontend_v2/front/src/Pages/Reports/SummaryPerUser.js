// src/components/SummaryPerUser.js

import React, { useEffect, useState } from 'react';
import { Table, Spinner, Container, Button } from 'react-bootstrap';

const SummaryPerUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API on component mount
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/SummaryPerUser')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching data');
        }
        return response.json();
      })
      .then((data) => {
        setData(data.data);  // Save the data into state
        setLoading(false);    // Set loading to false once data is fetched
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const formatSessionTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
  
    // Format the time as hh:mm:ss
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Function to round numbers to 2 decimal places
  const roundToTwoDecimal = (num) => {
    return num ? num.toFixed(2) : '0.00';  // Avoid rounding if the value is null or undefined
  };

  // Function to export data to CSV
  const exportToCSV = () => {
    const header = ['Username', 'Duration', 'Allocated Calls', 'Answered', 'Failed', 'Buy Price', 'Sell Price', 'Markup', 'ASR'];
    const rows = data.map((userSummary) => [
      userSummary.username,
      formatSessionTime(userSummary.sessiontime),
      userSummary.aloc_all_calls,
      userSummary.nbcall,
      userSummary.nbcall_fail,
      roundToTwoDecimal(userSummary.buycost),   // Round Buy Price
      roundToTwoDecimal(userSummary.sessionbill),  // Round Sell Price
      roundToTwoDecimal(userSummary.lucro),    // Round Markup
      roundToTwoDecimal(userSummary.asr),      // Round ASR
    ]);
    
    // Create CSV content
    const csvContent = [header, ...rows].map(row => row.join(',')).join('\n');
    
    // Create a downloadable link
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    link.download = 'user_summary.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">User Summary</h2>
      {/* Export Button */}
      <Button variant="success" onClick={exportToCSV} className="mb-3">
        Export to CSV
      </Button>
      <Table striped bordered hover responsive variant="light">
        <thead>
          <tr>
            <th>Username</th>
            <th>Duration</th>
            <th>Allocated Calls</th>
            <th>Answered</th>
            <th>Failed</th>
            <th>Buy Price €</th>
            <th>Sell Price €</th>
            <th>Markup</th>
            <th>ASR %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((userSummary) => (
            <tr key={userSummary.id}>
              <td>{userSummary.username}</td>
              <td>{formatSessionTime(userSummary.sessiontime)}s</td>
              <td>{userSummary.aloc_all_calls}</td>
              <td>{userSummary.nbcall}</td>  {/* Answered calls */}
              <td>{userSummary.nbcall_fail}</td>  {/* Failed calls */}
              <td>{roundToTwoDecimal(userSummary.buycost)}€</td>  {/* Rounded Buy Price */}
              <td>{roundToTwoDecimal(userSummary.sessionbill)}€</td>  {/* Rounded Sell Price */}
              <td>{roundToTwoDecimal(userSummary.lucro)}</td>  {/* Rounded Markup */}
              <td>{roundToTwoDecimal(userSummary.asr)}%</td>  {/* Rounded ASR */}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default SummaryPerUser;
