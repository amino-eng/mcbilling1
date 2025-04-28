import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";

const PlansTable = () => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    name: "",
    techprefix: ""  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/Plans/afficher");
      setPlans(res.data.plans);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  const handleShowModal = (plan = null) => {
    if (plan) {
      setForm(plan);
      setEditingPlan(plan.id);
    } else {
      setForm({ name: "", techprefix: "" });
      setEditingPlan(null);
    }
    setShowModal(true);
  };
  const exportToCSV = () => {
  const headers = ["Nom", "Tech Prefix", "Date de création"];
  const rows = plans.map((plan) => [
    `"${plan.name}"`,
    `"${plan.techprefix}"`,
    `"${new Date(plan.creationdate).toLocaleDateString()}"`
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map((row) => row.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "plans_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  
  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Le champ 'Name' est requis.");
      return;
    }
  
    try {
      if (editingPlan) {
        await axios.put(`http://localhost:5000/api/admin/Plans/modifier/${editingPlan}`, form);
      } else {
        await axios.post("http://localhost:5000/api/admin/Plans/ajouter", form);
      }
      setShowModal(false);
      fetchPlans();
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce plan ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/Plans/supprimer/${id}`);
      fetchPlans();
    } catch (error) {
      console.error("Erreur de suppression:", error);
    }
  };

  const filteredPlans = plans.filter((plan) =>
    (plan?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          placeholder="Recherche par nom"
          className="form-control w-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
        <Button className="me-2" onClick={() => handleShowModal()}>
  Ajouter un Plan
</Button>
<Button variant="success" onClick={exportToCSV}>
  Exporter en CSV
</Button>

          
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Tech Prefix</th>
            <th>Date de création</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlans.map((plan) => (
            <tr key={plan.id}>
              <td>{plan.name}</td>
              <td>{plan.techprefix}</td>
              <td>{new Date(plan.creationdate).toLocaleDateString()}</td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleShowModal(plan)}
                >
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(plan.id)}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingPlan ? "Modifier" : "Ajouter"} un Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form>
  <Form.Group className="mb-3">
  <Form.Control
  type="text"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  isInvalid={!form.name.trim()}
/>
<Form.Control.Feedback type="invalid">
  Le nom est requis.
</Form.Control.Feedback>

    <Form.Label>
      Use on signup <span title="Allow plan selection during signup" style={{ cursor: "help" }}></span>
    </Form.Label>
    <Form.Select
      value={form.useOnSignup}
      onChange={(e) => setForm({ ...form, useOnSignup: e.target.value })}
    >
      <option value="No">No</option>
      <option value="Yes">Yes</option>
    </Form.Select>
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>
      Notices with audio <span title="Enable audio alerts" style={{ cursor: "help" }}></span>
    </Form.Label>
    <Form.Select
      value={form.noticesWithAudio}
      onChange={(e) => setForm({ ...form, noticesWithAudio: e.target.value })}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </Form.Select>
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>
      Tech prefix <span title="Technical prefix for this plan" style={{ cursor: "help" }}></span>
    </Form.Label>
    <Form.Control
      type="text"
      value={form.techprefix}
      onChange={(e) => setForm({ ...form, techprefix: e.target.value })}
    />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>
      Select one or more services <span title="Assign services to this plan" style={{ cursor: "help" }}></span>
    </Form.Label>
    <Form.Select
      multiple
      value={form.services}
      onChange={(e) => {
        const options = Array.from(e.target.selectedOptions, (option) => option.value);
        setForm({ ...form, services: options });
      }}
    >
      <option value="voice">Voice</option>
      <option value="sms">SMS</option>
      <option value="data">Data</option>
    </Form.Select>
  </Form.Group>
</Form>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingPlan ? "Modifier" : "Ajouter"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PlansTable;
