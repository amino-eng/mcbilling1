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
} from "react-bootstrap";
import { FaEuroSign, FaPercent } from "react-icons/fa";

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
          {Object.keys(visibleColumns).map((key) => (
            <div key={key} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={visibleColumns[key]}
                onChange={() => toggleColumnVisibility(key)}
              />
              <label className="form-check-label">{key}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SummaryPerMonth = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState(""); // Search term for Month

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    Month: true,
    SessionTime: true,
    TotalCalls: true,
    FailedCalls: true,
    BuyCost: true,
    SessionBill: true,
    Profit: true,
    ASR: true,
  });

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/SummaryPerMonth")
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  // Filtered data based on the search term
  const filteredData = data.filter(item =>
    `${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}`.includes(searchTerm)
  );

  // Calculate data for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to export table data to CSV
  const exportToCSV = () => {
    const headers = [
      "Month",
      "Session Time",
      "Total Calls",
      "Failed Calls",
      "Buy Cost (€)",
      "Session Bill",
      "Profit (Lucro)",
      "ASR (%)",
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
    link.download = "summary_per_month.csv";
    link.click();
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 text-primary">Résumé Par Mois</h1>
      <div className="text-end mt-3">
        <Button variant="success" onClick={exportToCSV} className="me-2">
          Export to CSV
        </Button>
        <ColumnVisibilityDropdown
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Month"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Card for main content with shadow */}
      <Card className="shadow-lg border-0">
        <Card.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Table striped bordered hover responsive className="text-center">
                <thead className="bg-primary text-white">
                  <tr>
                    {visibleColumns.Month && <th>Month</th>}
                    {visibleColumns.SessionTime && <th>Session Time</th>}
                    {visibleColumns.TotalCalls && <th>Total Calls</th>}
                    {visibleColumns.FailedCalls && <th>Failed Calls</th>}
                    {visibleColumns.BuyCost && <th>Buy Cost (€)</th>}
                    {visibleColumns.SessionBill && <th>Session Bill</th>}
                    {visibleColumns.Profit && <th>Profit (Lucro)</th>}
                    {visibleColumns.ASR && <th>ASR (%)</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      {visibleColumns.Month && (
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
                      {visibleColumns.Profit && <td>{item.lucro.toFixed(2)}</td>}
                      {visibleColumns.ASR && <td>{item.asr.toFixed(2)} %</td>}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          {pageNumbers.map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
};

export default SummaryPerMonth;