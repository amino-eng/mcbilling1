import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Form, Modal, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner, Pagination } from "react-bootstrap";
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
  FaCreditCard,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaAngleRight,
  FaAngleLeft,
  FaGlobe,
  FaToggleOn,
  FaArrowDown,
  FaArrowUp,
  FaLink
} from "react-icons/fa";

// Constants
const ITEMS_PER_PAGE = 10;

// Predefined payment methods
const predefinedPaymentMethods = [
  { id: 1, name: "Pagseguro" },
  { id: 2, name: "Moip" },
  { id: 3, name: "Paypal" },
  { id: 4, name: "PagoFacil o Rapipago" },
  { id: 5, name: "Tarjeta de crédito, DineroMail" },
  { id: 6, name: "Placetopay" },
  { id: 7, name: "EFI" },
  { id: 8, name: "MercadoPago" },
  { id: 9, name: "Boleto Bancario paghiper" },
  { id: 10, name: "MoPay" },
  { id: 11, name: "sagepay" },
  { id: 12, name: "Stripe" },
  { id: 13, name: "Elavon" },
  { id: 14, name: "BITCOIN" },
  { id: 15, name: "Custom Method" }
];

// Predefined countries
const predefinedCountries = [
  { id: 1, name: "Argentina" },
  { id: 2, name: "Brasil" },
  { id: 3, name: "Colombia" },
  { id: 4, name: "Latino America" },
  { id: 5, name: "Global" }
];

const DEFAULT_PAYMENT_METHOD = {
  payment_method: '',
  show_name: '',
  username: '',
  country: '',
  active: true,
  min_amount: '',
  max_amount: '',
  url: '',
  id_user: null
};

export default function PaymentMethods() {
  // Style pour l'animation des alertes
  const fadeInStyle = {
    animation: "fadeIn 0.5s ease-in-out",
  };
  // Store all data fetched from API
  const [allData, setAllData] = useState([]);
  // Store only the data to display on current page
  const [displayData, setDisplayData] = useState([]);
  
  const [modalData, setModalData] = useState({
    payment_method: '',
    show_name: '',
    username: '',
    country: '',
    active: true,
    min_amount: '',
    max_amount: '',
    url: '',
    id_user: null
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Modal de confirmation pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch usernames
  const fetchUsernames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users/users");
      setUsernames(response.data.users);
    } catch (error) {
      console.error("Erreur lors du chargement des usernames", error);
    }
  };

  // Fetch all payment methods
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/PayMeth/afficher");
      if (response.data && response.data.payment_methods) {
        // Store all data
        setAllData(response.data.payment_methods);
        // Update the displayed data based on current page
        updateDisplayData(response.data.payment_methods, currentPage, itemsPerPage);
      }
    } catch (error) {
      setError("Erreur lors de la récupération des méthodes de paiement.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update displayed data based on pagination
  const updateDisplayData = (data, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setDisplayData(data.slice(startIndex, endIndex));
  };

  // Open modal for adding a new payment method
  const handleAdd = () => {
    setModalData({
      payment_method: '',
      show_name: '',
      username: '',
      country: '',
      active: true,
      min_amount: '',
      max_amount: '',
      url: '',
      id_user: null
    });
    setIsEditing(false);
    setSubmitError("");
    setShowModal(true);
  };

  // Open modal for editing an existing payment method
  const handleEdit = (method) => {
    setModalData(method);
    setIsEditing(true);
    setSubmitError("");
    setShowModal(true);
  };

  // Fonction pour effacer les messages après un délai
  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage("");
      setError("");
      setSubmitError("");
    }, 5000); // 5 secondes
  };

  // Handle form submission for adding or editing payment methods
  const handleModalSubmit = async () => {
    // Validate required fields
    if (!modalData.payment_method || !modalData.country || !modalData.id_user) {
      setSubmitError("Veuillez remplir tous les champs obligatoires (méthode de paiement, pays et utilisateur)");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/PayMeth/modifier/${modalData.id}`, modalData);
        setSuccessMessage(`La méthode de paiement ${modalData.payment_method} a été modifiée avec succès.`);
      } else {
        await axios.post("http://localhost:5000/api/admin/PayMeth/ajouter", modalData);
        setSuccessMessage(`La méthode de paiement ${modalData.payment_method} a été ajoutée avec succès.`);
      }
      // Refresh data after submission
      await fetchData();
      setShowModal(false);
      setSubmitError("");
      clearMessages();
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la modification de la méthode de paiement", error);
      if (error.response && error.response.data) {
        setSubmitError(error.response.data.error || "Une erreur s'est produite");
      } else {
        setSubmitError("Une erreur s'est produite lors de la communication avec le serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal de confirmation de suppression
  const confirmDelete = (method) => {
    setDeleteId(method.id);
    setDeleteItemName(method.payment_method);
    setShowDeleteModal(true);
  };

  // Handle deletion of a payment method
  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/PayMeth/supprimer/${deleteId}`);
      // Refresh data after deletion
      await fetchData();
      setSuccessMessage(`La méthode de paiement a été supprimée avec succès.`);
      clearMessages();
    } catch (error) {
      console.error("Erreur lors de la suppression de la méthode de paiement", error);
      setError("Erreur lors de la suppression de la méthode de paiement.");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Handle user selection - now sets both username and id_user
  const handleUserSelect = (user) => {
    setModalData({ 
      ...modalData, 
      username: user.username,
      id_user: user.id
    });
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    updateDisplayData(allData, pageNumber, itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    updateDisplayData(allData, 1, newItemsPerPage);
  };

  useEffect(() => {
    fetchData();
    fetchUsernames();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(allData.length / itemsPerPage);

  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  // Prepare CSV data for export
  const csvData = [
    ["Méthode de paiement", "Nom d'affichage", "Utilisateur", "Pays", "Statut", "Montant Min", "Montant Max", "URL"],
    ...allData.map((method) => [
      method.payment_method,
      method.show_name,
      method.username,
      method.country,
      method.active ? "Actif" : "Inactif",
      method.min_amount,
      method.max_amount,
      method.url,
    ]),
  ];

  // For pagination with ReactPaginate
  const pageCount = Math.ceil(allData.length / itemsPerPage);
  const handlePageClick = (event) => {
    handlePageChange(event.selected + 1);
  };

  return (
    <div>
      {/* Messages de succès */}
      {successMessage && (
        <Alert variant="success" className="d-flex align-items-center shadow-sm border-0 mb-3" style={fadeInStyle}>
          <FaCheckCircle className="me-2" size={18} />
          {successMessage}
        </Alert>
      )}
      
      {/* Messages d'erreur */}
      {error && (
        <Alert variant="danger" className="d-flex align-items-center shadow-sm border-0 mb-3" style={fadeInStyle}>
          <FaTimesCircle className="me-2" size={18} />
          {error}
        </Alert>
      )}
      <style jsx>{`
        .dashboard-main {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .main-card {
          border-radius: 12px;
          overflow: hidden;
        }
        .btn-hover-effect {
          transition: all 0.3s ease;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
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
          position: absolute;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .action-btn {
          transition: all 0.2s ease;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dashboard-main" style={{ marginLeft: "80px" }}>
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow border-0 overflow-hidden main-card">
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
                        <FaCreditCard className="text-primary fs-3" />
                      </div>
                      <div>
                        <h2 className="fw-bold mb-0 text-white">Gestion des Méthodes de Paiement</h2>
                        <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos méthodes de paiement facilement</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
                        <span className="me-2 fw-normal">
                          Total: <span className="fw-bold">{allData.length}</span>
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
                        onClick={handleAdd}
                        className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                      >
                        <div className="icon-container">
                          <FaPlusCircle />
                        </div>
                        <span>Ajouter</span>
                      </Button>
                      <CSVLink
                        data={csvData}
                        filename={"payment_methods.csv"}
                        className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                        disabled={loading}
                      >
                        <div className="icon-container">
                          {loading ? <Spinner animation="border" size="sm" /> : <FaDownload />}
                        </div>
                        <span>{loading ? "Exportation..." : "Exporter"}</span>
                      </CSVLink>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {error}
                    </Alert>
                  )}
                  {submitError && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {submitError}
                    </Alert>
                  )}

                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          placeholder="Rechercher..."
                          className="ps-4 shadow-sm"
                          style={{ borderRadius: "8px" }}
                        />
                        <FaSearch
                          className="position-absolute text-muted"
                          style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}
                        />
                      </div>
                    </Col>
                    <Col md={6} lg={3} className="ms-auto">
                      <div className="d-flex align-items-center">
                        <span className="me-2 text-nowrap">Éléments par page:</span>
                        <Form.Select 
                          className="shadow-sm"
                          style={{ width: "80px" }} 
                          value={itemsPerPage} 
                          onChange={handleItemsPerPageChange}
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                          <option value={allData.length}>Tous</option>
                        </Form.Select>
                      </div>
                    </Col>
                  </Row>

                  {loading && allData.length === 0 ? (
                    <div className="text-center my-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="table-responsive shadow-sm table-container"
                        style={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <Table responsive hover className="align-middle mb-0 elegant-table">
                          <thead
                            style={{
                              backgroundColor: "#f8f9fa",
                              color: "#495057",
                              borderBottom: "2px solid #dee2e6",
                            }}
                          >
                            <tr>
                              <th
                                className="py-3 px-4"
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  border: "none",
                                  paddingTop: "15px",
                                  paddingBottom: "15px",
                                }}
                              >
                                Utilisateur
                              </th>
                              <th
                                className="py-3 px-4"
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  border: "none",
                                  paddingTop: "15px",
                                  paddingBottom: "15px",
                                }}
                              >
                                Pays
                              </th>
                              <th
                                className="py-3 px-4"
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  border: "none",
                                  paddingTop: "15px",
                                  paddingBottom: "15px",
                                }}
                              >
                                Méthode de paiement
                              </th>
                              <th
                                className="py-3 px-4 text-center"
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  border: "none",
                                  paddingTop: "15px",
                                  paddingBottom: "15px",
                                }}
                              >
                                Statut
                              </th>
                              <th
                                className="py-3 px-4 text-center"
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  border: "none",
                                  paddingTop: "15px",
                                  paddingBottom: "15px",
                                }}
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayData.length > 0 ? (
                              displayData.map((e) => (
                                <tr
                                  key={e.id}
                                  className="border-top"
                                  style={{
                                    transition: "all 0.2s ease",
                                    borderBottom: "1px solid #e9ecef",
                                  }}
                                >
                                  <td className="py-3 px-4 fw-semibold">{e.username}</td>
                                  <td className="py-3 px-4">{e.country}</td>
                                  <td className="py-3 px-4">{e.payment_method}</td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge 
                                      bg={e.active ? "success" : "danger"} 
                                      className="px-3 py-2 rounded-pill"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      {e.active ? (
                                        <>
                                          <FaCheckCircle className="me-1" />
                                          Active
                                        </>
                                      ) : (
                                        <>
                                          <FaTimesCircle className="me-1" />
                                          Inactive
                                        </>
                                      )}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="d-flex justify-content-center gap-3">
                                      <Button 
                                        variant="light" 
                                        className="btn-icon-only rounded-circle shadow-sm d-flex align-items-center justify-content-center p-2"
                                        onClick={() => handleEdit(e)}
                                        title="Modifier"
                                        style={{
                                          width: "38px",
                                          height: "38px",
                                          transition: "all 0.3s ease",
                                          borderColor: "#dee2e6"
                                        }}
                                      >
                                        <FaEdit className="text-primary" size={16} />
                                      </Button>
                                      <Button 
                                        variant="light" 
                                        className="btn-icon-only rounded-circle shadow-sm d-flex align-items-center justify-content-center p-2"
                                        onClick={() => confirmDelete(e)}
                                        title="Supprimer"
                                        style={{
                                          width: "38px",
                                          height: "38px",
                                          transition: "all 0.3s ease",
                                          borderColor: "#dee2e6"
                                        }}
                                      >
                                        <FaTrashAlt className="text-danger" size={16} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <div className="d-flex flex-column align-items-center">
                                    <FaTimesCircle size={30} className="text-muted mb-3" />
                                    <p className="mb-0 fw-semibold">Aucune méthode de paiement trouvée</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>

                      {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                          <ReactPaginate
                            breakLabel={<span>...</span>}
                            nextLabel={<span className="d-flex align-items-center"><FaAngleRight /></span>}
                            onPageChange={handlePageClick}
                            pageRangeDisplayed={3}
                            marginPagesDisplayed={2}
                            pageCount={pageCount}
                            previousLabel={<span className="d-flex align-items-center"><FaAngleLeft /></span>}
                            renderOnZeroPageCount={null}
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
                      )}
                      
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                        <div className="text-muted small">
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{displayData.length}</span> sur {allData.length} méthodes de paiement
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-center text-muted">
                        Affichage de {displayData.length} sur {allData.length} méthodes de paiement
                      </div>
                    </>
                  )}

                
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {loading && allData.length === 0 ? (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : null}

      {/* Modal for Adding/Editing */}
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static" className="payment-method-modal">
          <Modal.Header closeButton className="border-0 pb-0 bg-primary bg-opacity-10">
            <Modal.Title className="text-primary fw-bold d-flex align-items-center">
              <FaCreditCard className="me-2" /> {isEditing ? 'Modifier' : 'Ajouter'} une méthode de paiement
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            <hr className="mb-4" />
            {submitError && (
              <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                <FaTimesCircle className="me-2" />
                {submitError}
              </Alert>
            )}
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaCreditCard className="me-2 text-primary" size={14} />
                      Méthode de paiement <span className="text-danger ms-1">*</span>
                    </Form.Label>
                    <Dropdown className="w-100">
                      <Dropdown.Toggle
                        variant="light"
                        id="dropdown-basic"
                        className="shadow-sm w-100 text-start d-flex justify-content-between align-items-center"
                      >
                        <span>{modalData.payment_method || "Sélectionner une méthode de paiement"}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100 shadow-sm">
                        {predefinedPaymentMethods.map((method) => (
                          <Dropdown.Item
                            key={method.id}
                            onClick={() => setModalData({ ...modalData, payment_method: method.name })}
                          >
                            {method.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaEdit className="me-2 text-primary" size={14} />
                      Nom d'affichage
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={modalData.show_name}
                      onChange={(e) => setModalData({ ...modalData, show_name: e.target.value })}
                      className="shadow-sm"
                      placeholder="Entrez le nom d'affichage"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaUsers className="me-2 text-primary" size={14} />
                      Utilisateur <span className="text-danger ms-1">*</span>
                    </Form.Label>
                    <Dropdown className="w-100">
                      <Dropdown.Toggle
                        variant="light"
                        id="dropdown-basic"
                        className="shadow-sm w-100 text-start d-flex justify-content-between align-items-center"
                      >
                        <span>{modalData.username || "Sélectionner un utilisateur"}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {usernames.length === 0 ? (
                          <Dropdown.Item disabled>Aucun utilisateur disponible</Dropdown.Item>
                        ) : (
                          usernames.map((user) => (
                            <Dropdown.Item
                              key={user.id}
                              onClick={() => handleUserSelect(user)}
                            >
                              {user.username}
                            </Dropdown.Item>
                          ))
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaGlobe className="me-2 text-primary" size={14} />
                      Pays <span className="text-danger ms-1">*</span>
                    </Form.Label>
                    <Dropdown className="w-100">
                      <Dropdown.Toggle
                        variant="light"
                        id="dropdown-basic"
                        className="shadow-sm w-100 text-start d-flex justify-content-between align-items-center"
                      >
                        <span>{modalData.country || "Sélectionner un pays"}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100 shadow-sm">
                        {predefinedCountries.map((country) => (
                          <Dropdown.Item
                            key={country.id}
                            onClick={() => setModalData({ ...modalData, country: country.name })}
                          >
                            {country.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaToggleOn className="me-2 text-primary" size={14} />
                      Statut
                    </Form.Label>
                    <Form.Select
                      value={modalData.active ? "1" : "0"}
                      onChange={(e) => setModalData({ ...modalData, active: e.target.value === "1" })}
                      className="shadow-sm"
                    >
                      <option value="1">Actif</option>
                      <option value="0">Inactif</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaArrowDown className="me-2 text-primary" size={14} />
                      Montant minimum
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={modalData.min_amount}
                      onChange={(e) => setModalData({ ...modalData, min_amount: e.target.value })}
                      className="shadow-sm"
                      placeholder="Entrez le montant minimum"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaArrowUp className="me-2 text-primary" size={14} />
                      Montant maximum
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={modalData.max_amount}
                      onChange={(e) => setModalData({ ...modalData, max_amount: e.target.value })}
                      className="shadow-sm"
                      placeholder="Entrez le montant maximum"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <FaLink className="me-2 text-primary" size={14} />
                  URL
                </Form.Label>
                <Form.Control
                  type="text"
                  value={modalData.url}
                  onChange={(e) => setModalData({ ...modalData, url: e.target.value })}
                  className="shadow-sm"
                  placeholder="Entrez l'URL"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 bg-light bg-opacity-50">
            <hr className="w-100 mt-0" />
            <Button variant="light" onClick={() => setShowModal(false)} className="fw-semibold shadow-sm" disabled={loading}>
              <span className="d-flex align-items-center">Annuler</span>
            </Button>
            <Button 
              variant="primary" 
              onClick={handleModalSubmit}
              className="fw-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {isEditing ? "Modification en cours..." : "Ajout en cours..."}
                </>
              ) : (
                <span className="d-flex align-items-center">
                  {isEditing ? (
                    <>
                      <FaEdit className="me-2" />
                      Modifier
                    </>
                  ) : (
                    <>
                      <FaPlusCircle className="me-2" />
                      Ajouter
                    </>
                  )}
                </span>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      
      {/* Modal de confirmation pour la suppression */}
      {showDeleteModal && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" className="delete-modal">
          <Modal.Header closeButton className="border-0 pb-0 bg-danger bg-opacity-10">
            <Modal.Title className="text-danger fw-bold d-flex align-items-center">
              <FaTrashAlt className="me-2" /> Supprimer une méthode de paiement
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            <p>Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 bg-light bg-opacity-50">
            <hr className="w-100 mt-0" />
            <Button variant="light" onClick={() => setShowDeleteModal(false)} className="fw-semibold shadow-sm">
              <span className="d-flex align-items-center">Annuler</span>
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              className="fw-semibold shadow-sm"
            >
              <span className="d-flex align-items-center">
                <FaTrashAlt className="me-2" />
                Supprimer
              </span>
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      

    </div>
  );
}