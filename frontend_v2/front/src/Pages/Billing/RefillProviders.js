import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Form, Modal, Alert } from "react-bootstrap";
import { CSVLink } from "react-csv";

export default function RefillProviders() {
  const [data, setData] = useState([]);
  const [providers, setProviders] = useState([]);
  const [modalData, setModalData] = useState({
    provider: '',
    credit: '',
    description: '',
    payment: '1',
    id: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [providersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/refillProviders/afficher");
      setData(response.data.providers);
    } catch (error) {
      setError("Erreur lors de la récupération des fournisseurs.");
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/refillProviders/");
      setProviders(response.data.providers);
    } catch (error) {
      setError("Erreur lors de la récupération des providers.");
    }
  };

  const handleAdd = () => {
    setModalData({
      provider: '',
      credit: '',
      description: '',
      payment: '1',
      id: null,
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (provider) => {
    setModalData(provider);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/refillProviders/modifier/${modalData.id}`, modalData);
      } else {
        await axios.post("http://localhost:5000/api/admin/refillProviders/ajouter", modalData);
      }
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la modification du fournisseur", error);
      setError("Erreur lors de l'ajout ou de la modification du fournisseur.");
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

  // Filter by search term
  const filteredProviders = data.filter((provider) =>
    provider.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  useEffect(() => {
    fetchData();
    fetchProviders();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="container mt-4">
      <h2>Liste des fournisseurs de recharge</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAdd}>Ajouter</Button>
        <Form.Control
          type="text"
          placeholder="Rechercher par provider..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Credit</th>
            <th>Description</th>
            <th>Payment</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProviders.map((e) => (
            <tr key={e.id}>
              <td>{e.provider_name}</td>
              <td>{parseFloat(e.credit).toFixed(4)}</td>
              <td>{e.description}</td>
              <td>{e.payment === 1 ? 'Yes' : 'No'}</td>
              <td>{new Date(e.date).toLocaleDateString()}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(e)}>Modifier</Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(e.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination & Export CSV */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Précédent
          </Button>{' '}
          <span>Page {currentPage} sur {totalPages}</span>{' '}
          <Button
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Suivant
          </Button>
        </div>

        <CSVLink
          data={filteredProviders.map(e => ({
            Provider: e.provider_name,
            Credit: parseFloat(e.credit).toFixed(4),
            Description: e.description,
            Payment: e.payment === 1 ? "Yes" : "No",
            Date: new Date(e.date).toLocaleDateString(),
          }))}
          filename={"refill_providers.csv"}
          className="btn btn-success"
        >
          Exporter CSV
        </CSVLink>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Modifier' : 'Ajouter'} un fournisseur</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Provider</Form.Label>
                <Form.Control
                  as="select"
                  value={modalData.provider}
                  onChange={(e) => setModalData({ ...modalData, provider: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un fournisseur</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.provider_name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Credit</Form.Label>
                <Form.Control
                  type="number"
                  value={modalData.credit}
                  onChange={(e) => setModalData({ ...modalData, credit: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Add payment</Form.Label>
                <Form.Control
                  as="select"
                  value={modalData.payment}
                  onChange={(e) => setModalData({ ...modalData, payment: e.target.value })}
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Fermer</Button>
            <Button variant="primary" onClick={handleModalSubmit}>
              {isEditing ? 'Modifier' : 'Ajouter'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
