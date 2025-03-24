// src/components/SummaryPerUser.js

import React, { useEffect, useState } from 'react';
import { Table, Spinner, Container, Button, Form, Pagination } from 'react-bootstrap';

const SummaryPerUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    const rows = filteredData.map((userSummary) => [
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

  // Filter data based on search term
  const filteredData = data.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      
      {/* Search Bar */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
      </Form.Group>
      
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
          {paginatedData.length > 0 ? (
            paginatedData.map((userSummary) => (
              <tr key={userSummary.id}>
                <td>{userSummary.username}</td>
                <td>{formatSessionTime(userSummary.sessiontime)}</td>
                <td>{userSummary.aloc_all_calls}</td>
                <td>{userSummary.nbcall}</td>
                <td>{userSummary.nbcall_fail}</td>
                <td>{roundToTwoDecimal(userSummary.buycost)}€</td>
                <td>{roundToTwoDecimal(userSummary.sessionbill)}€</td>
                <td>{roundToTwoDecimal(userSummary.lucro)}</td>
                <td>{roundToTwoDecimal(userSummary.asr)}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">No matching users found</td>
            </tr>
          )}
        </tbody>
      </Table>
      
      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <div className="d-flex justify-content-center">
          <Pagination>
            <Pagination.First 
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1} 
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1} 
            />
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages} 
            />
            <Pagination.Last 
              onClick={() => handlePageChange(totalPages)} 
              disabled={currentPage === totalPages} 
            />
          </Pagination>
        </div>
      )}
      
      {/* Display current page info */}
      <div className="text-center mt-2">
        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} users
      </div>
    </Container>
  );
};

export default SummaryPerUser;