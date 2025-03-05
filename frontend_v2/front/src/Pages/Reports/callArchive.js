import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Spinner, Modal, Form } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import Papa from 'papaparse';

const CallArchive = () => {
  const [cdrArchive, setCdrArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    sip_user: true,
    number: true,
    destination: true,
    duration: true,
    real_duration: true,
    username: true,
    trunkcode: true,
    status: true,
    buy_price: true,
    sell_price: true,
    unique_id: true,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCdrArchive();
  }, []);

  const fetchCdrArchive = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/CallArchive/affiche');
      setCdrArchive(response.data.cdr_archive);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching CDR Archive data:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/CallArchive/delete/${id}`);
      fetchCdrArchive();
    } catch (error) {
      console.error('Error deleting CDR Archive record:', error);
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(cdrArchive);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'call_archive.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  // Pagination logic
  const offset = currentPage * recordsPerPage;
  const currentRecords = cdrArchive.slice(offset, offset + recordsPerPage);
  const pageCount = Math.ceil(cdrArchive.length / recordsPerPage);

  return (
    <div>
      <h2>Call Archive</h2>
      <Button variant="success" onClick={exportToCSV} className="mb-3">
        Export CSV
      </Button>
      <Button variant="info" onClick={() => setShowModal(true)} className="mb-3">
         Column
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            {visibleColumns.date && <th>Date</th>}
            {visibleColumns.sip_user && <th>SIP User</th>}
            {visibleColumns.number && <th>Number</th>}
            {visibleColumns.destination && <th>Destination</th>}
            {visibleColumns.duration && <th>Duration</th>}
            {visibleColumns.real_duration && <th>Real Duration</th>}
            {visibleColumns.username && <th>Username</th>}
            {visibleColumns.trunkcode && <th>Trunk Code</th>}
            {visibleColumns.status && <th>Status</th>}
            {visibleColumns.buy_price && <th>Buy Price</th>}
            {visibleColumns.sell_price && <th>Sell Price</th>}
            {visibleColumns.unique_id && <th>Unique ID</th>}
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((record) => (
            <tr key={record.id}>
              {visibleColumns.date && <td>{formatDate(record.Call_date)}</td>}
              {visibleColumns.sip_user && <td>{record.sip_user}</td>}
              {visibleColumns.number && <td>{record.number}</td>}
              {visibleColumns.destination && <td>{record.destination || ""}</td>}
              {visibleColumns.duration && <td>{record.duration ? `${record.duration} sec` : ""}</td>}
              {visibleColumns.real_duration && <td>{record.real_duration ? `${record.real_duration} sec` : ""}</td>}
              {visibleColumns.username && <td>{record.username}</td>}
              {visibleColumns.trunkcode && <td>{record.trunkcode}</td>}
              {visibleColumns.status && <td>{getStatus(record.status)}</td>}
              {visibleColumns.buy_price && <td>{record.buy_price}</td>}
              {visibleColumns.sell_price && <td>{record.sell_price}</td>}
              {visibleColumns.unique_id && <td>{record.unique_id}</td>}
            </tr>
          ))}
        </tbody>
      </Table>

      <ReactPaginate
        previousLabel={'Previous'}
        nextLabel={'Next'}
        breakLabel={'...'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={(data) => setCurrentPage(data.selected)}
        containerClassName={'pagination'}
        activeClassName={'active'}
        pageClassName={'page-item'}
        pageLinkClassName={'page-link'}
        previousClassName={'page-item'}
        previousLinkClassName={'page-link'}
        nextClassName={'page-item'}
        nextLinkClassName={'page-link'}
        breakClassName={'page-item'}
        breakLinkClassName={'page-link'}
      />

      {/* Modal for column toggling */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {Object.keys(visibleColumns).map((column) => (
              <Form.Check
                key={column}
                type="checkbox"
                label={column.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())} // Format label
                checked={visibleColumns[column]}
                onChange={() => handleColumnToggle(column)}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // Customize the format as needed
};

// Helper function to map status codes to labels
const getStatus = (status) => {
  switch (status) {
    case 1: return "Answered";
    case 2: return "Busy";
    case 3: return "No Answer";
    case 4: return "Canceled";
    case 5: return "Congestion";
    case 6: return "Channel Unavailable";
    case 7: return "Do Not Call";
    case 8: return "Torture";
    case 9: return "Invalid Arguments";
    case 10: return "Machine";
    default: return "Unknown";
  }
};

export default CallArchive;