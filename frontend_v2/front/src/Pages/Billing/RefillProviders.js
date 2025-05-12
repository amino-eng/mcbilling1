import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Form, Modal, Alert, Card, Container, Row, Col, Badge, Spinner } from "react-bootstrap";
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
  FaCreditCard,
  FaMoneyBillWave,
  FaCog
} from "react-icons/fa";

// Constants
const ITEMS_PER_PAGE = 10;

const DEFAULT_MODAL_DATA = {
  provider: '',
  credit: '',
  description: '',
  payment: '1',
  id: null,
};

// Header Component
function ProviderHeader({ onAddClick, providers, isExporting = false }) {
  const csvData = [
    ["Provider", "Credit", "Description", "Payment", "Date"],
    ...providers.map(e => [
      e.provider_name,
      parseFloat(e.credit).toFixed(4),
      e.description,
      e.payment === 1 ? "Yes" : "No",
      new Date(e.date).toLocaleDateString()
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
                <FaCreditCard
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
            <h2 className="fw-bold mb-0 text-white">Liste des fournisseurs de recharge</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos fournisseurs de recharge facilement</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{providers.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaCreditCard size={12} />
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
            filename={"refill_providers.csv"}
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
            </div>
            <span>{isExporting ? "Exportation..." : "Exporter CSV"}</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  );
}

// Search Bar Component
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search-container position-relative">
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <FaSearch className="text-muted" />
        </span>
        <Form.Control
          type="text"
          placeholder="Rechercher un fournisseur..."
          value={searchTerm}
          onChange={onSearchChange}
          className="border-start-0 ps-0 shadow-none"
          style={{ borderRadius: "0 0.375rem 0.375rem 0" }}
        />
      </div>
    </div>
  );
}

// Payment Badge Component
function PaymentBadge({ payment }) {
  if (payment === 1) {
    return (
      <Badge 
        bg="success" 
        className="d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{ fontSize: "0.8rem" }}
      >
        <FaCheckCircle size={12} /> Oui
      </Badge>
    );
  }
  
  return (
    <Badge 
      bg="danger" 
      className="d-inline-flex align-items-center gap-1 px-2 py-1"
      style={{ fontSize: "0.8rem" }}
    >
      <FaTimesCircle size={12} /> Non
    </Badge>
  );
}

// Action Buttons Component
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex justify-content-center gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onEdit}
        className="action-btn d-flex align-items-center justify-content-center p-2"
        title="Modifier"
      >
        <FaEdit className="btn-icon" />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onDelete}
        className="action-btn d-flex align-items-center justify-content-center p-2"
        title="Supprimer"
      >
        <FaTrashAlt className="btn-icon" />
      </Button>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-5 my-4 bg-light rounded-3">
      <div className="mb-3">
        <FaCreditCard size={48} className="text-muted opacity-50" />
      </div>
      <h5 className="fw-bold">Aucun fournisseur trouvé</h5>
      <p className="text-muted mb-4">
        Aucun fournisseur de recharge n'a été trouvé. Vous pouvez en ajouter un nouveau.
      </p>
      <Button variant="primary" className="d-inline-flex align-items-center gap-2">
        <FaPlusCircle /> Ajouter un fournisseur
      </Button>
    </div>
  );
}

// Provider Table Component
function ProviderTable({ providers, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des données...</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="table-responsive shadow-sm table-container"
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e9ecef",
      }}
    >
      <Table hover className="align-middle mb-0 elegant-table">
        <thead
          style={{
            backgroundColor: "#f8f9fa",
            color: "#495057",
            borderBottom: "2px solid #dee2e6",
          }}
        >
          <tr>
            <th className="py-3 px-4" style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              border: "none",
              paddingTop: "15px",
              paddingBottom: "15px",
            }}>
              Fournisseur
            </th>
            <th className="py-3 px-4" style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              border: "none",
              paddingTop: "15px",
              paddingBottom: "15px",
            }}>
              Crédit
            </th>
            <th className="py-3 px-4" style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              border: "none",
              paddingTop: "15px",
              paddingBottom: "15px",
            }}>
              Description
            </th>
            <th className="py-3 px-4 text-center" style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              border: "none",
              paddingTop: "15px",
              paddingBottom: "15px",
            }}>
              Paiement
            </th>
            <th className="py-3 px-4" style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              border: "none",
              paddingTop: "15px",
              paddingBottom: "15px",
            }}>
              Date
            </th>
            <th className="py-3 px-4 text-center" style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              border: "none",
              paddingTop: "15px",
              paddingBottom: "15px",
            }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr
              key={provider.id}
              className="border-top"
              style={{
                transition: "all 0.2s ease",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <td className="py-3 px-4 fw-semibold">{provider.provider_name}</td>
              <td className="py-3 px-4">{parseFloat(provider.credit).toFixed(4)}</td>
              <td className="py-3 px-4">
                {provider.description || <span className="text-muted fst-italic">Non spécifié</span>}
              </td>
              <td className="py-3 px-4 text-center">
                <PaymentBadge payment={provider.payment} />
              </td>
              <td className="py-3 px-4">{new Date(provider.date).toLocaleDateString()}</td>
              <td className="py-3 px-4">
                <ActionButtons onEdit={() => onEdit(provider)} onDelete={() => onDelete(provider.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

// Pagination Component
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  if (pageCount <= 1) return null;

  return (
    <div className="d-flex justify-content-center mt-4">
      <ReactPaginate
        previousLabel={<span>&laquo;</span>}
        nextLabel={<span>&raquo;</span>}
        breakLabel={<span>...</span>}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={onPageChange}
        forcePage={currentPage}
        containerClassName="pagination pagination-md"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakClassName="page-item"
        breakLinkClassName="page-link"
        activeClassName="active"
      />
    </div>
  );
}

// Provider Modal Component
function ProviderModal({
  show,
  onHide,
  title,
  onSubmit,
  modalData,
  providers,
  onInputChange,
  isSubmitting,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" className="provider-modal">
      <Modal.Header closeButton className="border-0 pb-0 bg-primary bg-opacity-10">
        <Modal.Title className="text-primary fw-bold d-flex align-items-center">
          <FaCreditCard className="me-2" /> {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Fournisseur</Form.Label>
                <Form.Select
                  value={modalData.provider}
                  onChange={(e) => onInputChange({ ...modalData, provider: e.target.value })}
                  required
                  className="shadow-sm"
                >
                  <option value="">Sélectionnez un fournisseur</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.provider_name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Crédit</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={modalData.credit}
                  onChange={(e) => onInputChange({ ...modalData, credit: e.target.value })}
                  required
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              type="text"
              value={modalData.description}
              onChange={(e) => onInputChange({ ...modalData, description: e.target.value })}
              className="shadow-sm"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Ajouter paiement</Form.Label>
            <Form.Select
              value={modalData.payment}
              onChange={(e) => onInputChange({ ...modalData, payment: e.target.value })}
              className="shadow-sm"
            >
              <option value="1">Oui</option>
              <option value="0">Non</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Fermer
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="d-flex align-items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" />
              <span>Traitement...</span>
            </>
          ) : (
            <span>{title === "Modifier" ? "Modifier" : "Ajouter"}</span>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function RefillProviders() {
  const [data, setData] = useState([]);
  const [providers, setProviders] = useState([]);
  const [modalData, setModalData] = useState(DEFAULT_MODAL_DATA);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/refillProviders/afficher");
      setData(response.data.providers);
      setError("");
    } catch (error) {
      console.error("Error fetching providers:", error);
      setError("Erreur lors de la récupération des fournisseurs.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/refillProviders/");
      setProviders(response.data.providers);
    } catch (error) {
      console.error("Error fetching provider list:", error);
      setError("Erreur lors de la récupération des providers.");
    }
  };
  
  // Clear messages after timeout
  const clearMessages = () => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  };

  // Handlers
  const handleAdd = () => {
    setModalData(DEFAULT_MODAL_DATA);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (provider) => {
    setModalData(provider);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/refillProviders/modifier/${modalData.id}`, modalData);
        setSuccessMessage("Fournisseur modifié avec succès.");
      } else {
        await axios.post("http://localhost:5000/api/admin/refillProviders/ajouter", modalData);
        setSuccessMessage("Fournisseur ajouté avec succès.");
      }
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la modification du fournisseur", error);
      setError("Erreur lors de l'ajout ou de la modification du fournisseur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/refillProviders/supprimer/${id}`);
        setSuccessMessage("Fournisseur supprimé avec succès.");
        fetchData();
      } catch (error) {
        console.error("Erreur lors de la suppression du fournisseur", error);
        setError("Erreur lors de la suppression du fournisseur.");
      }
    }
  };
  
  const handleInputChange = (newData) => {
    setModalData(newData);
  };

  // Filter by search term
const filteredProviders = data.filter((provider) =>
  provider.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
);

// Pagination logic
const pageCount = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
const offset = currentPage * ITEMS_PER_PAGE;
const pagedProviders = filteredProviders.slice(offset, offset + ITEMS_PER_PAGE);

// Handle page change
const handlePageChange = ({ selected }) => {
  setCurrentPage(selected);
};

useEffect(() => {
  fetchData();
  fetchProviders();
}, []);

useEffect(() => {
  clearMessages();
}, [successMessage, error]);

// Add custom CSS for animations and styling
const customStyles = `
  .floating-icon {
    position: absolute;
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
`;

return (
  <div>
    <style>{customStyles}</style>

    <div className="dashboard-main">
      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
              <ProviderHeader 
                onAddClick={handleAdd} 
                providers={data} 
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

                <ProviderTable
                  providers={pagedProviders}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!isLoading && (
                      <>
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{pagedProviders.length}</span> sur {filteredProviders.length}{" "}
                          fournisseurs
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtrés de {data.length} total
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

    <ProviderModal
      show={showModal}
      onHide={() => setShowModal(false)}
      title={isEditing ? "Modifier un fournisseur" : "Ajouter un fournisseur"}
      onSubmit={handleModalSubmit}
      modalData={modalData}
      providers={providers}
      onInputChange={handleInputChange}
      isSubmitting={isSubmitting}
    />
  </div>
);
}
