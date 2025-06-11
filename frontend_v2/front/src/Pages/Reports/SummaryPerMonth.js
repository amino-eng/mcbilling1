import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Card,
  Row,
  Col,
  Table,
  Spinner,
  Pagination,
  Badge,
  Alert,
  Form,
  Dropdown
} from "react-bootstrap";
import {
  FaEuroSign, 
  FaPercent, 
  FaDownload, 
  FaSearch,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import ReactPaginate from "react-paginate";

// Composant pour gérer la visibilité des colonnes
const ColumnVisibilityDropdown = ({ visibleColumns, setVisibleColumns }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleColumnVisibility = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Dropdown show={isDropdownOpen} onToggle={setIsDropdownOpen} className="d-inline-block ms-2">
      <Dropdown.Toggle variant="secondary" className="d-flex align-items-center gap-2 btn-hover-effect">
        <span>Columns</span>
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-3">
        {Object.keys(visibleColumns).map((key) => (
          <Form.Check 
            key={key}
            type="checkbox"
            id={`column-${key}`}
            label={key}
            checked={visibleColumns[key]}
            onChange={() => toggleColumnVisibility(key)}
            className="mb-2"
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const SummaryPerMonth = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    Mois: true,
    SessionTime: true,
    TotalCalls: true,
    FailedCalls: true,
    BuyCost: true,
    SessionBill: true,
    Bénéfice: true,
    ASR: true,
  });

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/SummaryPerMonth")
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
        setSuccessMessage("Données chargées avec succès");
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch((err) => {
        setError("Échec du chargement des données");
        setLoading(false);
      });
  }, []);

  // Filtered data based on the search term
  const filteredData = data.filter(item =>
    `${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}`.includes(searchTerm)
  );

  // Calculate data for current page
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredData.slice(offset, offset + itemsPerPage);

  // Function to export table data to CSV
  const exportToCSV = () => {
    const headers = [
      "Mois",
      "Temps de session",
      "Appels totaux",
      "Appels échoués",
      "Coût d'achat (€)",
      "Facture de session",
      "Bénéfice",
      "Taux de succès (%)",
    ];
    const rows = filteredData.map((item) => [
      `${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}`,
      item.sessiontime.toFixed(2),
      item.nbcall.toFixed(2),
      item.nbcall_fail.toFixed(2),
      `${item.buycost.toFixed(2)} €`,
      item.sessionbill.toFixed(2),
      item.lucro.toFixed(2),
      `${item.asr.toFixed(2)} %`,
    ]);
    const csvData =
      [headers.join(",")].concat(rows.map((row) => row.join(","))).join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume_mensuel.csv";
    link.click();
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Chargement du résumé mensuel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center mt-5">
        {error}
      </Alert>
    );
  }

  return (
    <div className="dashboard-main" style={{ marginLeft: "80px" }}>
      <div fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
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
                        <FaEuroSign className="text-white opacity-25" />
                      </div>
                    ))}
                  </div>
                  <div className="d-flex align-items-center position-relative z-2">
                    <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
                      <FaPercent className="text-primary fs-3" />
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0 text-white">Résumé mensuel</h2>
                      <p className="text-white-50 mb-0 d-none d-md-block">Vue d'ensemble des statistiques et revenus mensuels</p>
                    </div>
                  </div>
                </div>
                <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
                  <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
                    <span className="me-2 fw-normal">
                      Enregistrements: <span className="fw-bold">{filteredData.length}</span>
                    </span>
                  </Badge>
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      onClick={exportToCSV}
                      className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                    >
                      <FaDownload />
                      <span>Exporter</span>
                    </Button>
                    <ColumnVisibilityDropdown
                      visibleColumns={visibleColumns}
                      setVisibleColumns={setVisibleColumns}
                    />
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {successMessage && (
                  <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaCheckCircle className="me-2" />
                    {successMessage}
                  </Alert>
                )}

                <Row className="mb-4">
                  <Col md={6} lg={4}>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Rechercher par mois"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-5"
                      />
                      <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    </div>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <Table striped bordered hover className="elegant-table">
                    <thead className="bg-primary text-white">
                      <tr>
                        {visibleColumns.Mois && <th>Mois</th>}
                        {visibleColumns.SessionTime && <th>Temps de session</th>}
                        {visibleColumns.TotalCalls && <th>Appels totaux</th>}
                        {visibleColumns.FailedCalls && <th>Appels échoués</th>}
                        {visibleColumns.BuyCost && <th>Coût d'achat (€)</th>}
                        {visibleColumns.SessionBill && <th>Facture de session</th>}
                        {visibleColumns.Bénéfice && <th>Bénéfice</th>}
                        {visibleColumns.ASR && <th>Taux de succès (%)</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item) => (
                        <tr key={item.id}>
                          {visibleColumns.Mois && (
                            <td>
                              {`${item.month.toString().slice(0, 4)}-${item.month
                                .toString()
                                .slice(4)}`}
                            </td>
                          )}
                          {visibleColumns.SessionTime && <td>{item.sessiontime.toFixed(2)}</td>}
                          {visibleColumns.TotalCalls && <td>{item.nbcall.toFixed(2)}</td>}
                          {visibleColumns.FailedCalls && <td>{item.nbcall_fail.toFixed(2)}</td>}
                          {visibleColumns.BuyCost && <td>{item.buycost.toFixed(2)} €</td>}
                          {visibleColumns.SessionBill && <td>{item.sessionbill.toFixed(2)}</td>}
                          {visibleColumns.Bénéfice && <td>{item.lucro.toFixed(2)}</td>}
                          {visibleColumns.ASR && <td>{item.asr.toFixed(2)} %</td>}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    <Badge bg="light" text="dark" className="me-2 shadow-sm">
                      <span className="fw-semibold">{currentItems.length}</span> sur {filteredData.length} enregistrements
                    </Badge>
                    {searchTerm && (
                      <Badge bg="light" text="dark" className="shadow-sm">
                        Filtré à partir de {data.length} enregistrements au total
                      </Badge>
                    )}
                  </div>
                  <ReactPaginate
                    previousLabel={'Précédent'}
                    nextLabel={'Suivant'}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={({ selected }) => setCurrentPage(selected)}
                    containerClassName={'pagination'}
                    activeClassName={'active'}
                    pageClassName={'page-item'}
                    pageLinkClassName={'page-link'}
                    previousClassName={'page-item'}
                    previousLinkClassName={'page-link'}
                    nextClassName={'page-item'}
                    nextLinkClassName={'page-link'}
                    breakLinkClassName={'page-link'}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <style jsx global>{`
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .btn-hover-effect {
          transition: all 0.2s ease;
        }
        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
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
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SummaryPerMonth;