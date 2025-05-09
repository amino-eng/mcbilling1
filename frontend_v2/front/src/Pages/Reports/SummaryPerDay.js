import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Alert, Spinner, Pagination, Dropdown } from "react-bootstrap";
import { FaEuroSign, FaPercent } from "react-icons/fa";

const SummaryPerDay = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletedMessage, setDeletedMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState(""); // Search term for Day

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

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "http://localhost:5002/api/admin/SummaryPerDay"
      );
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Unable to fetch data. Please check if the server is running.");
    }
    setLoading(false);
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filtered data based on search term
  const filteredData = data.filter(item =>
    item.day.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate data for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Generate pagination items
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => setCurrentPage(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  // Function to export table data to CSV
  const exportToCSV = () => {
    const csvRows = [];

    // Add headers
    const headers = Object.keys(visibleColumns)
      .filter((key) => visibleColumns[key])
      .map((key) => key.replace("_", " "));
    csvRows.push(headers.join(","));

    // Add data rows
    filteredData.forEach((item) => {
      const values = Object.keys(visibleColumns)
        .filter((key) => visibleColumns[key])
        .map((key) => {
          switch (key) {
            case "Day":
              return item.day;
            case "SessionTime":
              return item.sessiontime;
            case "ALOC_Calls":
              return item.aloc_all_calls;
            case "Nb_Call":
              return item.nbcall;
            case "Nb_Call_Fail":
              return item.nbcall_fail;
            case "Buy_Cost":
              return item.buycost;
            case "Session_Bill":
              return item.sessionbill;
            case "Lucro":
              return item.lucro;
            case "ASR":
              return item.asr;
            default:
              return "";
          }
        });
      csvRows.push(values.join(","));
    });

    // Create CSV file
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "summary_per_day.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-primary">Summary of Data by Day</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {deletedMessage && <Alert variant="success">{deletedMessage}</Alert>}

      <div className="d-flex justify-content-between mb-3">
        <div>
          <Button variant="success" onClick={exportToCSV} className="me-2">
            Export to CSV
          </Button>
          <Dropdown>
            <Dropdown.Toggle variant="secondary">
              Toggle Columns
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.keys(visibleColumns).map((key) => (
                <div key={key} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={visibleColumns[key]}
                    onChange={() => toggleColumnVisibility(key)}
                  />
                  <label className="form-check-label">{key.replace("_", " ")}</label>
                </div>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Day"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      <Table striped bordered hover responsive>
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
              <td colSpan={Object.keys(visibleColumns).filter((key) => visibleColumns[key]).length + 1} className="text-center">
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
              <td colSpan={Object.keys(visibleColumns).filter((key) => visibleColumns[key]).length + 1} className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />
          {paginationItems}
          <Pagination.Next
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </div>
  );
};

export default SummaryPerDay;