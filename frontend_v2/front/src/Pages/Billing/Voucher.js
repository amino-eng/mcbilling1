import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Form, Modal, Alert } from "react-bootstrap";

export default function Voucher() {
  const [data, setData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [modalData, setModalData] = useState({
    credit: '',
    plan: '',
    language: 'English',
    prefix_rules: '',
    quantity: '',
    description: '',
    id: null,
    voucher: '',
    usedate: '',
    expirationdate: '',
    creationdate: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vouchersPerPage] = useState(10);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/voucher/afficher");
      setData(response.data.vouchers);
    } catch (error) {
      setError("Erreur lors de la récupération des vouchers.");
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users/plans");
      setPlans(response.data.plans);
    } catch (error) {
      setError("Erreur lors de la récupération des plans.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleAdd = () => {
    setModalData({
      credit: '',
      plan: '',
      language: 'en',
      prefix_rules: '',
      quantity: '',
      description: '',
      id: null,
      voucher: '',
      usedate: '',
      expirationdate: '',
      creationdate: '',
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (voucher) => {
    setModalData(voucher);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/voucher/modifier/${modalData.id}`, modalData);
      } else {
        await axios.post("http://localhost:5000/api/admin/voucher/ajouter", modalData);
      }
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la modification du voucher", error);
      setError("Erreur lors de l'ajout ou de la modification du voucher.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/voucher/supprimer/${id}`);
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression du voucher", error);
      setError("Erreur lors de la suppression du voucher.");
    }
  };

  const handleExport = () => {
    const csvData = [];
    const headers = ["Credit", "Voucher", "Language", "Description", "Use Date", "Expiration Date"];
    csvData.push(headers.join(","));

    const currentVouchers = data.slice(
      (currentPage - 1) * vouchersPerPage,
      currentPage * vouchersPerPage
    );

    currentVouchers.forEach(voucher => {
      const row = [
        voucher.credit,
        voucher.voucher,
        voucher.language,
        voucher.description || '',
        formatDate(voucher.usedate),
        formatDate(voucher.expirationdate),
      ];
      csvData.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvData.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vouchers.csv");
    document.body.appendChild(link);
    link.click();
  };

  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = data.slice(indexOfFirstVoucher, indexOfLastVoucher);
  const totalPages = Math.ceil(data.length / vouchersPerPage);

  useEffect(() => {
    fetchData();
    fetchPlans();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Liste des vouchers</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="primary" onClick={handleAdd}>Ajouter</Button>
      <Button variant="success" onClick={handleExport} className="ml-2">Exporter en CSV</Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Credit</th>
            <th>Voucher</th>
            <th>Description</th>
            <th>Use Date</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentVouchers.map((e) => (
            <tr key={e.id}>
              <td>{e.credit.toFixed(4)}</td>
              <td>{e.voucher}</td>
              <td>{e.tag || ''}</td>
              <td>{formatDate(e.usedate)}</td>
              <td>{formatDate(e.creationdate)}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(e)}>Modifier</Button>
                <Button variant="danger" onClick={() => handleDelete(e.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index}
            variant={currentPage === index + 1 ? "primary" : "secondary"}
            onClick={() => setCurrentPage(index + 1)}
            className="mx-1"
          >
            {index + 1}
          </Button>
        ))}
      </div>

      {/* Modal for Adding/Editing */}
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Modifier' : 'Ajouter'} un voucher</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
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
                <Form.Label>Plan</Form.Label>
                <Form.Control
                  as="select"
                  value={modalData.plan}
                  onChange={(e) => setModalData({ ...modalData, plan: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Control
                  type="text"
                  value={modalData.language}
                  onChange={(e) => setModalData({ ...modalData, language: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prefix Rules</Form.Label>
                <Form.Control
                  type="text"
                  value={modalData.prefix_rules}
                  onChange={(e) => setModalData({ ...modalData, prefix_rules: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={modalData.quantity}
                  onChange={(e) => setModalData({ ...modalData, quantity: e.target.value })}
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
                <Form.Label>Voucher</Form.Label>
                <Form.Control
                  type="text"
                  value="Will be generated automatically"
                  readOnly
                />
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