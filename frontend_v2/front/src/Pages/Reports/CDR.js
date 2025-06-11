import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Table, Button, Spinner, Dropdown, Form, Pagination, 
  Card, Container, Row, Col, Badge, Alert
} from "react-bootstrap";
import {
  FaDownload,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaFileExport
} from "react-icons/fa";

const CDRTable = () => {
  const [cdrData, setCdrData] = useState([]);
  const [users, setUsers] = useState({});
  const [trunks, setTrunks] = useState({});
  const [pkgTrunks, setPkgTrunks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState({
    Date: true,
    utilisateurSip: true,
    idAppelant: true,
    numero: true,
    Destination: true,
    duree: true,
    realDuree: false,
    nomUtilisateur: true,
    trunk: true,
    Type: true,
    prixAchat: true,
    prixVente: true,
    idUnique: false,
    Plan: false,
    campagne: false,
    serveur: false,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // Fetch CDR data
  useEffect(() => {
    const fetchCDRData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/CDR/affiche");
        setCdrData(response.data.cdr || []);
      } catch (error) {
        setError("Erreur lors de la récupération des données CDR. Veuillez réessayer.");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/users");
        const userMap = response.data.reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {});
        setUsers(userMap);
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      }
    };

    const fetchTrunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/trunks");
        const trunkMap = response.data.reduce((acc, trunk) => {
          acc[trunk.id] = trunk.name;
          return acc;
        }, {});
        setTrunks(trunkMap);
      } catch (error) {
        console.error("Erreur lors de la récupération des données de trunk:", error);
      }
    };

    const fetchPkgTrunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/pkg_trunks");
        const pkgTrunkMap = response.data.reduce((acc, pkgTrunk) => {
          acc[pkgTrunk.id] = pkgTrunk.trunkcode;
          return acc;
        }, {});
        setPkgTrunks(pkgTrunkMap);
      } catch (error) {
        console.error("Erreur lors de la récupération des données pkg_trunk:", error);
      }
    };

    Promise.all([fetchCDRData(), fetchUsers(), fetchTrunks(), fetchPkgTrunks()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // Filter records based on search term
  const filteredRecords = cdrData.filter(cdr =>
    cdr.callerid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Export to CSV
  const exportToCSV = () => {
    const headers = Object.keys(visibleColumns)
      .filter(key => visibleColumns[key])
      .join(",") + "\n";

    const csvContent = currentRecords
      .map(cdr => {
        return [
          visibleColumns.Date ? new Date(cdr.starttime).toLocaleString() : null,
          visibleColumns.utilisateurSip ? cdr.src : null,
          visibleColumns.idAppelant ? cdr.callerid : null,
          visibleColumns.numero ? cdr.calledstation : null,
          visibleColumns.Destination ? cdr.id_prefix : null,
          visibleColumns.duree ? cdr.sessiontime + " secondes" : null,
          visibleColumns.realDuree ? cdr.real_sessiontime + " secondes" : null,
          visibleColumns.nomUtilisateur ? cdr.username : null,
          visibleColumns.trunk ? cdr.trunkcode : null,
          visibleColumns.Type ? cdr.type : null,
          visibleColumns.prixAchat ? cdr.buycost + " €" : null,
          visibleColumns.prixVente ? cdr.sessionbill + " €" : null,
          visibleColumns.idUnique ? cdr.uniqueid : null,
          visibleColumns.Plan ? cdr.id_plan : null,
          visibleColumns.campagne ? cdr.id_campaign || "vide" : null,
          visibleColumns.serveur ? cdr.server_name : null
        ].filter(Boolean).join(",");
      })
      .join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "rapport_cdr.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={12}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <FaFilter className="me-2" />
                  Rapport CDR
                </h4>
                <div className="d-flex gap-2">
                  <Button 
                    variant="light" 
                    className="d-flex align-items-center"
                    onClick={exportToCSV}
                  >
                    <FaFileExport className="me-2" />
                    Exporter en CSV
                  </Button>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body>
              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <FaTimesCircle className="me-2" />
                  {error}
                </Alert>
              )}

              <div className="d-flex mb-3 gap-2">
                <div className="position-relative flex-grow-1">
                  <Form.Control
                    type="text"
                    placeholder="Search by Caller ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-4"
                  />
                  <FaSearch 
                    className="position-absolute text-muted"
                    style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
                
                <Dropdown ref={dropdownRef}>
                  <Dropdown.Toggle variant="secondary" className="d-flex align-items-center">
                    <FaEye className="me-2" />
                    Columns
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="p-2">
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {Object.keys(visibleColumns).map((column) => (
                        <Form.Check
                          key={column}
                          type="checkbox"
                          label={column}
                          checked={visibleColumns[column]}
                          onChange={() => toggleColumnVisibility(column)}
                          className="px-3 py-1"
                        />
                      ))}
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading CDR data...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        {visibleColumns.Date && <th>Date</th>}
                        {visibleColumns.utilisateurSip && <th>Utilisateur Sip</th>}
                        {visibleColumns.idAppelant && <th>ID Appelant</th>}
                        {visibleColumns.numero && <th>Numéro</th>}
                        {visibleColumns.Destination && <th>Destination</th>}
                        {visibleColumns.duree && <th>Durée</th>}
                        {visibleColumns.realDuree && <th>Durée Réelle</th>}
                        {visibleColumns.nomUtilisateur && <th>Nom d'utilisateur</th>}
                        {visibleColumns.trunk && <th>trunk</th>}
                        {visibleColumns.Type && <th>Type</th>}
                        {visibleColumns.prixAchat && <th>Prix d'achat</th>}
                        {visibleColumns.prixVente && <th>Prix de vente</th>}
                        {visibleColumns.idUnique && <th>ID Unique</th>}
                        {visibleColumns.Plan && <th>Plan</th>}
                        {visibleColumns.campagne && <th>Campagne</th>}
                        {visibleColumns.serveur && <th>Serveur</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((cdr) => (
                        <tr key={cdr.id}>
                          {visibleColumns.Date && <td>{new Date(cdr.starttime).toLocaleString()}</td>}
                          {visibleColumns.utilisateurSip && <td>{cdr.src}</td>}
                          {visibleColumns.idAppelant && <td>{cdr.callerid}</td>}
                          {visibleColumns.numero && <td>{cdr.calledstation}</td>}
                          {visibleColumns.Destination && <td>{cdr.id_prefix}</td>}
                          {visibleColumns.duree && <td>{cdr.sessiontime} secondes</td>}
                          {visibleColumns.realDuree && <td>{cdr.real_sessiontime} secondes</td>}
                          {visibleColumns.nomUtilisateur && <td>{cdr.username}</td>}
                          {visibleColumns.trunk && <td>{cdr.trunkcode}</td>}
                          {visibleColumns.Type && <td>{cdr.type}</td>}
                          {visibleColumns.prixAchat && <td>{cdr.buycost} €</td>}
                          {visibleColumns.prixVente && <td>{cdr.sessionbill} €</td>}
                          {visibleColumns.idUnique && <td>{cdr.uniqueid}</td>}
                          {visibleColumns.Plan && <td>{cdr.id_plan}</td>}
                          {visibleColumns.campagne && <td>{cdr.id_campaign || "vide"}</td>}
                          {visibleColumns.serveur && <td>{cdr.server_name}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Affichage de {indexOfFirstRecord + 1} à {Math.min(indexOfLastRecord, filteredRecords.length)} sur {filteredRecords.length} enregistrements
                </div>
                <Pagination>
                  <Pagination.Prev
                    onClick={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: Math.ceil(filteredRecords.length / recordsPerPage) }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() =>
                      setCurrentPage((prev) =>
                        prev < Math.ceil(filteredRecords.length / recordsPerPage) ? prev + 1 : prev
                      )}
                    disabled={currentPage === Math.ceil(filteredRecords.length / recordsPerPage)}
                  />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CDRTable;