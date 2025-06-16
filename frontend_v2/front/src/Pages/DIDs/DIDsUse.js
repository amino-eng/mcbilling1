"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Table, Button, Modal, Form, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner } from "react-bootstrap"
import ReactPaginate from "react-paginate"
import { CSVLink } from "react-csv"
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaPhoneAlt,
  FaGlobe,
  FaCog,
  FaEye,
  FaCalendarAlt,
  FaUserAlt,
  FaSignOutAlt,
} from "react-icons/fa"

const columnDisplayNames = {
  DID: "DID",
  Username: "Username",
  MonthPayed: "Month Paid",
  ReservationDate: "Reservation Date",
  ReleaseDate: "Release Date",
  NextDueDate: "Next Due Date"
};

// Constants
const ITEMS_PER_PAGE = 5;

// Header Component
function DIDsUseHeader({ dids, onExportClick, onToggleColumnSelector, isExporting }) {
  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
          {Array(5)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className="floating-icon position-absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <FaPhoneAlt
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
            <FaCalendarAlt className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">DID Usage</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Track and manage DID usage in your system</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total : <span className="fw-bold">{dids.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaPhoneAlt size={12} />
            </span>
          </Badge>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="success"
            onClick={onExportClick}
            className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
            </div>
            <span>Export CSV</span>
          </Button>
          <Button
            variant="secondary"
            onClick={onToggleColumnSelector}
            className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          >
            <div className="icon-container">
              <FaEye />
            </div>
            <span>Show/Hide Columns</span>
          </Button>
        </div>
      </div>
    </Card.Header>
  )
}

// Column Selector Component
function ColumnSelector({ visibleColumns, onColumnToggle }) {
  return (
    <Card className="mb-4 shadow-sm border-0 overflow-hidden">
      <Card.Header className="bg-light d-flex align-items-center">
        <FaCog className="text-primary me-2" />
        <h5 className="mb-0 fw-semibold">Customize Visible Columns</h5>
      </Card.Header>
      <Card.Body className="p-3">
        <Row>
          {Object.keys(visibleColumns).map(column => (
            <Col key={column} xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Form.Check 
                type="switch"
                id={`column-${column}`}
                label={columnDisplayNames[column] || column}
                checked={visibleColumns[column]}
                onChange={() => onColumnToggle(column)}
                className="user-select-none"
              />
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  )
}

// Table Component
function DIDsUseTable({ dids, visibleColumns, formatDate, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading DID usage data...</p>
      </div>
    )
  }
  
  if (dids.length === 0) {
    return (
      <div className="text-center py-5 bg-light rounded">
        <FaPhoneAlt className="text-muted mb-3" size={40} />
        <h5 className="text-muted">No DID usage data available</h5>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <Table className="elegant-table align-middle mb-0">
        <thead className="bg-light">
          <tr>
            {visibleColumns.DID && <th className="fw-semibold">{columnDisplayNames.DID || 'DID'}</th>}
            {visibleColumns.Username && <th className="fw-semibold">{columnDisplayNames.Username || 'Username'}</th>}
            {visibleColumns.MonthPayed && <th className="fw-semibold">{columnDisplayNames.MonthPayed || 'Month Payed'}</th>}
            {visibleColumns.ReservationDate && <th className="fw-semibold">{columnDisplayNames.ReservationDate || 'Reservation Date'}</th>}
            {visibleColumns.ReleaseDate && <th className="fw-semibold">{columnDisplayNames.ReleaseDate || 'Release Date'}</th>}
            {visibleColumns.NextDueDate && <th className="fw-semibold">{columnDisplayNames.NextDueDate || 'Next Due Date'}</th>}
          </tr>
        </thead>
        <tbody>
          {dids.map((did) => (
            <tr key={did.id} className="hover-effect">
              {visibleColumns.DID && <td><Badge bg="light" text="dark" className="fw-normal">{did.DID}</Badge></td>}
              {visibleColumns.Username && 
                <td>
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{width: "28px", height: "28px"}}>
                      <FaUserAlt size={12} className="text-primary" />
                    </div>
                    <span>{did.Username}</span>
                  </div>
                </td>
              }
              {visibleColumns.MonthPayed && <td>{did.MonthPayed}</td>}
              {visibleColumns.ReservationDate && 
                <td>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="text-muted me-2" size={12} />
                    <span>{formatDate(did.ReservationDate)}</span>
                  </div>
                </td>
              }
              {visibleColumns.ReleaseDate && 
                <td>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="text-muted me-2" size={12} />
                    <span>{formatDate(did.ReleaseDate)}</span>
                  </div>
                </td>
              }
              {visibleColumns.NextDueDate && 
                <td>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="text-muted me-2" size={12} />
                    <span>{formatDate(did.NextDueDate)}</span>
                  </div>
                </td>
              }
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// Pagination Component
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      previousLabel={"«"}
      nextLabel={"»"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination justify-content-center"}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link"}
      previousClassName={"page-item"}
      previousLinkClassName={"page-link"}
      nextClassName={"page-item"}
      nextLinkClassName={"page-link"}
      breakClassName={"page-item"}
      breakLinkClassName={"page-link"}
      activeClassName={"active"}
      forcePage={currentPage}
    />
  )
}

// Main Component
const DIDsUse = () => {
    const [dids, setDids] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        DID: true,
        Username: true,
        MonthPayed: true,
        ReservationDate: true,
        ReleaseDate: true,
        NextDueDate: true
    });

    const apiUrl = 'http://localhost:5000/api/admin/DIDUse/affiche';
    
    const fetchDIDs = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(apiUrl);
            const result = response.data;
            if (result.didsUsers) {
                setDids(result.didsUsers);
                setSuccessMessage("Données d'utilisation des DID chargées avec succès");
            } else {
                setErrorMessage("Aucun DID trouvé");
            }
        } catch (error) {
            console.error('Error fetching DIDs:', error);
            setErrorMessage("Échec de la récupération des données : " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format to DD/MM/YYYY HH:MM:SS for French locale
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
               date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const handleCSVExport = () => {
        setIsExporting(true);
        try {
            const headers = Object.keys(visibleColumns).filter(key => visibleColumns[key]).map(key => columnDisplayNames[key] || key);
            const csvRows = [
                headers.join(','), 
                ...dids.map(did => headers.map(column => column === 'ReservationDate' || column === 'ReleaseDate' || column === 'NextDueDate' ? formatDate(did[column]) : did[column]).join(','))
            ];
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'utilisation_dids.csv';
            a.click();
            URL.revokeObjectURL(url);
            
            setSuccessMessage("CSV exporté avec succès");
        } catch (error) {
            console.error('Error exporting CSV:', error);
            setErrorMessage("Échec de l'exportation CSV");
        } finally {
            setIsExporting(false);
        }
    };

    const handleColumnToggle = (column) => {
        setVisibleColumns(prevState => ({
            ...prevState,
            [column]: !prevState[column]
        }));
    };

    // Clear messages after timeout
    const clearMessages = () => {
        setTimeout(() => {
            setErrorMessage('');
            setSuccessMessage('');
        }, 5000);
    };

    // Pagination calculation
    const indexOfLastItem = (currentPage + 1) * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentDIDs = dids.slice(indexOfFirstItem, indexOfLastItem);
    const pageCount = Math.ceil(dids.length / ITEMS_PER_PAGE);

    useEffect(() => {
        fetchDIDs();
    }, []);

    useEffect(() => {
        if (errorMessage || successMessage) {
            clearMessages();
        }
    }, [errorMessage, successMessage]);

    return (
        <div>
            {/* CSS Styles */}
            <style jsx global>{`
                .floating-icon {
                    position: absolute;
                    animation: float 10s infinite ease-in-out;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-10px) rotate(5deg); }
                    50% { transform: translateY(5px) rotate(-5deg); }
                    75% { transform: translateY(-5px) rotate(2deg); }
                }
                .hover-effect:hover {
                    background-color: rgba(13, 110, 253, 0.05);
                    transition: background-color 0.2s ease;
                }
                .btn-hover-effect:hover .icon-container {
                    transform: translateY(-2px);
                }
                .icon-container {
                    transition: transform 0.2s ease;
                }
                .pulse-effect {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
                }
                .elegant-table th, .elegant-table td {
                    border-top: none;
                    border-bottom: 1px solid #e9ecef;
                    padding: 1rem 0.75rem;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="dashboard-main" style={{ marginLeft: "80px" }}>
                <Container fluid className="px-4 py-4">
                    <Row className="justify-content-center">
                        <Col xs={12} lg={11}>
                            <Card className="shadow border-0 overflow-hidden main-card">
                                <DIDsUseHeader 
                                    dids={dids} 
                                    onExportClick={handleCSVExport} 
                                    onToggleColumnSelector={() => setShowColumnSelector(!showColumnSelector)}
                                    isExporting={isExporting}
                                />
                                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                                    {errorMessage && (
                                        <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                                            <FaTimesCircle className="me-2" />
                                            {errorMessage}
                                        </Alert>
                                    )}
                                    {successMessage && (
                                        <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                                            <FaCheckCircle className="me-2" />
                                            {successMessage}
                                        </Alert>
                                    )}

                                    {showColumnSelector && (
                                        <ColumnSelector 
                                            visibleColumns={visibleColumns} 
                                            onColumnToggle={handleColumnToggle} 
                                        />
                                    )}

                                    <Card className="border-0 shadow-sm overflow-hidden">
                                        <DIDsUseTable 
                                            dids={currentDIDs} 
                                            visibleColumns={visibleColumns} 
                                            formatDate={formatDate}
                                            isLoading={isLoading}
                                        />
                                    </Card>

                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                                        <div className="text-muted small">
                                            {!isLoading && (
                                                <Badge bg="light" text="dark" className="me-2 shadow-sm">
                                                    <span className="fw-semibold">{currentDIDs.length}</span> sur {dids.length} enregistrements
                                                </Badge>
                                            )}
                                        </div>
                                        <PaginationSection
                                            pageCount={pageCount}
                                            onPageChange={({ selected }) => setCurrentPage(selected)}
                                            currentPage={currentPage}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default DIDsUse;
