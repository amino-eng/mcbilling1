import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, InputGroup, FormControl } from "react-bootstrap";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";

const PrefixesTable = () => {
  const [prefixes, setPrefixes] = useState([]);
  const [filteredPrefixes, setFilteredPrefixes] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ prefix: "", destination: "" });
  const [prefixId, setPrefixId] = useState(null);

  const fetchPrefixes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/Prefixes/afficher/");
      setPrefixes(res.data.prefixes);
      setFilteredPrefixes(res.data.prefixes);
    } catch (err) {
      toast.error("Erreur lors du chargement des préfixes");
    }
  };

  useEffect(() => {
    fetchPrefixes();
  }, []);

  useEffect(() => {
    const filtered = prefixes.filter(
      (item) =>
        item.prefix.toLowerCase().includes(search.toLowerCase()) ||
        item.destination.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPrefixes(filtered);
  }, [search, prefixes]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModalToAdd = () => {
    setForm({ prefix: "", destination: "" });
    setPrefixId(null);
    setShowModal(true);
  };

  const openModalToEdit = (prefix) => {
    setForm({ prefix: prefix.prefix, destination: prefix.destination });
    setPrefixId(prefix.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.prefix || !form.destination) {
      toast.warning("Tous les champs sont requis !");
      return;
    }

    try {
      if (prefixId === null) {
        await axios.post("http://localhost:5000/api/admin/Prefixes/ajouter", form);
        toast.success("Préfixe ajouté !");
      } else {
        await axios.put(`http://localhost:5000/api/admin/Prefixes/modifier/${prefixId}`, form);
        toast.success("Préfixe modifié !");
      }

      setShowModal(false);
      fetchPrefixes();
      setForm({ prefix: "", destination: "" });
      setPrefixId(null);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce préfixe ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/Prefixes/supprimer/${id}`);
        toast.success("Préfixe supprimé !");
        fetchPrefixes();
      } catch (err) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const csvHeaders = [
    { label: "Préfixe", key: "prefix" },
    { label: "Destination", key: "destination" }
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Liste des Préfixes</h4>
        <div className="d-flex gap-2">
          <CSVLink
            data={filteredPrefixes}
            headers={csvHeaders}
            filename="prefixes.csv"
            className="btn btn-success"
          >
            Exporter CSV
          </CSVLink>
          <Button onClick={openModalToAdd}>+ Ajouter</Button>
        </div>
      </div>

      <InputGroup className="mb-3">
        <FormControl
          placeholder="Rechercher un préfixe ou une destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Préfixe</th>
            <th>Destination</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrefixes.map((item) => (
            <tr key={item.id}>
              <td>{item.prefix}</td>
              <td>{item.destination}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => openModalToEdit(item)}
                >
                  Modifier
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
          {filteredPrefixes.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center">Aucun préfixe trouvé</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal d'ajout / modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {prefixId === null ? "Ajouter un Préfixe" : "Modifier le Préfixe"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Préfixe</Form.Label>
              <Form.Control
                type="text"
                name="prefix"
                value={form.prefix}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Destination</Form.Label>
              <Form.Control
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            {prefixId === null ? "Ajouter" : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PrefixesTable;
