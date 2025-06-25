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
  FaFileExport,
  FaSortAmountDown,
  FaSortAmountDownAlt
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  
  // Tri
  const [sortConfig, setSortConfig] = useState({
    key: 'starttime',
    direction: 'desc' // 'asc' ou 'desc'
  });



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
        const response = await axios.get("http://localhost:5000/api/admin/users/affiche");
        const usersData = response.data.users || [];
        const userMap = usersData.reduce((acc, user) => {
          acc[user.id] = user.username || '';
          return acc;
        }, {});
        setUsers(userMap);
      } catch (error) {
        console.error("Error while fetching user data:", error);
        // Set empty users object to prevent undefined errors
        setUsers({});
      }
    };

    const fetchTrunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/Trunks/afficher");
        const trunksData = response.data?.trunks || [];
        const trunkMap = {};
        
        if (Array.isArray(trunksData)) {
          trunksData.forEach(trunk => {
            trunkMap[trunk.id] = trunk.trunkcode || trunk.name || '';
          });
        }
        
        setTrunks(trunkMap);
      } catch (error) {
        console.error("Error while fetching trunk data:", error);
        // Set empty trunks object to prevent undefined errors
        setTrunks({});
      }
    };

    // pkg_trunks data is already included in the CDR data from the backend
    const fetchPkgTrunks = async () => {
      setPkgTrunks({}); // Not needed as we'll use the data from the CDR response
    };

    Promise.all([fetchCDRData(), fetchUsers(), fetchTrunks(), fetchPkgTrunks()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Fonction de tri
  const requestSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter, sort and deduplicate records based on search term
  const { filteredRecords, totalUniqueRecords } = React.useMemo(() => {
    // Filtrer d'abord les données selon le terme de recherche
    let filtered = cdrData.filter(cdr => {
      if (!cdr.callerid) return false;
      return cdr.callerid.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Trier les enregistrements
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Dédupliquer les enregistrements
    const uniqueRecords = [];
    const seenIds = new Set();
    
    filtered.forEach(record => {
      if (record.id && !seenIds.has(record.id)) {
        seenIds.add(record.id);
        uniqueRecords.push(record);
      }
    });
    
    return {
      filteredRecords: uniqueRecords,
      totalUniqueRecords: uniqueRecords.length
    };
  }, [cdrData, searchTerm, sortConfig]);

  // Pagination logic
  const currentRecords = React.useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredRecords, currentPage, recordsPerPage]);
  
  const totalPages = Math.ceil(totalUniqueRecords / recordsPerPage);
  
  // Change page
  const paginate = (pageNumber, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentPage(pageNumber);
  };
  
  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);



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

  // Toggle select all rows on current page
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    setSelectedRows(prev => {
      const newSelected = { ...prev };
      
      if (newSelectAll) {
        // Sélectionner toutes les lignes de la page actuelle
        currentRecords.forEach(cdr => {
          if (cdr.id) {
            newSelected[cdr.id] = true;
          }
        });
      } else {
        // Désélectionner toutes les lignes de la page actuelle
        currentRecords.forEach(cdr => {
          if (cdr.id) {
            delete newSelected[cdr.id];
          }
        });
      }
      
      return newSelected;
    });
  };

  // Vérifier si toutes les lignes de la page sont sélectionnées
  useEffect(() => {
    if (currentRecords.length > 0) {
      const allCurrentSelected = currentRecords.every(
        cdr => cdr.id && selectedRows[cdr.id]
      );
      setSelectAll(allCurrentSelected);
    } else {
      setSelectAll(false);
    }
  }, [currentRecords, selectedRows]);

  // Toggle single row selection
  const toggleRowSelection = React.useCallback((id) => {
    if (!id) return;
    
    setSelectedRows(prevSelected => {
      // Créer une nouvelle copie de l'objet de sélection
      const newSelection = { ...prevSelected };
      
      // Toggle l'état de la ligne actuelle
      newSelection[id] = !prevSelected[id];
      
      return newSelection;
    });
  }, []);
  
  // Mettre à jour l'état selectAll quand les sélections ou les données changent
  useEffect(() => {
    if (currentRecords.length > 0) {
      const allSelected = currentRecords.every(record => 
        record.id && selectedRows[record.id]
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [currentRecords, selectedRows]);

  // Export to CSV
  const exportToCSV = () => {
    const selectedCount = Object.values(selectedRows).filter(Boolean).length;
    
    // If items are selected, export them, otherwise export all
    const recordsToExport = selectedCount > 0 
      ? filteredRecords.filter(cdr => selectedRows[cdr.id])
      : filteredRecords;

    if (recordsToExport.length === 0) {
      alert("Please select at least one row to export.");
      return;
    }
    
    // Show confirmation with number of items to be exported
    if (selectedCount > 0) {
      if (!window.confirm(`Do you want to export the ${selectedCount} selected items?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Do you want to export all ${filteredRecords.length} items?`)) {
        return;
      }
    }

    const headers = Object.entries({
      Date: 'Date',
      utilisateurSip: 'SIP User',
      idAppelant: 'Caller ID',
      numero: 'Number',
      Destination: 'Destination',
      duree: 'Duration',
      realDuree: 'Real Duration',
      nomUtilisateur: 'Username',
      trunk: 'Trunk',
      Type: 'Type',
      prixAchat: 'Buy Price',
      prixVente: 'Sell Price',
      idUnique: 'Unique ID',
      Plan: 'Plan',
      campagne: 'Campaign',
      serveur: 'Server'
    })
      .filter(([key]) => visibleColumns[key])
      .map(([_, value]) => value)
      .join(",") + "\n";

    const csvContent = recordsToExport
      .map(cdr => {
        return [
          visibleColumns.Date ? `"${new Date(cdr.starttime).toLocaleString('en-US')}"` : null,
          visibleColumns.utilisateurSip ? `"${cdr.src || ''}"` : null,
          visibleColumns.idAppelant ? `"${cdr.callerid || ''}"` : null,
          visibleColumns.numero ? `"${cdr.calledstation || ''}"` : null,
          visibleColumns.Destination ? `"${cdr.id_prefix || ''}"` : null,
          visibleColumns.duree ? `"${cdr.sessiontime} seconds"` : null,
          visibleColumns.realDuree ? `"${cdr.real_sessiontime} seconds"` : null,
          visibleColumns.nomUtilisateur ? `"${cdr.username || ''}"` : null,
          visibleColumns.trunk ? `"${cdr.trunkcode || ''}"` : null,
          visibleColumns.Type ? `"${cdr.type || ''}"` : null,
          visibleColumns.prixAchat ? `"${cdr.buycost || '0'} €"` : null,
          visibleColumns.prixVente ? `"${cdr.sessionbill || '0'} €"` : null,
          visibleColumns.idUnique ? `"${cdr.uniqueid || ''}"` : null,
          visibleColumns.Plan ? `"${cdr.id_plan || ''}"` : null,
          visibleColumns.campagne ? `"${cdr.id_campaign || ''}"` : null,
          visibleColumns.serveur ? `"${cdr.server_name || ''}"` : null
        ].filter(Boolean).join(",");
      })
      .join("\n");

    const blob = new Blob([
      '﻿', // BOM for UTF-8 encoding in Excel
      headers,
      csvContent
    ], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `cdr_report_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Show success notification
    alert(`Export successful! ${recordsToExport.length} items have been exported.`);
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
                    title="Export selected rows"
                  >
                    <FaFileExport className="me-2" />
                    {Object.values(selectedRows).filter(Boolean).length > 0 
                      ? `Export (${Object.values(selectedRows).filter(Boolean).length} selected)` 
                      : 'Export All'}
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
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="form-control"
                        max={endDate || ''}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="form-control"
                        min={startDate || ''}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <div className="d-flex gap-2">
                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Filter'}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={resetDateFilter}
                        disabled={loading || (!startDate && !endDate)}
                      >
                        Reset
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <div className="d-flex mb-3 gap-2">
                <div className="position-relative flex-grow-1">
                  <Form.Control
                    type="text"
                    placeholder="Search by caller ID..."
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
                            title="Select/Deselect all"
                          />
                        </th>
                        {visibleColumns.Date && (
                          <th 
                            style={{ cursor: 'pointer' }}
                            onClick={() => requestSort('starttime')}
                            className="user-select-none"
                          >
                            <div className="d-flex align-items-center gap-1">
                              Date
                              {sortConfig.key === 'starttime' && (
                                sortConfig.direction === 'asc' ? 
                                <FaSortAmountDownAlt /> : 
                                <FaSortAmountDown />
                              )}
                            </div>
                          </th>
                        )}
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
                      {currentRecords.map((cdr, index) => (
                        <tr key={`${cdr.id}-${index}`}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={!!selectedRows[cdr.id]}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleRowSelection(cdr.id, index);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          {visibleColumns.Date && <td>{new Date(cdr.starttime).toLocaleString('en-US')}</td>}
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
                          {visibleColumns.campagne && <td>{cdr.id_campaign || "-"}</td>}
                          {visibleColumns.serveur && <td>{cdr.server_name}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="text-muted mt-3">
                Showing {totalUniqueRecords} record{totalUniqueRecords !== 1 ? 's' : ''} (page {currentPage} of {totalPages})
              </div>

              {filteredRecords.length > recordsPerPage && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination onClick={(e) => e.preventDefault()}>
                    <Pagination.First 
                      onClick={(e) => paginate(1, e)} 
                      disabled={currentPage === 1} 
                    />
                    <Pagination.Prev 
                      onClick={(e) => paginate(currentPage - 1, e)} 
                      disabled={currentPage === 1} 
                    />
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={(e) => paginate(pageNum, e)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={(e) => paginate(currentPage + 1, e)} 
                      disabled={currentPage === totalPages} 
                    />
                    <Pagination.Last 
                      onClick={(e) => paginate(totalPages, e)} 
                      disabled={currentPage === totalPages} 
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CDRTable;