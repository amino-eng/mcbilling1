"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Form,
  Alert,
  InputGroup,
  Dropdown,
  Card,
  Modal,
  Container,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { CSVLink } from "react-csv";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaMoneyBillWave,
  FaEye,
  FaEyeSlash,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";

// Constants
const ITEMS_PER_PAGE = 10;
const apiConfig = {
  apiUrl: 'http://localhost:5000/api'
};

// Header with Export & Add
function RefillHeader({ onAddClick, refills, isExporting }) {
  const csvData = [
    ["Utilisateur", "Crédit", "Date", "Description", "Paiement"],
    ...refills.map((refill) => [
      refill.username || 'N/A',
      refill.credit,
      new Date(refill.date).toLocaleDateString(),
      refill.description || '-',
      refill.payment === 1 ? "Oui" : "Non",
    ]),
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
                <FaMoneyBillWave
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
            <FaMoneyBillWave className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Gestion des Refills</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Gérez les recharges de crédit facilement</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{refills.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaMoneyBillWave size={12} />
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
            <span>Ajouter</span>
          </Button>
          <CSVLink
            data={csvData}
            filename={"refills.csv"}
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
            </div>
            <span>{isExporting ? "Exportation..." : "Exporter"}</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  );
}

// Search Bar
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <InputGroup className="search-bar">
      <InputGroup.Text className="bg-light border-end-0">
        <FaSearch className="text-muted" />
      </InputGroup.Text>
      <Form.Control
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={onSearchChange}
        className="border-start-0 bg-light"
      />
    </InputGroup>
  );
}

// Status Badge
function PaymentBadge({ payment }) {
  if (payment === 1 || payment === true) {
    return (
      <Badge
        bg="success"
        className="d-flex align-items-center gap-1 py-2 px-3 rounded-pill shadow-sm"
      >
        <FaCheckCircle size={12} />
        <span>Payé</span>
      </Badge>
    );
  } else {
    return (
      <Badge
        bg="danger"
        className="d-flex align-items-center gap-1 py-2 px-3 rounded-pill shadow-sm"
      >
        <FaTimesCircle size={12} />
        <span>Non payé</span>
      </Badge>
    );
  }
}

// Action Buttons
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onEdit}
        className="action-btn d-flex align-items-center justify-content-center"
        title="Modifier"
      >
        <FaEdit className="btn-icon" />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onDelete}
        className="action-btn d-flex align-items-center justify-content-center"
        title="Supprimer"
      >
        <FaTrashAlt className="btn-icon" />
      </Button>
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-5 my-4">
      <div className="mb-3">
        <div className="empty-icon-container mx-auto mb-3">
          <FaMoneyBillWave className="text-muted" style={{ fontSize: "3rem", opacity: "0.3" }} />
        </div>
        <h4 className="text-muted">Aucun refill trouvé</h4>
        <p className="text-muted">
          Il n'y a pas de refills à afficher. Essayez d'ajouter un nouveau refill ou de modifier vos critères de recherche.
        </p>
      </div>
      <Button variant="primary" className="d-inline-flex align-items-center gap-2">
        <FaPlusCircle />
        <span>Ajouter un refill</span>
      </Button>
    </div>
  );
}

// Table
function RefillTable({ refills, onEdit, onDelete, isLoading }) {
  return (
    <div className="table-responsive">
      <Table striped bordered hover className="mb-0">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Crédit</th>
            <th>Date</th>
            <th>Description</th>
            <th>Paiement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {refills.map((refill) => (
            <tr key={refill.id}>
              <td>{refill.username || 'N/A'}</td>
              <td>{refill.credit}</td>
              <td>{new Date(refill.date).toLocaleDateString()}</td>
              <td>{refill.description || '-'}</td>
              <td>
                <PaymentBadge payment={refill.payment} />
              </td>
              <td>
                <ActionButtons
                  onEdit={() => onEdit(refill)}
                  onDelete={() => onDelete(refill.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

// Pagination
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      previousLabel={"«"}
      nextLabel={"»"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination pagination-circle justify-content-center"}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link"}
      previousClassName={"page-item"}
      previousLinkClassName={"page-link"}
      nextClassName={"page-item"}
      nextLinkClassName={"page-link"}
      breakClassName={"page-item"}
      breakLinkClassName={"page-link"}
      activeClassName={"active"}
      forcePage={currentPage - 1}
      disabledClassName={"disabled"}
    />
  );
}

// Modal Form
function RefillModal({
  show,
  onHide,
  title,
  onSubmit,
  refill,
  usernames,
  onUsernameChange,
  onInputChange,
  isSubmitting,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <div className="d-flex align-items-center">
            <FaMoneyBillWave className="me-2" />
            {title}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Utilisateur</Form.Label>
                <Dropdown className="w-100">
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" className="w-100 text-start d-flex justify-content-between align-items-center">
                    {refill.username || "Sélectionner un utilisateur"}
                    <FaUsers />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {usernames.map((user) => (
                      <Dropdown.Item
                        key={user.id}
                        onClick={() => onUsernameChange(user.username)}
                        active={refill.username === user.username}
                      >
                        {user.username}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Crédit</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaMoneyBillWave />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="credit"
                    value={refill.credit}
                    onChange={(e) => onInputChange(e, "credit")}
                    placeholder="Montant du crédit"
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={refill.description}
              onChange={(e) => onInputChange(e, "description")}
              placeholder="Description du refill"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="payment-switch"
                label="Paiement effectué"
                checked={refill.payment}
                onChange={(e) => onInputChange({ target: { name: "payment", value: e.target.checked } }, "payment")}
                className="me-2"
              />
              <Badge bg={refill.payment ? "success" : "danger"} className="ms-2">
                {refill.payment ? "Payé" : "Non payé"}
              </Badge>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onHide}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="d-flex align-items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <FaCheckCircle />
                <span>Enregistrer</span>
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function RefillApp() {
  const [refills, setRefills] = useState([]);
  const [selectedRefill, setSelectedRefill] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [newRefill, setNewRefill] = useState({
    id_user: "",
    username: "",
    credit: "",
    description: "",
    payment: false,
  });
  const [editRefill, setEditRefill] = useState({
    id_user: "",
    username: "",
    credit: "",
    description: "",
    payment: false,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRefills, setFilteredRefills] = useState([]);

  // Fetch all refills
  const fetchRefills = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiConfig.apiUrl}/admin/Refills/affiche`);
      setRefills(response.data.refills);
      setFilteredRefills(response.data.refills);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setError("Backend server is not responding. Please try again later.");
      } else {
        setError("Failed to load refills");
      }
      console.error('FetchRefills error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch usernames
  const fetchUsernames = async () => {
    try {
      const response = await axios.get(`${apiConfig.apiUrl}/admin/users/users`);
      setUsernames(response.data.users);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.error('Backend connection failed');
      } else {
        console.error('FetchUsernames error:', error);
      }
    }
  };

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccessMessage("");
    }, 5000);
  };

  // Handle add refill
  const handleAddRefill = async () => {
    try {
      if (!newRefill.id_user || !newRefill.username) {
        setError("Veuillez sélectionner un utilisateur");
        clearMessages();
        return;
      }
      
      if (!newRefill.credit || isNaN(newRefill.credit)) {
        setError("Veuillez entrer un montant valide");
        clearMessages();
        return;
      }
      
      setIsSubmitting(true);
      const response = await axios.post(`${apiConfig.apiUrl}/admin/Refills/add`, {
        ...newRefill,
        id_user: parseInt(newRefill.id_user),
        credit: parseFloat(newRefill.credit)
      });
      if (response.status === 201) {
        await fetchRefills();
        setNewRefill({
          id_user: "",
          username: "",
          credit: "",
          description: "",
          payment: false,
        });
        setShowAddModal(false);
        setSuccessMessage("Refill ajouté avec succès");
        clearMessages();
      }
    } catch (error) {
      console.error('Refill submission error:', {
        error: error.response?.data,
        requestData: newRefill,
        stack: error.stack
      });
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Erreur lors de l'ajout du refill");
      }
      clearMessages();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit refill
  const handleEditRefill = async () => {
    try {
      if (!editRefill.id_user || !editRefill.username) {
        setError("Veuillez sélectionner un utilisateur");
        clearMessages();
        return;
      }
      
      if (!editRefill.credit || isNaN(editRefill.credit)) {
        setError("Veuillez entrer un montant valide");
        clearMessages();
        return;
      }
      
      setIsSubmitting(true);
      const response = await axios.put(
        `${apiConfig.apiUrl}admin/Refills/update/${editRefill.id}`,
        {
          ...editRefill,
          id_user: parseInt(editRefill.id_user),
          credit: parseFloat(editRefill.credit)
        }
      );
      
      if (response.status === 200) {
        await fetchRefills();
        setShowEditModal(false);
        setSuccessMessage("Refill modifié avec succès");
        clearMessages();
      }
    } catch (error) {
      console.error('Refill update error:', {
        error: error.response?.data,
        requestData: editRefill,
        stack: error.stack
      });
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Erreur lors de la modification du refill");
      }
      clearMessages();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete refill
  const handleDeleteRefill = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce refill ?")) {
      try {
        const response = await axios.delete(`${apiConfig.apiUrl}/admin/Refills/delete/${id}`);
        if (response.status === 200) {
          await fetchRefills();
          setSuccessMessage("Refill supprimé avec succès");
          clearMessages();
        }
      } catch (error) {
        setError("Erreur lors de la suppression du refill");
        clearMessages();
      }
    }
  };

  // Modal openers
  const openEditModal = (refill) => {
    setEditRefill({
      id: refill.id,
      username: refill.username,
      credit: refill.credit,
      description: refill.description,
      payment: refill.payment === 1,
    });
    setShowEditModal(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredRefills(refills);
      return;
    }
    
    const filtered = refills.filter((refill) => {
      return (
        (refill.credit && refill.credit.toString().toLowerCase().includes(term)) ||
        (refill.username && refill.username.toLowerCase().includes(term)) ||
        (refill.description && refill.description.toLowerCase().includes(term))
      );
    });
    setFilteredRefills(filtered);
  };

  // Handle input change for forms
  const handleInputChange = (e, field) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (showAddModal) {
      setNewRefill(prev => ({ ...prev, [field]: value }));
    } else if (showEditModal) {
      setEditRefill(prev => ({ ...prev, [field]: value }));
    }
  };

  // Pagination calculation
  const pageCount = Math.ceil(filteredRefills.length / ITEMS_PER_PAGE);
  const paginatedRefills = filteredRefills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchRefills();
    fetchUsernames();
  }, []);

  // CSS styles
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
    },
    card: {
      borderRadius: "0.5rem",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "none",
    },
  };

  return (
    <div className="dashboard-container">
      <style>
        {`
        .btn-hover-effect {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .btn-icon {
          transition: transform 0.2s;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
        .pulse-effect {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .search-bar {
          max-width: 300px;
          transition: all 0.3s;
        }
        .search-bar:focus-within {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        `}
      </style>

      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card style={styles.card}>
              <RefillHeader
                onAddClick={() => setShowAddModal(true)}
                refills={refills}
                isExporting={isExporting}
              />

              <Card.Body className="p-4">
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
                      onSearchChange={handleSearchChange}
                    />
                  </Col>
                </Row>

                <RefillTable
                  refills={paginatedRefills}
                  onEdit={openEditModal}
                  onDelete={handleDeleteRefill}
                  isLoading={isLoading}
                />

                {pageCount > 0 && (
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!isLoading && (
                        <>
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{paginatedRefills.length}</span> sur {filteredRefills.length} Refills
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtrés de {refills.length} total
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <PaginationSection
                      pageCount={pageCount}
                      onPageChange={(selected) => setCurrentPage(selected.selected + 1)}
                      currentPage={currentPage}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <RefillModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        title="Ajouter un Refill"
        onSubmit={handleAddRefill}
        refill={newRefill}
        usernames={usernames}
        onUsernameChange={(username) => setNewRefill(prev => ({ ...prev, username }))}
        onInputChange={handleInputChange}
        isSubmitting={isSubmitting}
      />

      <RefillModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="Modifier un Refill"
        onSubmit={handleEditRefill}
        refill={editRefill}
        usernames={usernames}
        onUsernameChange={(username) => setEditRefill(prev => ({ ...prev, username }))}
        onInputChange={handleInputChange}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default RefillApp;
