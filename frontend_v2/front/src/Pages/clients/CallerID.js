import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Alert, Spinner, Modal } from "react-bootstrap";

const CallerIdManager = () => {
  const [callerIds, setCallerIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    callerid: "",
    username: "",
    name: "",
    description: "",
    status: "",
  });
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCallerIds();
  }, []);

  const fetchCallerIds = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/CallerId/affiche");
      setCallerIds(response.data.callerid);
    } catch (error) {
      console.error("Erreur lors du chargement des Caller IDs", error);
      setMessage("Erreur lors du chargement des Caller IDs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/CallerId/affiche", formData);
      setMessage("Caller ID ajouté avec succès!");
      fetchCallerIds();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'ajout", error);
      setMessage("Erreur lors de l'ajout");
    }
  };

  const handleDeleteConfirmation = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/callerid/${deleteId}`);
      setMessage("Caller ID supprimé avec succès!");
      fetchCallerIds();
    } catch (error) {
      console.error("Erreur lors de la suppression", error);
      setMessage("Erreur lors de la suppression");
    } finally {
      setShowModal(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      callerid: "",
      username: "",
      name: "",
      description: "",
      status: "",
    });
    setShowForm(false);
  };

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    const headers = ["ID", "Caller ID", "Nom", "Description", "Statut"];
    const rows = callerIds.map((item) => [
      item.id,
      item.cid,
      item.name,
      item.description,
      item.activated ? "Actif" : "Inactif",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "caller_ids.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-4">
      {message && <Alert variant="info">{message}</Alert>}

      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Ajouter un Caller ID'}
        </Button>
        <Button variant="success" onClick={exportToCSV}>
          Exporter en CSV
        </Button>
      </div>

      {showForm && (
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group controlId="callerid">
            <Form.Label>Caller ID</Form.Label>
            <Form.Control type="text" name="callerid" value={formData.callerid} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="username">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="name">
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="status">
            <Form.Label>Statut</Form.Label>
            <Form.Control as="select" name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Sélectionner un statut</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </Form.Control>
          </Form.Group>
          <Button variant="success" type="submit" className="mt-2">
            Confirmer
          </Button>
        </Form>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Caller ID</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {callerIds.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.cid}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.activated ? "Actif" : "Inactif"}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDeleteConfirmation(item.id)}>
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce Caller ID?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CallerIdManager;