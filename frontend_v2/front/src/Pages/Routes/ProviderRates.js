import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Form,
  Modal,
  Row,
  Col,
  InputGroup,
  Alert,
  Card,
  Badge,
  Spinner,
} from "react-bootstrap";
import { CSVLink } from "react-csv";
import { 
  BiSearch, 
  BiEdit, 
  BiTrash,
  BiPlusCircle,
  BiDownload,
  BiCheckCircle,
  BiXCircle
} from "react-icons/bi";
import { FaMoneyBillWave } from "react-icons/fa";

// Constants
const ITEMS_PER_PAGE = 10;

// ------------------ ProviderRatesHeader Component ------------------
const ProviderRatesHeader = ({ onAddClick, rates, isExporting }) => {
  const csvData = [
    ["Prefix", "Destination", "Provider", "Buy Rate", "Init Block", "Increment", "Min Time"],
    ...rates.map((rate) => [
      rate.prefix,
      rate.destination,
      rate.provider,
      rate.buyrate,
      rate.buyrateinitblock,
      rate.buyrateincrement,
      rate.minimal_time_buy,
    ]),
  ];

  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
          {Array(5).fill().map((_, i) => (
            <div
              key={i}
              className="floating-icon position-absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <FaMoneyBillWave
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
            <h2 className="fw-bold mb-0 text-white">Tarifs Fournisseurs</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos tarifs d'achat</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{rates.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaMoneyBillWave size={12} />
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
              <BiPlusCircle />
            </div>
            <span>Ajouter</span>
          </Button>
          <CSVLink
            data={csvData}
            filename="provider_rates.csv"
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <BiDownload />}
            </div>
            <span>{isExporting ? "Exportation..." : "Exporter"}</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  );
};

// ------------------ SearchBar Component ------------------
const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <InputGroup className="search-bar shadow-sm">
      <InputGroup.Text className="bg-white">
        <BiSearch />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={onSearchChange}
        className="border-start-0"
      />
    </InputGroup>
  );
};

// ------------------ ActionButtons Component ------------------
const ActionButtons = ({ onEdit, onDelete }) => {
  return (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onEdit}
        className="d-flex align-items-center justify-content-center"
        style={{ width: '32px', height: '32px' }}
      >
        <BiEdit />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onDelete}
        className="d-flex align-items-center justify-content-center"
        style={{ width: '32px', height: '32px' }}
      >
        <BiTrash />
      </Button>
    </div>
  );
};

// ------------------ ProviderRatesTable Component ------------------
const ProviderRatesTable = ({ rates, onEdit, onDelete, isLoading }) => {
  return (
    <div className="table-responsive">
      <Table striped hover className="mb-0">
        <thead className="table-light">
          <tr>
            <th>Préfixe</th>
            <th>Destination</th>
            <th>Fournisseur</th>
            <th>Tarif</th>
            <th>Init Block</th>
            <th>Increment</th>
            <th>Min Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="8" className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : rates.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-4 text-muted">
                Aucun tarif trouvé
              </td>
            </tr>
          ) : (
            rates.map((rate) => (
              <tr key={`${rate.id_prefix}-${rate.id_provider}`}>
                <td>{rate.prefix}</td>
                <td>{rate.destination}</td>
                <td>{rate.provider}</td>
                <td>{rate.buyrate}</td>
                <td>{rate.buyrateinitblock}</td>
                <td>{rate.buyrateincrement}</td>
                <td>{rate.minimal_time_buy}</td>
                <td>
                  <ActionButtons
                    onEdit={() => onEdit(rate)}
                    onDelete={() => onDelete(rate.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

// ------------------ AddProviderRateModal Component ------------------
const AddProviderRateModal = ({
  show,
  onHide,
  onRateAdded,
  rateToEdit,
  setRateToEdit,
  providers,
  prefixes,
}) => {
  const [formData, setFormData] = useState({
    id_prefix: "",
    id_provider: "",
    buyrate: 0,
    buyrateinitblock: 0,
    buyrateincrement: 0,
    minimal_time_buy: 0,
  });

  const [selectedProviderName, setSelectedProviderName] = useState("");
  const [selectedPrefixInfo, setSelectedPrefixInfo] = useState("");
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showPrefixModal, setShowPrefixModal] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (rateToEdit) {
      setFormData({
        id_prefix: rateToEdit.id_prefix,
        id_provider: rateToEdit.id_provider,
        buyrate: rateToEdit.buyrate,
        buyrateinitblock: rateToEdit.buyrateinitblock,
        buyrateincrement: rateToEdit.buyrateincrement,
        minimal_time_buy: rateToEdit.minimal_time_buy,
      });
      setSelectedProviderName(rateToEdit.provider);
      setSelectedPrefixInfo(`${rateToEdit.prefix} - ${rateToEdit.destination}`);
    } else {
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
  }, [rateToEdit, show]);

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
      if (rateToEdit) {
        await axios.put(
          `http://localhost:5000/api/admin/providerrates/modifier/${rateToEdit.id}`,
          payload
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/admin/providerrates/ajouter",
          payload
        );
      }
      onHide();
      onRateAdded();
    } catch (error) {
      console.error("Error saving rate:", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {rateToEdit ? "Modifier Tarif" : "Ajouter Nouveau Tarif"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fournisseur</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    value={selectedProviderName}
                    readOnly
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => setShowProviderModal(true)}
                  >
                    🔍
                  </Button>
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Préfixe/Destination</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    value={selectedPrefixInfo}
                    readOnly
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => setShowPrefixModal(true)}
                  >
                    🔍
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tarif</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={formData.buyrate}
                  onChange={(e) =>
                    setFormData({ ...formData, buyrate: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Init Block</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.buyrateinitblock}
                  onChange={(e) =>
                    setFormData({ ...formData, buyrateinitblock: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Increment</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.buyrateincrement}
                  onChange={(e) =>
                    setFormData({ ...formData, buyrateincrement: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Min Time</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.minimal_time_buy}
                  onChange={(e) =>
                    setFormData({ ...formData, minimal_time_buy: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {rateToEdit ? "Modifier" : "Ajouter"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>

      {/* Provider Selection Modal */}
      <Modal
        show={showProviderModal}
        onHide={() => setShowProviderModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Sélectionner Fournisseur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {providers.map((provider) => (
              <li
                key={provider.id}
                className="list-group-item list-group-item-action"
                onClick={() => {
                  setFormData({ ...formData, id_provider: provider.id });
                  setSelectedProviderName(provider.provider_name || provider.name);
                  setShowProviderModal(false);
                }}
              >
                {provider.provider_name || provider.name}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>

      {/* Prefix Selection Modal */}
      <Modal show={showPrefixModal} onHide={() => setShowPrefixModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sélectionner Préfixe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {prefixes.map((prefix) => (
              <li
                key={prefix.id}
                className="list-group-item list-group-item-action"
                onClick={() => {
                  setFormData({ ...formData, id_prefix: prefix.id });
                  setSelectedPrefixInfo(`${prefix.prefix} - ${prefix.destination}`);
                  setShowPrefixModal(false);
                }}
              >
                {prefix.prefix} - {prefix.destination}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
    </Modal>
  );
};

// ------------------ Main ProviderRates Component ------------------
const ProviderRates = () => {
  const [rates, setRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [rateToEdit, setRateToEdit] = useState(null);
  const [providers, setProviders] = useState([]);
  const [prefixes, setPrefixes] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRates();
    fetchProviders();
    fetchPrefixes();
  }, []);

  useEffect(() => {
    const filtered = rates.filter(
      (rate) =>
        rate.prefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRates(filtered);
    setCurrentPage(1);
  }, [searchTerm, rates]);

  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/providerrates/afficher"
      );
      setRates(res.data.rates);
      setError("");
    } catch (err) {
      setError("Erreur de chargement des tarifs");
      console.error("Error fetching rates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/providers/afficher"
      );
      setProviders(res.data.providers);
    } catch (err) {
      console.error("Error fetching providers:", err);
    }
  };

  const fetchPrefixes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/prefixes/afficher"
      );
      setPrefixes(res.data.prefixes);
    } catch (err) {
      console.error("Error fetching prefixes:", err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (rate) => {
    setRateToEdit(rate);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce tarif ?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/providerrates/supprimer/${id}`
        );
        setSuccessMessage("Tarif supprimé avec succès");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchRates();
      } catch (err) {
        setError("Erreur lors de la suppression");
        console.error("Error deleting rate:", err);
      }
    }
  };

  const pageCount = Math.ceil(filteredRates.length / ITEMS_PER_PAGE);
  const paginatedRates = filteredRates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container-fluid py-4">
      <style>
        {`
          .pulse-effect {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
            100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
          }
          .floating-icon {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .search-bar {
            max-width: 300px;
            transition: all 0.3s;
          }
          .search-bar:focus-within {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          }
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} lg={11}>
          <Card style={{ border: 'none', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)' }}>
            <ProviderRatesHeader
              onAddClick={() => {
                setRateToEdit(null);
                setShowAddModal(true);
              }}
              rates={rates}
              isExporting={isExporting}
            />

            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                  <BiXCircle className="me-2" />
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                  <BiCheckCircle className="me-2" />
                  {successMessage}
                </Alert>
              )}

              <Row className="mb-4">
                <Col md={6} lg={4}>
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />
                </Col>
              </Row>

              <ProviderRatesTable
                rates={paginatedRates}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
              />

              {pageCount > 0 && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!isLoading && (
                      <>
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{paginatedRates.length}</span> sur {filteredRates.length} Tarifs
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtrés de {rates.length} total
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === pageCount}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddProviderRateModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onRateAdded={fetchRates}
        rateToEdit={rateToEdit}
        setRateToEdit={setRateToEdit}
        providers={providers}
        prefixes={prefixes}
      />
    </div>
  );
};

export default ProviderRates;
