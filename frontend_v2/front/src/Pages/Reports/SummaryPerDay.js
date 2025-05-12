import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Table, 
  Button, 
  Alert, 
  Spinner, 
  Pagination, 
  Dropdown,
  Card,
  Container,
  Row,
  Col,
  Badge
} from "react-bootstrap";
import { 
  FaEuroSign, 
  FaPercent,
  FaDownload,
  FaSearch,
  FaChartLine
} from "react-icons/fa";
import { CSVLink } from "react-csv";

const ITEMS_PER_PAGE = 10;

const SummaryPerDay = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    Day: true,
    SessionTime: true,
    ALOC_Calls: true,
    Nb_Call: true,
    Nb_Call_Fail: true,
    Buy_Cost: true,
    Session_Bill: true,
    Lucro: true,
    ASR: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/SummaryPerDay"
      );
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Unable to fetch data. Please check if the server is running.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item =>
    item.day.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(offset, offset + ITEMS_PER_PAGE);

  const csvData = [
    ["Day", "Session Time", "ALOC Calls", "Nb Call", "Nb Call Fail", "Buy Cost", "Session Bill", "Lucro", "ASR"],
    ...filteredData.map(item => [
      item.day,
      item.sessiontime,
      item.aloc_all_calls,
      item.nbcall,
      item.nbcall_fail,
      item.buycost,
      item.sessionbill,
      item.lucro,
      item.asr
    ])
  ];

  const toggleColumnVisibility = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="dashboard-main" style={{ marginLeft: "80px" }}>
      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
              <Card.Header className="bg-primary p-3 w-100 position-relative">
                <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
                  <div className="floating-icon position-absolute">
                    <FaChartLine className="text-white opacity-25" />
                  </div>
                </div>
                <div className="d-flex align-items-center position-relative z-2">
                  <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
                    <FaChartLine className="text-primary fs-3" />
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0 text-white">Daily Summary Report</h2>
                    <p className="text-white-50 mb-0 d-none d-md-block">Summary of call data by day</p>
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                    {error}
                  </Alert>
                )}

                <Row className="mb-4">
                  <Col md={6} className="d-flex gap-3">
                    <CSVLink
                      data={csvData}
                      filename="daily_summary.csv"
                      className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                    >
                      <div className="icon-container">
                        <FaDownload />
                      </div>
                      <span>Export</span>
                    </CSVLink>

                    <Dropdown>
                      <Dropdown.Toggle variant="secondary" className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect">
                        <span>Toggle Columns</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="p-3">
                        <div className="d-flex flex-wrap gap-3">
                          {Object.keys(visibleColumns).map((key) => (
                            <div key={key} className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={visibleColumns[key]}
                                onChange={() => toggleColumnVisibility(key)}
                              />
                              <label className="form-check-label">{key.replace("_", " ")}</label>
                            </div>
                          ))}
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                  <Col md={6}>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        placeholder="Search by Day"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control border-start-0"
                      />
                    </div>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <Table striped bordered hover className="elegant-table">
                    <thead>
                      <tr className="table-primary">
                        {visibleColumns.Day && <th>Day</th>}
                        {visibleColumns.SessionTime && <th>Session Time</th>}
                        {visibleColumns.ALOC_Calls && <th>ALOC Calls</th>}
                        {visibleColumns.Nb_Call && <th>Nb Call</th>}
                        {visibleColumns.Nb_Call_Fail && <th>Nb Call Fail</th>}
                        {visibleColumns.Buy_Cost && <th>Buy Cost <FaEuroSign /></th>}
                        {visibleColumns.Session_Bill && <th>Session Bill</th>}
                        {visibleColumns.Lucro && <th>Lucro</th>}
                        {visibleColumns.ASR && <th>ASR <FaPercent /></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={Object.keys(visibleColumns).filter(key => visibleColumns[key]).length} className="text-center">
                            <Spinner animation="border" />
                          </td>
                        </tr>
                      ) : currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.id}>
                            {visibleColumns.Day && <td>{item.day}</td>}
                            {visibleColumns.SessionTime && <td>{item.sessiontime}</td>}
                            {visibleColumns.ALOC_Calls && <td>{item.aloc_all_calls}</td>}
                            {visibleColumns.Nb_Call && <td>{item.nbcall}</td>}
                            {visibleColumns.Nb_Call_Fail && <td>{item.nbcall_fail}</td>}
                            {visibleColumns.Buy_Cost && <td>{item.buycost} €</td>}
                            {visibleColumns.Session_Bill && <td>{item.sessionbill}</td>}
                            {visibleColumns.Lucro && <td>{item.lucro}</td>}
                            {visibleColumns.ASR && <td>{item.asr} %</td>}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={Object.keys(visibleColumns).filter(key => visibleColumns[key]).length} className="text-center">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!loading && (
                      <Badge bg="light" text="dark" className="me-2 shadow-sm">
                        <span className="fw-semibold">{currentItems.length}</span> of {filteredData.length} Days
                      </Badge>
                    )}
                  </div>

                  <Pagination>
                    <Pagination.Prev
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                    />
                    {Array.from({ length: pageCount }, (_, i) => (
                      <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount - 1))}
                      disabled={currentPage === pageCount - 1}
                    />
                  </Pagination>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx global>{`
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .btn-hover-effect {
          transition: all 0.2s ease;
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
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

export default SummaryPerDay;