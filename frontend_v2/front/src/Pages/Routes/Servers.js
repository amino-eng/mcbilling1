"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  Button, Table, Form, Modal, Row, Col, InputGroup, Alert, Card, Badge, Spinner
} from "react-bootstrap"
import { CSVLink } from "react-csv"
import { 
  BiSearch, 
  BiEdit, 
  BiTrash,
  BiPlusCircle,
  BiDownload,
  BiCheckCircle,
  BiXCircle,
  BiHide,
  BiShow
} from "react-icons/bi"
import { FaServer } from "react-icons/fa"

const API_BASE = "http://localhost:5000/api/admin/Servers"
const ITEMS_PER_PAGE = 10;

// ------------------ ServerHeader Component ------------------
const ServerHeader = ({ onAddClick, servers, isExporting }) => {
  const csvData = [
    ["Name", "Host", "Public IP", "Username", "Port", "SIP Port", "Status", "Type", "Description"],
    ...servers.map((server) => [
      server.name,
      server.host,
      server.public_ip || '-',
      server.username,
      server.port || '-',
      server.sip_port || '-',
      server.status === 1 ? "Actif" : "Inactif",
      server.type,
      server.description || '-',
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
              <FaServer
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
            <FaServer className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Gestion des Serveurs</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos serveurs VoIP</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{servers.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaServer size={12} />
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
            filename="servers.csv"
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

// ------------------ StatusBadge Component ------------------
const StatusBadge = ({ status }) => {
  return (
    <Badge bg={status === 1 ? "success" : "danger"} className="d-flex align-items-center gap-1">
      {status === 1 ? (
        <>
          <BiCheckCircle size={14} />
          <span>Actif</span>
        </>
      ) : (
        <>
          <BiXCircle size={14} />
          <span>Inactif</span>
        </>
      )}
    </Badge>
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
        placeholder="Rechercher par nom..."
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
        className="d-flex align-items-center"
      >
        <BiEdit />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onDelete}
        className="d-flex align-items-center"
      >
        <BiTrash />
      </Button>
    </div>
  );
};

// ------------------ ServerTable Component ------------------
const ServerTable = ({ servers, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <Alert variant="info" className="text-center my-4">
        Aucun serveur trouvé
      </Alert>
    );
  }

  return (
    <Table hover className="align-middle">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Hôte</th>
          <th>Utilisateur</th>
          <th>Statut</th>
          <th>Type</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {servers.map((server) => (
          <tr key={server.id}>
            <td>{server.name}</td>
            <td>{server.host}</td>
            <td>{server.username}</td>
            <td><StatusBadge status={server.status} /></td>
            <td>
              <Badge bg="light" text="dark" className="text-capitalize">
                {server.type}
              </Badge>
            </td>
            <td className="text-end">
              <ActionButtons
                onEdit={() => onEdit(server)}
                onDelete={() => onDelete(server.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

// ------------------ AddServerModal Component ------------------
const AddServerModal = ({ show, onHide, onServerAdded, serverToEdit, setServerToEdit }) => {
  const [form, setForm] = useState({
    name: "",
    host: "",
    public_ip: "",
    username: "",
    password: "",
    port: "",
    sip_port: 5060,
    status: 1,
    type: "asterisk",
    description: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (serverToEdit) {
      setForm({ ...serverToEdit });
    } else {
      setForm({
        name: "",
        host: "",
        public_ip: "",
        username: "",
        password: "",
        port: "",
        sip_port: 5060,
        status: 1,
        type: "asterisk",
        description: ""
      });
    }
  }, [serverToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      host: form.host,
      public_ip: form.public_ip || null,
      username: form.username,
      password: form.password || null,
      port: form.port ? Number(form.port) : null,
      sip_port: form.sip_port ? Number(form.sip_port) : null,
      status: Number(form.status),
      type: form.type,
      description: form.description || null
    };

    if (!payload.name || !payload.host || !payload.username) {
      alert("Name, host et username sont requis");
      return;
    }

    try {
      if (serverToEdit) {
        await axios.put(`${API_BASE}/modifier/${serverToEdit.id}`, payload);
      } else {
        await axios.post(`${API_BASE}/ajouter`, payload);
      }
      onServerAdded();
      onHide();
    } catch (err) {
      console.error(err.response || err);
      alert(err.response?.data?.error || "Erreur réseau");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          {serverToEdit ? "Modifier Serveur" : "Ajouter Serveur"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Row>
          {[
            ["name", "Nom", "text"],
            ["host", "Host", "text"],
            ["public_ip", "Public IP", "text"],
            ["username", "Username", "text"],
          ].map(([name, label, type]) => (
            <Col md={6} key={name} className="mb-3">
              <Form.Label className="fw-semibold small text-muted">{label}</Form.Label>
              <Form.Control
                type={type}
                name={name}
                value={form[name] || ""}
                onChange={handleChange}
                required={name === "name" || name === "host" || name === "username"}
              />
            </Col>
          ))}

          <Col md={6} key="password" className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password || ""}
                onChange={handleChange}
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <BiHide /> : <BiShow />}
              </Button>
            </InputGroup>
          </Col>

          <Col md={6} key="port" className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Port</Form.Label>
            <Form.Control
              type="number"
              name="port"
              value={form.port || ""}
              onChange={handleChange}
            />
          </Col>

          <Col md={6} key="sip_port" className="mb-3">
            <Form.Label className="fw-semibold small text-muted">SIP Port</Form.Label>
            <Form.Control
              type="number"
              name="sip_port"
              value={form.sip_port || ""}
              onChange={handleChange}
            />
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Type</Form.Label>
            <Form.Select name="type" value={form.type} onChange={handleChange}>
              <option value="asterisk">Asterisk</option>
              <option value="magnus">MagnusBilling</option>
            </Form.Select>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Statut</Form.Label>
            <Form.Select name="status" value={form.status} onChange={handleChange}>
              <option value={1}>Actif</option>
              <option value={0}>Inactif</option>
            </Form.Select>
          </Col>

          <Col xs={12} className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description || ""}
              onChange={handleChange}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="light" onClick={onHide}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {serverToEdit ? "Enregistrer" : "Ajouter"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ------------------ Main Servers Component ------------------
export default function Servers() {
  const [servers, setServers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [serverToEdit, setServerToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchServers = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_BASE}/afficher`);
      setServers(data.servers || []);
    } catch (err) {
      console.error(err);
      setError("Échec du chargement des serveurs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (server) => {
    setServerToEdit(server);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await axios.delete(`${API_BASE}/supprimer/${id}`);
      setSuccessMessage("Serveur supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchServers();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredServers.length / ITEMS_PER_PAGE);
  const paginatedServers = filteredServers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="py-4">
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
          .btn-hover-effect:hover .icon-container {
            transform: scale(1.2);
          }
          .icon-container {
            transition: transform 0.2s;
          }
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} lg={11}>
          <Card style={{ border: 'none', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)' }}>
            <ServerHeader
              onAddClick={() => {
                setServerToEdit(null);
                setShowAddModal(true);
              }}
              servers={servers}
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

              <ServerTable
                servers={paginatedServers}
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
                          <span className="fw-semibold">{paginatedServers.length}</span> sur {filteredServers.length} Serveurs
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtrés de {servers.length} total
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

      <AddServerModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onServerAdded={fetchServers}
        serverToEdit={serverToEdit}
        setServerToEdit={setServerToEdit}
      />
    </div>
  );
};
