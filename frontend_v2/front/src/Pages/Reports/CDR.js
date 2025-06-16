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
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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



  // Fetch CDR data
  const fetchCDRData = async (start = '', end = '') => {
    try {
      let url = "http://localhost:5000/api/admin/CDR/affiche";
      const params = new URLSearchParams();
      
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      setCdrData(response.data.cdr || []);
    } catch (error) {
      setError("Erreur lors de la récupération des données CDR. Veuillez réessayer.");
      console.error("Error fetching CDR data:", error);
    }
  };

  // Handle date filter submission
  const handleDateFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchCDRData(startDate, endDate).finally(() => setLoading(false));
  };

  // Reset date filter
  const resetDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setLoading(true);
    fetchCDRData().finally(() => setLoading(false));
  };

  // Initial data fetch
  useEffect(() => {
    fetchCDRData();

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/users");
        const userMap = response.data.reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {});
        setUsers(userMap);
      } catch (error) {
        console.error("Error while fetching user data:", error);
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
        console.error("Error while fetching trunk data:", error);
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
        console.error("Error while fetching pkg_trunk data:", error);
      }
    };

    Promise.all([fetchCDRData(), fetchUsers(), fetchTrunks(), fetchPkgTrunks()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Pagination logic
  // Filter records based on search term
  const filteredRecords = cdrData.filter(cdr => {
    const matchesSearch = cdr.callerid && cdr.callerid.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const currentRecords = filteredRecords;



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

  // Toggle select all rows
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      const allSelected = {};
      currentRecords.forEach(cdr => {
        allSelected[cdr.id] = true;
      });
      setSelectedRows(allSelected);
    } else {
      setSelectedRows({});
    }
  };

  // Toggle single row selection
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Export to CSV
  const exportToCSV = () => {
    const selectedCount = Object.values(selectedRows).filter(Boolean).length;
    const recordsToExport = selectedCount > 0 
      ? currentRecords.filter(cdr => selectedRows[cdr.id])
      : currentRecords;

    if (recordsToExport.length === 0) {
      alert("Veuillez sélectionner au moins une ligne à exporter.");
      return;
    }

    const headers = Object.entries({
      Date: 'Date',
      utilisateurSip: 'Utilisateur SIP',
      idAppelant: 'ID Appelant',
      numero: 'Numéro',
      Destination: 'Destination',
      duree: 'Durée',
      realDuree: 'Durée Réelle',
      nomUtilisateur: 'Nom Utilisateur',
      trunk: 'Trunk',
      Type: 'Type',
      prixAchat: 'Prix Achat',
      prixVente: 'Prix Vente',
      idUnique: 'ID Unique',
      Plan: 'Plan',
      campagne: 'Campagne',
      serveur: 'Serveur'
    })
      .filter(([key]) => visibleColumns[key])
      .map(([_, value]) => value)
      .join(",") + "\n";

    const csvContent = recordsToExport
      .map(cdr => {
        return [
          visibleColumns.Date ? `"${new Date(cdr.starttime).toLocaleString('fr-FR')}"` : null,
          visibleColumns.utilisateurSip ? `"${cdr.src || ''}"` : null,
          visibleColumns.idAppelant ? `"${cdr.callerid || ''}"` : null,
          visibleColumns.numero ? `"${cdr.calledstation || ''}"` : null,
          visibleColumns.Destination ? `"${cdr.id_prefix || ''}"` : null,
          visibleColumns.duree ? `"${cdr.sessiontime} secondes"` : null,
          visibleColumns.realDuree ? `"${cdr.real_sessiontime} secondes"` : null,
          visibleColumns.nomUtilisateur ? `"${cdr.username || ''}"` : null,
          visibleColumns.trunk ? `"${cdr.trunkcode || ''}"` : null,
          visibleColumns.Type ? `"${cdr.type || ''}"` : null,
          visibleColumns.prixAchat ? `"${cdr.buycost || '0'} €"` : null,
          visibleColumns.prixVente ? `"${cdr.sessionbill || '0'} €"` : null,
          visibleColumns.idUnique ? `"${cdr.uniqueid || ''}"` : null,
          visibleColumns.Plan ? `"${cdr.id_plan || ''}"` : null,
          visibleColumns.campagne ? `"${cdr.id_campaign || 'vide'}"` : null,
          visibleColumns.serveur ? `"${cdr.server_name || ''}"` : null
        ].filter(Boolean).join(",");
      })
      .join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_cdr_${new Date().toISOString().slice(0,10)}.csv`);
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
                  CDR Report
                </h4>
                <div className="d-flex gap-2">
                  <Button 
                    variant="light" 
                    className="d-flex align-items-center"
                    onClick={exportToCSV}
                    title="Exporter les lignes sélectionnées"
                  >
                    <FaFileExport className="me-2" />
                    {Object.values(selectedRows).filter(Boolean).length > 0 
                      ? `Exporter (${Object.values(selectedRows).filter(Boolean).length} sélectionnés)` 
                      : 'Exporter tout'}
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

              <Form onSubmit={handleDateFilter} className="mb-3">
                <Row className="g-2">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Date de début</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Date de fin</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="form-control"
                        min={startDate}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <div className="d-flex gap-2">
                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Chargement...' : 'Filtrer'}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={resetDateFilter}
                        disabled={loading || (!startDate && !endDate)}
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <div className="d-flex mb-3 gap-2">
                <div className="position-relative flex-grow-1">
                  <Form.Control
                    type="text"
                    placeholder="Rechercher par numéro d'appelant..."
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
                          label={column === "campagne" ? "Campaign" : column === "serveur" ? "Server" : column}
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
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                            title="Sélectionner/Désélectionner tout"
                          />
                        </th>
                        {visibleColumns.Date && <th>Date</th>}
                        {visibleColumns.utilisateurSip && <th>SIP User</th>}
                        {visibleColumns.idAppelant && <th>Caller ID</th>}
                        {visibleColumns.numero && <th>Number</th>}
                        {visibleColumns.Destination && <th>Destination</th>}
                        {visibleColumns.duree && <th>Duration</th>}
                        {visibleColumns.realDuree && <th>Real Duration</th>}
                        {visibleColumns.nomUtilisateur && <th>Username</th>}
                        {visibleColumns.trunk && <th>Trunk</th>}
                        {visibleColumns.Type && <th>Type</th>}
                        {visibleColumns.prixAchat && <th>Buy Price</th>}
                        {visibleColumns.prixVente && <th>Sell Price</th>}
                        {visibleColumns.idUnique && <th>Unique ID</th>}
                        {visibleColumns.Plan && <th>Plan</th>}
                        {visibleColumns.campagne && <th>Campaign</th>}
                        {visibleColumns.serveur && <th>Server</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((cdr) => (
                        <tr key={cdr.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={!!selectedRows[cdr.id]}
                              onChange={() => toggleRowSelection(cdr.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          {visibleColumns.Date && <td>{new Date(cdr.starttime).toLocaleString('fr-FR')}</td>}
                          {visibleColumns.utilisateurSip && <td>{cdr.src}</td>}
                          {visibleColumns.idAppelant && <td>{cdr.callerid}</td>}
                          {visibleColumns.numero && <td>{cdr.calledstation}</td>}
                          {visibleColumns.Destination && <td>{cdr.id_prefix}</td>}
                          {visibleColumns.duree && <td>{cdr.sessiontime} seconds</td>}
                          {visibleColumns.realDuree && <td>{cdr.real_sessiontime} seconds</td>}
                          {visibleColumns.nomUtilisateur && <td>{cdr.username}</td>}
                          {visibleColumns.trunk && <td>{cdr.trunkcode}</td>}
                          {visibleColumns.Type && <td>{cdr.type}</td>}
                          {visibleColumns.prixAchat && <td>{cdr.buycost} €</td>}
                          {visibleColumns.prixVente && <td>{cdr.sessionbill} €</td>}
                          {visibleColumns.idUnique && <td>{cdr.uniqueid}</td>}
                          {visibleColumns.Plan && <td>{cdr.id_plan}</td>}
                          {visibleColumns.campagne && <td>{cdr.id_campaign || "empty"}</td>}
                          {visibleColumns.serveur && <td>{cdr.server_name}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="text-muted mt-3">
                Showing {filteredRecords.length} records
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CDRTable;