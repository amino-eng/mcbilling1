import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Form, Modal, Dropdown, Alert, Pagination } from "react-bootstrap";

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

export default function PaymentMethods() {
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
      } else {
        await axios.post("http://localhost:5000/api/admin/PayMeth/ajouter", modalData);
      }
      // Refresh data after submission
      await fetchData();
      setShowModal(false);
      setSubmitError("");
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

  // Handle deletion of a payment method
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/PayMeth/supprimer/${id}`);
      // Refresh data after deletion
      await fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression de la méthode de paiement", error);
    } finally {
      setLoading(false);
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
console.log(allData);

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

  return (
    <div className="container mt-4">
      <h2>Liste des méthodes de paiement</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAdd}>Ajouter</Button>
        
        <div className="d-flex align-items-center">
          <span className="me-2">Éléments par page:</span>
          <Form.Select 
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
      </div>

      {loading && allData.length === 0 ? (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Pays</th>
                <th>Méthode de paiement</th>
                <th style={{ width: '100px' }}>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map((e) => (
                  <tr key={e.id}>
                    <td>{e.username}</td>
                    <td>{e.country}</td>
                    <td>{e.payment_method}</td>
                    <td style={{ color: e.active ? 'green' : 'red' }}>
                      {e.active ? 'Active' : 'Inactive'}
                    </td>
                    <td>
                      <Button variant="warning" className="me-2" onClick={() => handleEdit(e)}>Modifier</Button>
                      <Button variant="danger" onClick={() => handleDelete(e.id)}>Supprimer</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Aucune méthode de paiement trouvée</td>
                </tr>
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {paginationItems}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
          
          <div className="mt-2 text-center text-muted">
            Affichage de {displayData.length} sur {allData.length} méthodes de paiement
          </div>
        </>
      )}

      {/* Modal for Adding/Editing */}
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Modifier' : 'Ajouter'} une méthode de paiement</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Payment methods:</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {modalData.payment_method || "Sélectionner une méthode de paiement"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
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
              <Form.Group className="mb-3">
                <Form.Label>Show name:</Form.Label>
                <Form.Control
                  type="text"
                  value={modalData.show_name}
                  onChange={(e) => setModalData({ ...modalData, show_name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {modalData.username || "Sélectionner un utilisateur"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {usernames.map((user) => (
                      <Dropdown.Item
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                      >
                        {user.username}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Pays</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {modalData.country || "Sélectionner un pays"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
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
              <Form.Group className="mb-3">
                <Form.Label>Actif</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="dropdown-active">
                    {modalData.active ? 'Active' : 'Inactive'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setModalData({ ...modalData, active: true })}>
                      Active
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setModalData({ ...modalData, active: false })}>
                      Inactive
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Min amount:</Form.Label>
                <Form.Control
                  type="number"
                  value={modalData.min_amount}
                  onChange={(e) => setModalData({ ...modalData, min_amount: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Max amount:</Form.Label>
                <Form.Control
                  type="number"
                  value={modalData.max_amount}
                  onChange={(e) => setModalData({ ...modalData, max_amount: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>URL:</Form.Label>
                <Form.Control
                  type="text"
                  value={modalData.url}
                  onChange={(e) => setModalData({ ...modalData, url: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Fermer</Button>
            <Button 
              variant="primary" 
              onClick={handleModalSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Chargement...
                </>
              ) : (
                isEditing ? 'Modifier' : 'Ajouter'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}