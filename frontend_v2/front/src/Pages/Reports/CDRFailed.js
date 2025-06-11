import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Table, Button, Modal, 
  Card, Badge, Spinner,
  Alert, Container, Row, Col 
} from "react-bootstrap";
import { 
  FaDownload, FaSearch, 
  FaTrashAlt, FaExclamationTriangle,
  FaCheckCircle, FaColumns
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";

const DEFAULT_NEW_CDR = {
  starttime: "",
  src: "",
  calledstation: "",
  callerid: "",
  terminatecauseid: "",
  username: "",
  trunkcode: "",
  hangupcause: "",
  server: ""
};

function CDRHeader({ onExportClick, cdrCount, isExporting }) {
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
              <FaExclamationTriangle className="text-white opacity-25" />
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaExclamationTriangle className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">CDR Échoués</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Examiner les enregistrements de détail des appels échoués</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
          <span className="me-2 fw-normal">
            Total: <span className="fw-bold">{cdrCount}</span>
          </span>
        </Badge>
        <Button
          variant="primary"
          onClick={onExportClick}
          className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          disabled={isExporting}
        >
          {isExporting ? <Spinner size="sm" /> : <FaDownload />}
          <span>Export</span>
        </Button>
      </div>
    </Card.Header>
  );
}

function CdrFailedTable() {
  const [cdrFailedData, setCdrFailedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const allColumns = [
    { label: "Date", key: "starttime" },
    { label: "Utilisateur SIP", key: "src" },
    { label: "Numéro", key: "calledstation" },
    { label: "Destination", key: "callerid" }, 
    { label: "Statut", key: "terminatecauseid"},
    { label: "Nom d'utilisateur", key: "username" },
    { label: "Trunk", key: "trunkcode" },
    { label: "Code SIP", key: "hangupcause" },
    { label: "Serveur", key: "server" },
  ];

  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.reduce((acc, col) => {
      acc[col.key] = true;
      return acc;
    }, {})
  );

  useEffect(() => {
    fetchCdrFailedData();
  }, []);

  const fetchCdrFailedData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/CdrFailed/affiche"
      );
      const data = response.data.cdr_failed;
      setCdrFailedData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Impossible de récupérer les données.");
      toast.error("Erreur lors de la récupération des données !");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvRows = [];
    const headers = allColumns
      .filter((col) => visibleColumns[col.key])
      .map((col) => col.label)
      .join(",");
    csvRows.push(headers);

    cdrFailedData.forEach((row) => {
      const values = allColumns
        .filter((col) => visibleColumns[col.key])
        .map((col) => `"${row[col.key] || ""}"`);
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cdr_echoues_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/CdrFailed/delete/${confirmDeleteId}`);
      toast.success("Enregistrement supprimé avec succès !");
      // Refresh the data from the server instead of just filtering
      await fetchCdrFailedData();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error(error.response?.data?.error || "Échec de la suppression de l'enregistrement.");
    } finally {
      setShowModal(false);
    }
  };

  const ColumnVisibilityDropdown = ({ visibleColumns, setVisibleColumns, allColumns }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleColumnVisibility = (key) => {
      setVisibleColumns((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    return (
      <div className="dropdown" style={{ display: "inline-block", marginLeft: "10px" }}>
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Columns
        </button>
        {isDropdownOpen && (
          <div
            className="dropdown-menu show"
            style={{ display: "block", padding: "10px" }}
          >
            {allColumns.map((col) => (
              <div key={col.key} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={visibleColumns[col.key]}
                  onChange={() => toggleColumnVisibility(col.key)}
                />
                <label className="form-check-label">{col.label}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredData = cdrFailedData.filter(cdr =>
    (cdr.src.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cdr.calledstation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-main" style={{ marginLeft: "80px" }}>
      <style>
        {`
          .floating-icon {
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          .pulse-effect {
            animation: pulse 2s infinite;
          }
          .btn-hover-effect:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .elegant-table th {
            background-color: #f8f9fa;
            position: sticky;
            top: 0;
          }
        `}
      </style>

      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
              <CDRHeader 
                onExportClick={exportToCSV}
                cdrCount={cdrFailedData.length}
                isExporting={false}
              />
              <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaExclamationTriangle className="me-2" />
                    {error}
                  </Alert>
                )}

                <Row className="mb-4">
                  <Col md={6} lg={4}>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaSearch className="text-muted" />
                      </span>
                      <input
                        type="text"
                        placeholder="Rechercher des CDR..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="ms-auto text-end">
                    <ColumnVisibilityDropdown
                      visibleColumns={visibleColumns}
                      setVisibleColumns={setVisibleColumns}
                      allColumns={allColumns}
                    />
                  </Col>
                </Row>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Chargement des données CDR...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="elegant-table">
                      <thead>
                        <tr>
                          {allColumns
                            .filter((col) => visibleColumns[col.key])
                            .map((col, index) => (
                              <th key={index} className="p-3">
                                {col.label}
                              </th>
                            ))}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((cdr, index) => (
                            <tr key={index} className="hover-effect">
                              {allColumns
                                .filter((col) => visibleColumns[col.key])
                                .map((col, idx) => (
                                  <td key={idx} className="p-2">
                                    {col.key === "starttime"
                                      ? format(new Date(cdr[col.key]), "dd/MM/yyyy HH:mm:ss")
                                      : cdr[col.key] || <span className="text-muted">—</span>}
                                  </td>
                                ))}
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => {
                                    setConfirmDeleteId(cdr.id);
                                    setShowModal(true);
                                  }}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={allColumns.length + 1} className="text-center py-5 text-muted">
                              <FaExclamationTriangle className="mb-2" />
                              <p>Aucun CDR échoué trouvé</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Confirmer la Suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Êtes-vous sûr de vouloir supprimer ce CDR échoué ?</p>
          <p className="text-muted small">Cette action ne peut pas être annulée.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Supprimer l'enregistrement
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default CdrFailedTable;