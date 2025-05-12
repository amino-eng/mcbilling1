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
  Pagination,
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
import { FaLayerGroup } from "react-icons/fa";

// Constants
const ITEMS_PER_PAGE = 10;

// ------------------ TrunkGroupHeader Component ------------------
const TrunkGroupHeader = ({ onAddClick, groups, isExporting }) => {
  const csvData = [
    ["Name", "Type", "Trunks Count", "Creation Date"],
    ...groups.map((group) => [
      group.name,
      group.description,
      group.trunks?.length || 0,
      new Date(group.created_at).toLocaleDateString(),
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
              <FaLayerGroup
                className="text-white opacity-25"
                style={{
                  fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="rounded-circle p-3 me-3 shadow">
            <FaLayerGroup className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Gestion des Trunk Groups</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos groupes de trunks</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{groups.length}</span>
            </span>
            <span
              className="text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaLayerGroup size={12} />
            </span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={onAddClick}
            className="d-flex align-items-center gap-2 fw-semibold"
          >
            <div>
              <BiPlusCircle />
            </div>
            <span>Ajouter</span>
          </Button>
          <CSVLink
            data={csvData}
            filename="trunk-groups.csv"
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold"
            disabled={isExporting}
          >
            <div>
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
      <InputGroup.Text className="bg-white border-end-0">
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
        onClick={onEdit}
        size="sm"
        className="p-1"
        title="Modifier"
      >
        <BiEdit />
      </Button>
      <Button
        variant="outline-danger"
        onClick={onDelete}
        size="sm"
        className="p-1"
        title="Supprimer"
      >
        <BiTrash />
      </Button>
    </div>
  );
};

// ------------------ TrunkGroupTable Component ------------------
const TrunkGroupTable = ({ groups, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Nombre de Trunks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.length > 0 ? (
            groups.map((group) => (
              <tr key={group.id}>
                <td className="fw-semibold">{group.name}</td>
                <td>
                  <span>{group.description || '-'}</span>
                </td>
                <td>{group.trunks?.length || 0}</td>
                <td>
                  <ActionButtons
                    onEdit={() => onEdit(group)}
                    onDelete={() => onDelete(group.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">
                Aucun trunk group trouvé
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

// ------------------ AddTrunkGroupModal Component ------------------
const AddTrunkGroupModal = ({ 
  show, 
  onHide, 
  onGroupAdded,
  groupToEdit,
  setGroupToEdit,
  trunks,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trunks: []
  });

  useEffect(() => {
    if (groupToEdit) {
      setFormData({
        name: groupToEdit.name,
        description: groupToEdit.description || "",
        trunks: groupToEdit.trunks?.map(tr => tr.id) || []
      });
    } else {
      setFormData({
        name: "",
        description: "",
        trunks: []
      });
    }
  }, [groupToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrunkSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      trunks: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (groupToEdit) {
        await axios.put(`http://localhost:5000/api/admin/TrunkGroup/modifier/${groupToEdit.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/admin/TrunkGroup/ajouter', formData);
      }
      onGroupAdded();
      onHide();
    } catch (err) {
      console.error("Error saving trunk group:", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {groupToEdit ? 'Modifier Trunk Group' : 'Ajouter Trunk Group'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nom du groupe</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Order">Order</option>
                  <option value="random">Random</option>
                  <option value="LCR">LCR</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Trunks</Form.Label>
            <Form.Select 
              multiple 
              value={formData.trunks} 
              onChange={handleTrunkSelection}
              className="form-select"
              size="5"
            >
              {trunks.map(trunk => (
                <option key={trunk.id} value={trunk.id}>
                  {trunk.name} ({trunk.provider_name})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {groupToEdit ? 'Enregistrement...' : 'Création...'}
                </>
              ) : (
                groupToEdit ? 'Enregistrer' : 'Créer'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// ------------------ Main TrunkGroups Component ------------------
const TrunkGroups = () => {
  const [trunkGroups, setTrunkGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [trunks, setTrunks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);

  useEffect(() => {
    fetchData();
    fetchTrunks();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGroups(trunkGroups);
    } else {
      const filtered = trunkGroups.filter(group => 
        (group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredGroups(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, trunkGroups]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/TrunkGroup/afficher');
      setTrunkGroups(res.data.trunk_groups);
      setFilteredGroups(res.data.trunk_groups);
      setError("");
    } catch (err) {
      console.error("Error fetching trunk groups:", err);
      setError("Failed to fetch trunk groups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrunks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/Trunks/afficher');
      setTrunks(res.data.trunks || res.data);
    } catch (err) {
      console.error("Error fetching trunks:", err);
    }
  };

  const handleEdit = (group) => {
    setGroupToEdit(group);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trunk group?')) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/api/admin/TrunkGroup/supprimer/${id}`);
        setSuccessMessage("Trunk group deleted successfully");
        fetchData();
      } catch (err) {
        console.error("Error deleting trunk group:", err);
        setError("Failed to delete trunk group. Please try again.");
        setIsLoading(false);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pageCount = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);

  return (
    <div className="container-fluid py-3">
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
            <TrunkGroupHeader
              onAddClick={() => {
                setGroupToEdit(null);
                setShowAddModal(true);
              }}
              groups={trunkGroups}
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

              <TrunkGroupTable
                groups={paginatedGroups}
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
                          <span className="fw-semibold">{paginatedGroups.length}</span> sur {filteredGroups.length} Trunk Groups
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtrés de {trunkGroups.length} total
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <Pagination>
                    <Pagination.Prev 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    />
                    {Array.from({ length: pageCount }, (_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      disabled={currentPage === pageCount}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddTrunkGroupModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onGroupAdded={fetchData}
        groupToEdit={groupToEdit}
        setGroupToEdit={setGroupToEdit}
        trunks={trunks}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TrunkGroups;
