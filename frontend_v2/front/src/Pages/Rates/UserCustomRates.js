import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputGroup, Spinner, Toast } from "react-bootstrap";
import axios from "axios";

const UserRateTable = () => {
  const [userRates, setUserRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id_user: "", id_prefix: "", rate: "" });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", bg: "success" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/Userrate/afficher");

      setUserRates(res.data.userRates);
    } catch (err) {
      showToast("Erreur lors du chargement", "danger");
    }
    setLoading(false);
  };

  const showToast = (message, bg = "success") => {
    setToast({ show: true, message, bg });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleSubmit = async () => {
    if (!formData.id_user || !formData.id_prefix || formData.rate === "") {
      showToast("Veuillez remplir tous les champs", "warning");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/admin/UserRate/modifier/${editingId}`, formData);
        showToast("Tarif utilisateur modifié avec succès");
      } else {
        await axios.post("/api/admin/UserRate/ajouter", formData);
        showToast("Tarif utilisateur ajouté avec succès");
      }
      fetchData();
      handleClose();
    } catch (err) {
      showToast("Erreur lors de l’enregistrement", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce tarif ?")) return;
    try {
      await axios.delete(`/api/admin/UserRate/supprimer/${id}`);
      showToast("Tarif supprimé");
      fetchData();
    } catch (err) {
      showToast("Erreur lors de la suppression", "danger");
    }
  };

  const handleShow = (data = null) => {
    if (data) {
      setFormData({ id_user: data.id_user, id_prefix: data.id_prefix, rate: data.rate });
      setEditingId(data.id);
    } else {
      setFormData({ id_user: "", id_prefix: "", rate: "" });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({ id_user: "", id_prefix: "", rate: "" });
    setEditingId(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mt-4">
      <h4>Tarifs Utilisateurs</h4>
      <Button variant="primary" className="mb-3" onClick={() => handleShow()}>
        + Ajouter
      </Button>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Préfixe</th>
              <th>Destination</th>
              <th>Tarif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userRates.length > 0 ? userRates.map((rate) => (
              <tr key={rate.id}>
                <td>{rate.id}</td>
                <td>{rate.username}</td>
                <td>{rate.prefix}</td>
                <td>{rate.destination}</td>
                <td>{rate.rate}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleShow(rate)}>Modifier</Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(rate.id)}>Supprimer</Button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="text-center">Aucun tarif trouvé</td></tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Modifier" : "Ajouter"} Tarif</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>ID Utilisateur</Form.Label>
              <Form.Control
                type="number"
                value={formData.id_user}
                onChange={(e) => setFormData({ ...formData, id_user: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>ID Préfixe</Form.Label>
              <Form.Control
                type="number"
                value={formData.id_prefix}
                onChange={(e) => setFormData({ ...formData, id_prefix: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Tarif</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingId ? "Modifier" : "Ajouter"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <Toast
        onClose={() => setToast({ ...toast, show: false })}
        show={toast.show}
        delay={3000}
        autohide
        bg={toast.bg}
        className="position-fixed bottom-0 end-0 m-3"
      >
        <Toast.Body className="text-white">{toast.message}</Toast.Body>
      </Toast>
    </div>
  );
};

export default UserRateTable;
