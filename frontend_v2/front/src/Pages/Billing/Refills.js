import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Form,
  Alert,
  InputGroup,
  Pagination,
  Dropdown,
  Card,
} from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function RefillApp() {
  const [refills, setRefills] = useState([]);
  const [selectedRefill, setSelectedRefill] = useState(null);
  const [refillId, setRefillId] = useState("");
  const [error, setError] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const columns = ["credit", "username", "date", "description", "payment"];

  // Fetch all refills
  const fetchRefills = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/Refills/affiche");
      if (!response.ok) throw new Error("Failed to fetch refills");
      const data = await response.json();
      setRefills(data.refills);
    } catch (err) {
      setError("Error fetching refills");
    }
  };

  // Fetch refill by ID
  const fetchRefillById = async (id) => {
    try {
      const response = await fetch(`/api/refills/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Refill not found");
        throw new Error("Failed to fetch refill");
      }
      const data = await response.json();
      setSelectedRefill(data.refill);
    } catch (err) {
      setError(err.message);
    }
  };

  // Export table data to CSV
  const exportToCSV = () => {
    const header = columns.filter((col) => !hiddenColumns.includes(col));
    const rows = refills.map((refill) => ({
      credit: refill.credit,
      username: refill.username,
      date: new Date(refill.date).toLocaleDateString(),
      description: refill.description,
      payment: refill.payment === 1 ? "yes" : "no",
    }));

    const csvContent =
      [header.join(",")].concat(
        rows.map((row) =>
          header.map((col) => row[col]).join(",")
        )
      ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refills.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle form submission for fetching by ID
  const handleFetchById = (e) => {
    e.preventDefault();
    if (refillId.trim() === "") {
      setError("Please enter a valid ID");
      return;
    }
    fetchRefillById(refillId);
  };

  // Toggle column visibility
  const toggleColumn = (column) => {
    setHiddenColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  // Pagination Logic
  const totalPages = Math.ceil(refills.length / rowsPerPage);
  const paginatedRefills = refills.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  useEffect(() => {
    fetchRefills();
  }, []);

  return (
    <div className="container py-5">
      {/* Page Header */}
      <h1 className="text-center mb-5">Refills</h1>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

   

     

      {/* Column Visibility Dropdown */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            Toggle Columns
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {columns.map((col) => (
              <Dropdown.Item
                key={col}
                onClick={() => toggleColumn(col)}
                className="d-flex align-items-center"
              >
                {hiddenColumns.includes(col) ? (
                  <>
                    <FaEye className="me-2 text-success" /> Show {col}
                  </>
                ) : (
                  <>
                    <FaEyeSlash className="me-2 text-danger" /> Hide {col}
                  </>
                )}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {/* Export to CSV */}
        <Button variant="warning" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>

      {/* Rows Per Page */}
      <Form.Group controlId="rowsPerPage" className="mb-4">
        <Form.Label>Rows per Page:</Form.Label>
        <Form.Select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="w-auto"
        >
          {[5, 10, 15, 20].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Refill List */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>All Refills</Card.Title>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {columns.map(
                  (col) =>
                    !hiddenColumns.includes(col) && <th key={col}>{col}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedRefills.map((refill) => (
                <tr key={refill.id}>
                  {!hiddenColumns.includes("credit") && <td>{refill.credit}</td>}
                  {!hiddenColumns.includes("username") && <td>{refill.username}</td>}
                  {!hiddenColumns.includes("date") && (
                    <td>{new Date(refill.date).toLocaleDateString()}</td>
                  )}
                  {!hiddenColumns.includes("description") && <td>{refill.description}</td>}
                  {!hiddenColumns.includes("payment") && (
                    <td>{refill.payment === 1 ? "yes" : "no"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pagination Controls */}
      <Pagination className="justify-content-center mt-4" size="lg">
        <Pagination.Prev
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        />
        <Pagination.Item>{`Page ${currentPage} of ${totalPages}`}</Pagination.Item>
        <Pagination.Next
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </div>
  );
}

export default RefillApp;