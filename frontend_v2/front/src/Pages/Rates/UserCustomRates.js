import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Table, Form, Modal, Alert, Card, Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import ReactPaginate from 'react-paginate';
import { FaCheckCircle, FaTimesCircle, FaEdit, FaSearch, FaDownload, FaPlusCircle, FaTrashAlt, FaFileAlt } from 'react-icons/fa';

// Constants
const ITEMS_PER_PAGE = 10;

const DEFAULT_RATE_DATA = {
  id_user: '',
  id_prefix: '',
  destination: '',
  rateinitial: '',
  initblock: '',
  billingblock: ''
};

// Header Component
function UserRatesHeader({ onAddClick, rates, isExporting = false }) {
  const csvData = [
    ['Username', 'Prefix', 'Destination', 'Initial Rate', 'Init Block', 'Billing Block'],
    ...rates.map(rate => [
      rate.username,
      rate.prefix,
      rate.destination,
      rate.rateinitial,
      rate.initblock,
      rate.billingblock
    ])
  ];

  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaFileAlt className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">User Custom Rates</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Manage custom rates for users</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{rates.length}</span>
            </span>
          </Badge>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={onAddClick}
            className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          >
            <div className="icon-container">
              <FaPlusCircle />
            </div>
            <span>Add Rate</span>
          </Button>
          <CSVLink
            data={csvData}
            filename="user_rates_export.csv"
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          >
            <div className="icon-container">
              <FaDownload />
            </div>
            <span>Export CSV</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  );
}

// Search Bar Component
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        placeholder="Search by Username, Prefix or Destination"
        value={searchTerm}
        onChange={onSearchChange}
        className="ps-4"
      />
      <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
    </div>
  );
}

// Action Buttons Component
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2">
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={onEdit}
        className="action-btn"
      >
        <FaEdit className="btn-icon" />
      </Button>
      <Button 
        variant="outline-danger" 
        size="sm" 
        onClick={onDelete}
        className="action-btn"
      >
        <FaTrashAlt className="btn-icon" />
      </Button>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <tr>
      <td colSpan="7" className="text-center py-5">
        <div className="d-flex flex-column align-items-center">
          <FaFileAlt className="text-muted mb-2" size={32} />
          <h5 className="text-muted">No rates found</h5>
          <p className="text-muted small">Add your first custom rate to get started</p>
        </div>
      </td>
    </tr>
  );
}

// Rates Table Component
function RatesTableComponent({ rates, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Table striped bordered hover className="mb-0">
      <thead className="table-primary">
        <tr>
          <th>Username</th>
          <th>Prefix</th>
          <th>Destination</th>
          <th>Initial Rate</th>
          <th>Init Block</th>
          <th>Billing Block</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rates.length > 0 ? (
          rates.map((rate) => (
            <tr key={rate.id} className="plan-row">
              <td>{rate.username}</td>
              <td>{rate.prefix}</td>
              <td>{rate.destination}</td>
              <td>{rate.rateinitial}</td>
              <td>{rate.initblock}</td>
              <td>{rate.billingblock}</td>
              <td>
                <ActionButtons 
                  onEdit={() => onEdit(rate)}
                  onDelete={() => onDelete(rate.id)}
                />
              </td>
            </tr>
          ))
        ) : (
          <EmptyState />
        )}
      </tbody>
    </Table>
  );
}

// Pagination Component
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      previousLabel={'Previous'}
      nextLabel={'Next'}
      breakLabel={'...'}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      containerClassName={'pagination justify-content-center mb-0'}
      pageClassName={'page-item'}
      pageLinkClassName={'page-link'}
      previousClassName={'page-item'}
      previousLinkClassName={'page-link'}
      nextClassName={'page-item'}
      nextLinkClassName={'page-link'}
      breakClassName={'page-item'}
      breakLinkClassName={'page-link'}
      activeClassName={'active'}
      forcePage={currentPage}
    />
  );
}

// Rate Modal Component
function RateModal({
  show,
  onHide,
  title,
  onSubmit,
  modalData,
  onInputChange,
  isSubmitting,
  usernames,
  prefixes
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Select 
              name="id_user" 
              value={modalData.id_user || ''}
              onChange={onInputChange}
              required
            >
              <option value="">Select a user</option>
              {usernames.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Prefix</Form.Label>
            <Form.Select 
              name="id_prefix" 
              value={modalData.id_prefix || ''}
              onChange={onInputChange}
              required
            >
              <option value="">Select a prefix</option>
              {prefixes.map(prefix => (
                <option key={prefix.id} value={prefix.id}>
                  {prefix.prefix} - {prefix.destination}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="destination">
                <Form.Label>Destination</Form.Label>
                <Form.Control
                  type="text"
                  name="destination"
                  value={modalData.destination}
                  onChange={onInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="rateinitial">
                <Form.Label>Initial Rate</Form.Label>
                <Form.Control
                  type="text"
                  name="rateinitial"
                  value={modalData.rateinitial}
                  onChange={onInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="initblock">
                <Form.Label>Init Block</Form.Label>
                <Form.Control
                  type="text"
                  name="initblock"
                  value={modalData.initblock}
                  onChange={onInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="billingblock">
                <Form.Label>Billing Block</Form.Label>
                <Form.Control
                  type="text"
                  name="billingblock"
                  value={modalData.billingblock}
                  onChange={onInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// Main Component
function UserCustomRates() {
  const [userRates, setUserRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(DEFAULT_RATE_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [prefixes, setPrefixes] = useState([]);

  const fetchUserRates = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/Userrate/afficher')
      .then((response) => {
        setUserRates(response.data.userRates);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user rates:', error);
        setError('Failed to fetch user rates');
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/Userrate/supprimer/${id}`);
        fetchUserRates();
        setSuccessMessage('Rate deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error deleting rate:', error);
        setError('Failed to delete rate');
      }
    }
  };

  const handleAdd = () => {
    setModalData(DEFAULT_RATE_DATA);
    setShowModal(true);
  };

  const handleEdit = (rate) => {
    setModalData(rate);
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (modalData.id) {
        // Update existing rate
        await axios.put(`http://localhost:5000/api/admin/Userrate/modifier/${modalData.id}`, modalData);
        setSuccessMessage('Rate updated successfully');
      } else {
        // Create new rate
        await axios.post('http://localhost:5000/api/admin/Userrate/ajouter', modalData);
        setSuccessMessage('Rate created successfully');
      }
      
      fetchUserRates();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving rate:', error);
      setError('Failed to save rate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const fetchUsernames = async () => {
    try {
      const response = await axios.get('/rates/usernames');
      setUsernames(response.data.usernames);
    } catch (err) {
      console.error('Error fetching usernames:', err);
    }
  };

  const fetchPrefixes = async () => {
    try {
      const response = await axios.get('/rates/prefixes');
      setPrefixes(response.data.prefixes);
    } catch (err) {
      console.error('Error fetching prefixes:', err);
    }
  };

  useEffect(() => {
    fetchUserRates();
    fetchUsernames();
    fetchPrefixes();
  }, []);

  // Filter rates based on search term
  const filteredRates = userRates.filter(rate =>
    rate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.prefix.toString().includes(searchTerm) ||
    rate.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const pageCount = Math.ceil(filteredRates.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const pagedRates = filteredRates.slice(offset, offset + ITEMS_PER_PAGE);

  const customStyles = `
    .pulse-effect {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
    }
    .btn-hover-effect .icon-container {
      transition: all 0.3s ease;
    }
    .btn-hover-effect:hover .icon-container {
      transform: translateY(-2px);
    }
    .action-btn .btn-icon {
      transition: transform 0.2s ease;
    }
    .action-btn:hover .btn-icon {
      transform: scale(1.2);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .plan-row {
      transition: all 0.2s ease;
    }
    .plan-row:hover {
      background-color: rgba(13, 110, 253, 0.05);
    }
    .main-card {
      border-radius: 0.5rem;
      overflow: hidden;
    }
  `;

  return (
    <div>
      <style>{customStyles}</style>

      <div className="dashboard-main">
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow border-0 overflow-hidden main-card">
                <UserRatesHeader 
                  onAddClick={handleAdd} 
                  rates={userRates} 
                />
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaCheckCircle className="me-2" />
                      {successMessage}
                    </Alert>
                  )}

                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <SearchBar 
                        searchTerm={searchTerm} 
                        onSearchChange={(e) => setSearchTerm(e.target.value)} 
                      />
                    </Col>
                  </Row>

                  <RatesTableComponent
                    rates={pagedRates}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={loading}
                  />

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!loading && (
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{pagedRates.length}</span> of {filteredRates.length} rates
                        </Badge>
                      )}
                    </div>
                    <PaginationSection
                      pageCount={pageCount}
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <RateModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalData.id ? "Edit Rate" : "Add New Rate"}
        onSubmit={handleModalSubmit}
        modalData={modalData}
        onInputChange={handleInputChange}
        isSubmitting={isSubmitting}
        usernames={usernames}
        prefixes={prefixes}
      />
    </div>
  );
}

export default UserCustomRates;
