import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Form, Modal, Alert, Card, Container, Row, Col, Badge, Spinner, FormControl } from "react-bootstrap";
import { CSVLink } from "react-csv";
import ReactPaginate from "react-paginate";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaFileAlt,
  FaCog
} from "react-icons/fa";

// Constants
const ITEMS_PER_PAGE = 10;

const DEFAULT_MODAL_DATA = {
  prefix: "",
  destination: "",
};

// Header Component
function PrefixesHeader({ onAddClick, prefixes, isExporting = false }) {
  const csvData = [
    ["Prefix", "Destination"],
    ...prefixes.map(prefix => [
      prefix.prefix,
      prefix.destination
    ])
  ];

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
                <FaFileAlt
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
            <FaFileAlt className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Prefix List</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Manage your prefixes easily</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{prefixes.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaFileAlt size={12} />
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
            <span>Add</span>
          </Button>
          <CSVLink
            data={csvData}
            filename={"prefixes_export.csv"}
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
            </div>
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
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
      <FormControl
        type="search"
        placeholder="Search prefixes..."
        className="ps-5"
        value={searchTerm}
        onChange={onSearchChange}
      />
      <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
    </div>
  );
}

// Action Buttons Component
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2 justify-content-end">
      <Button
        variant="primary"
        size="sm"
        onClick={onEdit}
        className="action-btn d-flex align-items-center gap-1"
        title="Modifier"
      >
        <FaEdit />
        <span className="d-none d-md-inline">Modifier</span>
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={onDelete}
        className="action-btn d-flex align-items-center gap-1"
        title="Supprimer"
      >
        <FaTrashAlt />
        <span className="d-none d-md-inline">Supprimer</span>
      </Button>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-5">
      <FaFileAlt className="text-muted mb-3" size={48} />
      <h5 className="text-muted">No prefixes found</h5>
      <p className="text-muted small">Start by adding a new prefix</p>
    </div>
  );
}

// Prefixes Table Component
function PrefixesTableComponent({ prefixes, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (prefixes.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table hover className="mb-0">
      <thead>
        <tr>
          <th>Prefix</th>
          <th>Destination</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {prefixes.map((prefix) => (
          <tr key={prefix.id} className="prefix-row">
            <td>{prefix.prefix}</td>
            <td>{prefix.destination}</td>
            <td className="text-end">
              <ActionButtons
                onEdit={() => onEdit(prefix)}
                onDelete={() => onDelete(prefix.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// Pagination Component
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  if (pageCount <= 1) return null;

  return (
    <ReactPaginate
      previousLabel="Previous"
      nextLabel="Next"
      breakLabel="..."
      breakClassName="page-item"
      breakLinkClassName="page-link"
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      containerClassName="pagination mb-0"
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      activeClassName="active"
      forcePage={currentPage}
    />
  );
}

// Prefix Modal Component
function PrefixModal({
  show,
  onHide,
  title,
  onSubmit,
  modalData,
  onInputChange,
  isSubmitting,
  prefixError
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Prefix</Form.Label>
            <Form.Control
              type="text"
              name="prefix"
              value={modalData.prefix}
              onChange={onInputChange}
              isInvalid={!!prefixError}
            />
            <Form.Control.Feedback type="invalid">
              {prefixError}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Destination</Form.Label>
            <Form.Control
              type="text"
              name="destination"
              value={modalData.destination}
              onChange={onInputChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const PrefixesTable = () => {
  const [prefixes, setPrefixes] = useState([]);
  const [filteredPrefixes, setFilteredPrefixes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(DEFAULT_MODAL_DATA);
  const [prefixId, setPrefixId] = useState(null);
  const [prefixError, setPrefixError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchPrefixes = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/Prefixes/afficher/");
      setPrefixes(res.data.prefixes);
      setFilteredPrefixes(res.data.prefixes);
      setError("");
    } catch (err) {
      setError("Error loading prefixes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefixes();
  }, []);

  useEffect(() => {
    const filtered = prefixes.filter(
      (prefix) =>
        prefix.prefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prefix.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrefixes(filtered);
    setCurrentPage(0);
  }, [searchTerm, prefixes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "prefix") {
      if (/\D/.test(value)) {
        setPrefixError("The prefix must contain only numbers.");
      } else {
        setPrefixError("");
      }
      const numericValue = value.replace(/\D/g, "");
      setModalData({ ...modalData, [name]: numericValue });
    } else {
      setModalData({ ...modalData, [name]: value });
    }
  };

  const handleAdd = () => {
    setModalData(DEFAULT_MODAL_DATA);
    setPrefixId(null);
    setShowModal(true);
  };

  const handleEdit = (prefix) => {
    setModalData({ prefix: prefix.prefix, destination: prefix.destination });
    setPrefixId(prefix.id);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (!modalData.prefix || !modalData.destination) {
      setError("All fields are required!");
      return;
    }

    try {
      setIsSubmitting(true);
      if (prefixId === null) {
        await axios.post("http://localhost:5000/api/admin/Prefixes/ajouter", modalData);
        setSuccessMessage("Prefix added successfully!");
      } else {
        await axios.put(`http://localhost:5000/api/admin/Prefixes/modifier/${prefixId}`, modalData);
        setSuccessMessage("Prefix updated successfully!");
      }

      setShowModal(false);
      fetchPrefixes();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Error saving changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this prefix?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/Prefixes/supprimer/${id}`);
        setSuccessMessage("Prefix deleted successfully!");
        fetchPrefixes();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError("Error deleting prefix");
      }
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Pagination logic
  const pageCount = Math.ceil(filteredPrefixes.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const pagedPrefixes = filteredPrefixes.slice(offset, offset + ITEMS_PER_PAGE);

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
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .prefix-row {
      transition: all 0.2s ease;
    }
    .prefix-row:hover {
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
                <PrefixesHeader 
                  onAddClick={handleAdd} 
                  prefixes={prefixes} 
                  isExporting={isExporting}
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

                  <PrefixesTableComponent
                    prefixes={pagedPrefixes}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                  />

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!isLoading && (
                        <>
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{pagedPrefixes.length}</span> of {filteredPrefixes.length} prefixes
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtered from {prefixes.length} total
                            </Badge>
                          )}
                        </>
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

      <PrefixModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={prefixId === null ? "Add Prefix" : "Edit Prefix"}
        onSubmit={handleModalSubmit}
        modalData={modalData}
        onInputChange={handleInputChange}
        isSubmitting={isSubmitting}
        prefixError={prefixError}
      />
    </div>
  );
};

export default PrefixesTable;
