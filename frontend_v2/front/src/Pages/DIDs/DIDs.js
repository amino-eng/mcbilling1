"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Table, Button, Modal, Form, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner } from "react-bootstrap"
import ReactPaginate from "react-paginate"
import { CSVLink } from "react-csv"
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaPhoneAlt,
  FaGlobe,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa"

// Constants
const ITEMS_PER_PAGE = 10

const DEFAULT_NEW_DID = {
  did: "",
  country: "",
  activated: "1",
  connection_charge: "",
  fixrate: "",
  id_user: 1,
  min_time_buy: "",
  buy_price_inblock: "",
  buy_price_increment: "",
  min_time_sell: "",
  initial_block: "",
  billing_block: "",
  charge_who: "DID owner",
  back: "Backup",
  server: "",
  description: ""
}

// Header with Export & Add
function DIDsHeader({ onAddClick, dids, isExporting }) {
  const csvData = [
    ["DID", "Country", "Status", "Setup Price €", "Monthly Price €", "Description"],
    ...dids.map((did) => [
      did.did,
      did.country,
      did.activated == 1 ? "Active" : "Inactive",
      did.connection_charge || "0",
      did.fixrate || "0",
      did.description || "",
    ]),
  ]

  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
          {Array(5)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className="floating-icon position-absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <FaPhoneAlt
                  className="text-white opacity-25"
                  style={{
                    fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                  }}
                />
              </div>
            ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaGlobe className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Manage DIDs</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Manage your Direct Inward Dialing numbers</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{dids.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaPhoneAlt size={12} />
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
            <span>Add DID</span>
          </Button>
          <CSVLink
            data={csvData}
            filename={"dids.csv"}
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
            </div>
            <span>Export</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  )
}

// Search Bar
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search-container position-relative">
      <FaSearch className="position-absolute text-muted" style={{ left: "10px", top: "12px" }} />
      <input
        type="text"
        className="form-control ps-4 border-0 shadow-sm"
        placeholder="Search DIDs..."
        value={searchTerm}
        onChange={onSearchChange}
        style={{ borderRadius: "8px", height: "42px" }}
      />
    </div>
  )
}

// Status Badge
function StatusBadge({ status }) {
  let variant = "success"
  let text = "Active"
  let icon = <FaCheckCircle className="me-1" />

  if (status !== 1 && status !== "1") {
    variant = "danger"
    text = "Inactive"
    icon = <FaTimesCircle className="me-1" />
  }

  return (
    <Badge bg={variant} className="d-flex align-items-center justify-content-center" style={{ width: "90px" }}>
      {icon} {text}
    </Badge>
  )
}

// Action Buttons
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2 justify-content-center">
      <Button variant="outline-primary" size="sm" className="action-btn" onClick={onEdit}>
        <FaEdit className="btn-icon" />
      </Button>
      <Button variant="outline-danger" size="sm" className="action-btn" onClick={onDelete}>
        <FaTrashAlt className="btn-icon" />
      </Button>
    </div>
  )
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-5">
      <div className="mb-3">
        <FaPhoneAlt className="text-muted" style={{ fontSize: "3rem", opacity: "0.3" }} />
      </div>
      <h5 className="text-muted mb-3">No DIDs Found</h5>
      <p className="text-muted mb-4">There are no DIDs to display. Try adding a new DID or adjusting your search.</p>
      <Button variant="primary" className="d-inline-flex align-items-center gap-2">
        <FaPlusCircle /> Add Your First DID
      </Button>
    </div>
  )
}

// Table
function DIDsTable({ dids, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading DIDs...</p>
      </div>
    )
  }

  if (!dids || dids.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <Table hover className="elegant-table align-middle mb-0">
        <thead className="bg-light">
          <tr>
            <th className="ps-3 py-3">DID</th>
            <th className="py-3">Country</th>
            <th className="py-3 text-center">Status</th>
            <th className="py-3 text-end">Setup Price €</th>
            <th className="py-3 text-end">Monthly Price €</th>
            <th className="py-3">Description</th>
            <th className="py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dids.map((did) => (
            <tr key={did.id} className="border-bottom">
              <td className="ps-3 py-3 fw-semibold text-primary">{did.did}</td>
              <td className="py-3">{did.country}</td>
              <td className="py-3 text-center">
                <StatusBadge status={did.activated} />
              </td>
              <td className="py-3 text-end">{did.connection_charge || "0"} €</td>
              <td className="py-3 text-end">{did.fixrate || "0"} €</td>
              <td className="py-3">
                <div className="text-truncate" style={{ maxWidth: "200px" }}>
                  {did.description || "-"}
                </div>
              </td>
              <td className="py-3 text-center">
                <ActionButtons
                  onEdit={() => onEdit(did)}
                  onDelete={() => onDelete(did.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// Pagination
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  if (pageCount <= 1) return null

  return (
    <ReactPaginate
      previousLabel={"Previous"}
      nextLabel={"Next"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination mb-0 justify-content-end"}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link"}
      previousClassName={"page-item"}
      previousLinkClassName={"page-link"}
      nextClassName={"page-item"}
      nextLinkClassName={"page-link"}
      breakClassName={"page-item"}
      breakLinkClassName={"page-link"}
      activeClassName={"active"}
      forcePage={currentPage}
    />
  )
}

// Modal Form
function DIDModal({
  show,
  onHide,
  title,
  onSubmit,
  did,
  onInputChange,
  isSubmitting,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              {/* Basic Info */}
              <div className="border p-3 mb-3">
                <h6>Basic Information</h6>
                <Form.Group className="mb-2">
                  <Form.Label>DID Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="did"
                    value={did.did}
                    onChange={(e) => onInputChange(e, "did")}
                    placeholder="Enter DID number"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    name="country"
                    value={did.country}
                    onChange={(e) => onInputChange(e, "country")}
                    placeholder="Enter country"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="activated"
                    value={did.activated}
                    onChange={(e) => onInputChange(e, "activated")}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={did.description}
                    onChange={(e) => onInputChange(e, "description")}
                    placeholder="Enter description"
                    rows={3}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="col-md-6">
              {/* Pricing */}
              <div className="border p-3 mb-3">
                <h6>Pricing</h6>
                <Form.Group className="mb-2">
                  <Form.Label>Setup Price (€)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="connection_charge"
                    value={did.connection_charge}
                    onChange={(e) => onInputChange(e, "connection_charge")}
                    placeholder="Enter setup price"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Monthly Price (€)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="fixrate"
                    value={did.fixrate}
                    onChange={(e) => onInputChange(e, "fixrate")}
                    placeholder="Enter monthly price"
                  />
                </Form.Group>
              </div>
              {/* Advanced Settings */}
              <div className="border p-3 mb-3">
                <h6>Advanced Settings</h6>
                <Form.Group className="mb-2">
                  <Form.Label>Minimum Time Buy</Form.Label>
                  <Form.Control
                    type="number"
                    name="min_time_buy"
                    value={did.min_time_buy}
                    onChange={(e) => onInputChange(e, "min_time_buy")}
                    placeholder="Enter minimum time buy"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Buy Price Inblock</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="buy_price_inblock"
                    value={did.buy_price_inblock}
                    onChange={(e) => onInputChange(e, "buy_price_inblock")}
                    placeholder="Enter buy price inblock"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Buy Price Increment</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="buy_price_increment"
                    value={did.buy_price_increment}
                    onChange={(e) => onInputChange(e, "buy_price_increment")}
                    placeholder="Enter buy price increment"
                  />
                </Form.Group>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              title
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

// Main Page Component
function DIDsPage() {
  // State management
  const [dids, setDids] = useState([]);
  const [filteredDids, setFilteredDids] = useState([]);
  const [newDid, setNewDid] = useState(DEFAULT_NEW_DID);
  const [editDid, setEditDid] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination
  const pageCount = Math.ceil(filteredDids.length / ITEMS_PER_PAGE);
  const pagedDids = filteredDids.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Fetch data
  const fetchDIDs = () => {
    setIsLoading(true);
    axios.get('http://localhost:5000/api/admin/DIDs/afficher')
      .then((response) => {
        setDids(response.data.dids);
        setFilteredDids(response.data.dids);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching DIDs:', error);
        setErrorMessage(`Failed to load DIDs: ${error.response?.data?.message || error.message}`);
        setIsLoading(false);
      });
  };

  // Initial data load
  useEffect(() => {
    fetchDIDs();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = dids.filter(did =>
      did.did && did.did.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDids(filtered);
    setCurrentPage(0);
  }, [searchTerm, dids]);

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  // Handlers
  const handleAddDid = () => {
    setIsSubmitting(true);
    axios.post('http://localhost:5000/api/admin/DIDs/ajouter', newDid)
      .then((response) => {
        fetchDIDs();
        setNewDid(DEFAULT_NEW_DID);
        setShowAddModal(false);
        setSuccessMessage('DID added successfully!');
        setErrorMessage('');
        clearMessages();
      })
      .catch((error) => {
        console.error('Error adding DID:', error);
        setErrorMessage(`Failed to add DID: ${error.response?.data?.message || error.message}`);
        setSuccessMessage('');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleEditDid = () => {
    setIsSubmitting(true);
    axios.put(`http://localhost:5000/api/admin/DIDs/modifier/${editDid.id}`, editDid)
      .then(() => {
        fetchDIDs();
        setShowEditModal(false);
        setSuccessMessage('DID updated successfully!');
        setErrorMessage('');
        clearMessages();
      })
      .catch((error) => {
        console.error('Error updating DID:', error);
        setErrorMessage(`Failed to update DID: ${error.response?.data?.message || error.message}`);
        setSuccessMessage('');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteDid = (didId) => {
    if (window.confirm('Are you sure you want to delete this DID?')) {
      axios.delete(`http://localhost:5000/api/admin/DIDs/supprimer/${didId}`)
        .then(() => {
          fetchDIDs();
          setSuccessMessage('DID deleted successfully!');
          setErrorMessage('');
          clearMessages();
        })
        .catch((error) => {
          console.error('Error deleting DID:', error);
          setErrorMessage(`Failed to delete DID: ${error.response?.data?.message || error.message}`);
          setSuccessMessage('');
        });
    }
  };

  // Modal openers
  const openEditModal = (did) => {
    setEditDid({
      id: did.id,
      did: did.did,
      country: did.country,
      activated: did.activated.toString(),
      connection_charge: did.connection_charge,
      fixrate: did.fixrate,
      id_user: did.id_user || 1,
      min_time_buy: did.min_time_buy,
      buy_price_inblock: did.buy_price_inblock,
      buy_price_increment: did.buy_price_increment,
      min_time_sell: did.min_time_sell,
      initial_block: did.initial_block,
      billing_block: did.billing_block,
      charge_who: did.charge_who || 'DID owner',
      back: did.back || 'Backup',
      server: did.server,
      description: did.description
    });
    setShowEditModal(true);
  };

  // Handle input changes for modals
  const handleInputChange = (e, field) => {
    const { value } = e.target;
    if (showAddModal) {
      setNewDid((prev) => ({ ...prev, [field]: value }));
    } else if (showEditModal) {
      setEditDid((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .btn-hover-effect .icon-container {
          transition: transform 0.3s ease;
        }
        .btn-hover-effect:hover .icon-container {
          transform: translateY(-2px);
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .pulse-effect {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .elegant-table th, .elegant-table td {
          border-top: none;
          border-bottom: 1px solid #e9ecef;
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
      `,
        }}
      />

      <div className="dashboard-main" style={{ marginLeft: "80px" }}>
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow border-0 overflow-hidden main-card">
                <DIDsHeader
                  onAddClick={() => setShowAddModal(true)}
                  dids={dids}
                  isExporting={isExporting}
                />
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {errorMessage && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {errorMessage}
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
                      <SearchBar searchTerm={searchTerm} onSearchChange={(e) => setSearchTerm(e.target.value)} />
                    </Col>
                  </Row>

                  <DIDsTable
                    dids={pagedDids}
                    onEdit={openEditModal}
                    onDelete={handleDeleteDid}
                    isLoading={isLoading}
                  />

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!isLoading && (
                        <>
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{pagedDids.length}</span> of {filteredDids.length} DIDs
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtered from {dids.length} total
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <PaginationSection
                      pageCount={pageCount}
                      onPageChange={({ selected }) => setCurrentPage(selected)}
                      currentPage={currentPage}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <DIDModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        title="Add DID"
        onSubmit={handleAddDid}
        did={newDid}
        onInputChange={handleInputChange}
        isSubmitting={isSubmitting}
      />

      <DIDModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="Edit DID"
        onSubmit={handleEditDid}
        did={editDid || {}}
        onInputChange={handleInputChange}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default DIDsPage;
