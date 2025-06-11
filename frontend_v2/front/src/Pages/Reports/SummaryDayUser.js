"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Button, Modal, Form, Dropdown, 
  Alert, Card, Container, Row, Col, 
  Badge, Spinner 
} from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { CSVLink } from 'react-csv';
import { 
  FaCheckCircle, FaTimesCircle, FaEdit, 
  FaSearch, FaDownload, FaPlusCircle, 
  FaTrashAlt, FaCalendarAlt, FaChartBar,
  FaCog
} from 'react-icons/fa';
import { saveAs } from 'file-saver';

const ITEMS_PER_PAGE = 10;

// Format functions moved to top level
const formatDurationMinutes = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
};

const formatDurationMinutesSeconds = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Helper Components
function SummaryHeader({ onExportClick, records, isExporting }) {
  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaChartBar className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Résumé quotidien des utilisateurs</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">
              Résumé des activités des utilisateurs par jour
            </p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-end align-items-center gap-2 border-bottom">
        <Button
          variant="primary"
          onClick={onExportClick}
          className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          disabled={isExporting}
        >
          <div className="icon-container">
            {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
          </div>
          <span>Export</span>
        </Button>
      </div>
    </Card.Header>
  );
}

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        placeholder="Rechercher par jour ou nom d'utilisateur..."
        value={searchTerm}
        onChange={onSearchChange}
        className="ps-5"
      />
      <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
    </div>
  );
}

function SummaryTable({ records, visibleColumns, isLoading }) {
  return (
    <div className="table-responsive">
      <Table className="elegant-table">
        <thead>
          <tr>
            {visibleColumns.day && <th>Jour</th>}
            {visibleColumns.username && <th>Nom d'utilisateur</th>}
            {visibleColumns.sessiontime && <th>Durée</th>}
            {visibleColumns.aloc_all_calls && <th>ALOC</th>}
            {visibleColumns.nbcall && <th>Appels répondu</th>}
            {visibleColumns.nbcall_fail && <th>Appels échoué</th>}
            {visibleColumns.buycost && <th>Prix d'achat</th>}
            {visibleColumns.sessionbill && <th>Prix de vente</th>}
            {visibleColumns.lucro && <th>Marge</th>}
            {visibleColumns.asr && <th>Taux de réponse</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id}>
                {visibleColumns.day && <td>{record.day}</td>}
                {visibleColumns.username && <td>{record.username}</td>}
                {visibleColumns.sessiontime && <td>{formatDurationMinutes(record.sessiontime)}</td>}
                {visibleColumns.aloc_all_calls && <td>{formatDurationMinutesSeconds(record.aloc_all_calls)}</td>}
                {visibleColumns.nbcall && <td>{record.nbcall}</td>}
                {visibleColumns.nbcall_fail && <td>{record.nbcall_fail}</td>}
                {visibleColumns.buycost && <td>{parseFloat(record.buycost).toFixed(2)} €</td>}
                {visibleColumns.sessionbill && <td>{parseFloat(record.sessionbill).toFixed(2)} €</td>}
                {visibleColumns.lucro && <td>{parseFloat(record.lucro).toFixed(2)} €</td>}
                {visibleColumns.asr && <td>{parseFloat(record.asr).toFixed(2)}%</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center">
                Aucun enregistrement trouvé
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

function ColumnSelector({ visibleColumns, toggleColumn }) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2">
        <FaCog /> Columns
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-3">
        <div className="d-flex flex-column">
          {Object.keys(visibleColumns).map((column) => (
            <Form.Check
              key={column}
              type="switch"
              id={`toggle-${column}`}
              label={
          column === 'day' ? 'Jour' :
          column === 'username' ? 'Nom d\'utilisateur' :
          column === 'sessiontime' ? 'Durée' :
          column === 'aloc_all_calls' ? 'ALOC' :
          column === 'nbcall' ? 'Appels répondu' :
          column === 'nbcall_fail' ? 'Appels échoué' :
          column === 'buycost' ? 'Prix d\'achat' :
          column === 'sessionbill' ? 'Prix de vente' :
          column === 'lucro' ? 'Marge' :
          column === 'asr' ? 'ASR' : column
        }
              checked={visibleColumns[column]}
              onChange={() => toggleColumn(column)}
              className="mb-2"
            />
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function PaginationSection({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      previousLabel={'Précédent'}
      nextLabel={'Suivant'}
      breakLabel={'...'}
      breakClassName={'page-item'}
      breakLinkClassName={'page-link'}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      containerClassName={'pagination mb-0'}
      pageClassName={'page-item'}
      pageLinkClassName={'page-link'}
      previousClassName={'page-item'}
      previousLinkClassName={'page-link'}
      nextClassName={'page-item'}
      nextLinkClassName={'page-link'}
      activeClassName={'active'}
      forcePage={currentPage}
    />
  );
}

// Main Component
const SummaryDayUser = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    day: true,
    username: true,
    sessiontime: true,
    aloc_all_calls: true,
    nbcall: true,
    nbcall_fail: true,
    buycost: true,
    sessionbill: true,
    lucro: true,
    asr: true,
  });

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/SummaryDayUser/affiche');
      setRecords(response.data);
      setFilteredRecords(response.data);
      setIsLoading(false);
    } catch (err) {
      setError("Erreur lors de la récupération des enregistrements");
      setIsLoading(false);
      setTimeout(() => setError(null), 5000);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredRecords(records);
      setCurrentPage(0);
    } else {
      const filtered = records.filter(record => 
        record.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
      setCurrentPage(0);
    }
  }, [searchTerm, records]);

  const exportToCSV = () => {
    setIsExporting(true);
    const csvData = [
      ["Jour", "Nom d'utilisateur", "Durée", "ALOC", "Répondus", "Échoués", "Prix d'achat", "Prix de vente", "Marge", "Taux de réponse"],
      ...filteredRecords.map(record => [
        record.day,
        record.username,
        formatDurationMinutes(record.sessiontime),
        formatDurationMinutesSeconds(record.aloc_all_calls),
        record.nbcall,
        record.nbcall_fail,
        parseFloat(record.buycost).toFixed(2),
        parseFloat(record.sessionbill).toFixed(2),
        parseFloat(record.lucro).toFixed(2),
        parseFloat(record.asr).toFixed(2)
      ])
    ];

    const csvFile = csvData.join('\n');
    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'resume_quotidien_utilisateurs.csv');
    setIsExporting(false);
    setSuccess("Exportation terminée avec succès");
    setTimeout(() => setSuccess(null), 5000);
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const pageCount = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const pagedRecords = filteredRecords.slice(offset, offset + ITEMS_PER_PAGE);

  return (
    <div className="dashboard-main" style={{ marginLeft: "80px" }}>
      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
              <SummaryHeader 
                onExportClick={exportToCSV} 
                records={filteredRecords}
                isExporting={isExporting}
              />
              <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaTimesCircle className="me-2" />
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaCheckCircle className="me-2" />
                    {success}
                  </Alert>
                )}

                <Row className="mb-4">
                  <Col md={6}>
                    <SearchBar 
                      searchTerm={searchTerm} 
                      onSearchChange={(e) => setSearchTerm(e.target.value)} 
                    />
                  </Col>
                  <Col md={6} className="d-flex justify-content-end">
                    <ColumnSelector 
                      visibleColumns={visibleColumns} 
                      toggleColumn={toggleColumnVisibility} 
                    />
                  </Col>
                </Row>

                <SummaryTable 
                  records={pagedRecords} 
                  visibleColumns={visibleColumns}
                  isLoading={isLoading}
                />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!isLoading && (
                      <Badge bg="light" text="dark" className="shadow-sm">
                        Affichage de {pagedRecords.length} sur {filteredRecords.length} enregistrements
                      </Badge>
                    )}
                  </div>
                  {pageCount > 1 && (
                    <PaginationSection 
                      pageCount={pageCount} 
                      onPageChange={({ selected }) => setCurrentPage(selected)}
                      currentPage={currentPage}
                    />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx global>{`
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
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SummaryDayUser;