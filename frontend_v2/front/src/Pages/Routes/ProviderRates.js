import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Papa from "papaparse";

const ProviderRatesTable = () => {
  const [rates, setRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showPrefixModal, setShowPrefixModal] = useState(false);
  const [providers, setProviders] = useState([]);
  const [prefixes, setPrefixes] = useState([]);
  const [formData, setFormData] = useState({
    id_prefix: "",
    id_provider: "",
    buyrate: 0,
    buyrateinitblock: 0,
    buyrateincrement: 0,
    minimal_time_buy: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedProviderName, setSelectedProviderName] = useState("");
  const [selectedPrefixInfo, setSelectedPrefixInfo] = useState("");
  const [selectedProviderDescription, setSelectedProviderDescription] = useState("");
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/providerrates/afficher");
      setRates(res.data.rates);
    } catch {
      toast.error("Erreur de chargement des taux");
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/providers/afficher");
      setProviders(res.data.providers);
      setShowProviderModal(true);
    } catch {
      toast.error("Erreur chargement fournisseurs");
    }
  };

  const fetchPrefixes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/prefixes/afficher");
      setPrefixes(res.data.prefixes);
      setShowPrefixModal(true);
    } catch {
      toast.error("Erreur chargement destinations");
    }
  };

  const handleShowModal = (rate = null) => {
    if (rate) {
      setEditingId(rate.id);
      setFormData({
        id_prefix: rate.id_prefix,
        id_provider: rate.id_provider,
        buyrate: rate.buyrate,
        buyrateinitblock: rate.buyrateinitblock,
        buyrateincrement: rate.buyrateincrement,
        minimal_time_buy: rate.minimal_time_buy,
      });
      setSelectedProviderName(rate.provider);
      setSelectedPrefixInfo(`${rate.prefix} - ${rate.destination}`);
    } else {
      setEditingId(null);
      setFormData({
        id_prefix: "",
        id_provider: "",
        buyrate: 0,
        buyrateinitblock: 0,
        buyrateincrement: 0,
        minimal_time_buy: 0,
      });
      setSelectedProviderName("");
      setSelectedPrefixInfo("");
    }
    setValidated(false);
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const payload = {
      ...formData,
      buyrate: parseFloat(formData.buyrate) || 0,
      buyrateinitblock: parseInt(formData.buyrateinitblock) || 0,
      buyrateincrement: parseInt(formData.buyrateincrement) || 0,
      minimal_time_buy: parseInt(formData.minimal_time_buy) || 0,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/providerrates/modifier/${editingId}`, payload);
        toast.success("Modifié !");
      } else {
        await axios.post("http://localhost:5000/api/admin/providerrates/ajouter", payload);
        toast.success("Ajouté !");
      }
      setShowModal(false);
      fetchRates();
      setValidated(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce taux ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/providerrates/supprimer/${id}`);
        toast.success("Supprimé !");
        fetchRates();
      } catch {
        toast.error("Erreur de suppression");
      }
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(rates);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "provider_rates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: async (result) => {
          const data = result.data;
          try {
            await axios.post("http://localhost:5000/api/admin/providerrates/import", data);
            toast.success("CSV importé avec succès !");
            fetchRates();
          } catch {
            toast.error("Erreur lors de l'importation CSV");
          }
        },
      });
    }
  };

  const filtered = rates.filter((r) =>
    r.prefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h4>Provider rates</h4>
      <div className="d-flex justify-content-between my-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          <Button variant="success" onClick={handleExportCSV} className="me-2">Export CSV</Button>
          <Button variant="primary" onClick={() => handleShowModal()}>Ajouter</Button>
          <div className="d-inline-block ms-2">
            <label className="btn btn-info">
              Import CSV
              <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleImportCSV} />
            </label>
          </div>
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Préfixe</th>
            <th>Provider</th>
            <th>Destination</th>
            <th>Buyrate</th>
            <th>Init Block</th>
            <th>Increment</th>
            <th>Min Time Buy</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td>{r.prefix}</td>
              <td>{r.provider}</td>
              <td>{r.destination}</td>
              <td>{r.buyrate}</td>
              <td>{r.buyrateinitblock}</td>
              <td>{r.buyrateincrement}</td>
              <td>{r.minimal_time_buy}</td>
              <td>
                <Button size="sm" variant="warning" onClick={() => handleShowModal(r)}>Modifier</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center">Aucun taux trouvé</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal d'ajout / édition */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Modifier" : "Ajouter"} Taux</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Provider name</Form.Label>
              <div className="d-flex">
                <Form.Control
                  value={formData.id_provider}
                  onChange={(e) => setFormData({ ...formData, id_provider: e.target.value })}
                  required
                  isInvalid={!formData.id_provider}
                />
                <Button variant="outline-secondary" className="ms-2" onClick={fetchProviders}>🔍</Button>
              </div>
              <Form.Control.Feedback type="invalid">
                Veuillez choisir un fournisseur.
              </Form.Control.Feedback>
              {selectedProviderName && <small className="text-muted d-block">{selectedProviderName}</small>}
              {selectedProviderDescription && <small className="text-muted d-block">{selectedProviderDescription}</small>}
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>ID Préfixe</Form.Label>
              <div className="d-flex">
                <Form.Control
                  value={formData.id_prefix}
                  onChange={(e) => setFormData({ ...formData, id_prefix: e.target.value })}
                  required
                  isInvalid={!formData.id_prefix}
                />
                <Button variant="outline-secondary" className="ms-2" onClick={fetchPrefixes}>🔍</Button>
              </div>
              <Form.Control.Feedback type="invalid">
                Veuillez choisir un préfixe.
              </Form.Control.Feedback>
              {selectedPrefixInfo && <small className="text-muted">{selectedPrefixInfo}</small>}
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Buyrate</Form.Label>
              <Form.Control
                type="number"
                value={formData.buyrate}
                onChange={(e) => setFormData({ ...formData, buyrate: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Init Block</Form.Label>
              <Form.Control
                type="number"
                value={formData.buyrateinitblock}
                onChange={(e) => setFormData({ ...formData, buyrateinitblock: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Increment</Form.Label>
              <Form.Control
                type="number"
                value={formData.buyrateincrement}
                onChange={(e) => setFormData({ ...formData, buyrateincrement: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Min Time Buy</Form.Label>
              <Form.Control
                type="number"
                value={formData.minimal_time_buy}
                onChange={(e) => setFormData({ ...formData, minimal_time_buy: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button variant="primary" type="submit">
              {editingId ? "Modifier" : "Ajouter"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal fournisseurs */}
      <Modal show={showProviderModal} onHide={() => setShowProviderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Provider name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {providers.map((p) => (
              <li
                key={p.id}
                className="list-group-item list-group-item-action"
                onClick={() => {
                  setFormData({ ...formData, id_provider: p.id });
                  setSelectedProviderName(p.provider_name || p.name);
                  setSelectedProviderDescription(p.description || "Aucune description");
                  setShowProviderModal(false);
                }}
              >
                {p.provider_name || p.name}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>

      {/* Modal préfixes */}
      <Modal show={showPrefixModal} onHide={() => setShowPrefixModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Préfixe / Destination</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {prefixes.map((p) => (
              <li
                key={p.id}
                className="list-group-item list-group-item-action"
                onClick={() => {
                  setFormData({ ...formData, id_prefix: p.id });
                  setSelectedPrefixInfo(`${p.prefix} - ${p.destination}`);
                  setShowPrefixModal(false);
                }}
              >
                {p.prefix} – {p.destination}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProviderRatesTable;
