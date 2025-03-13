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
  Modal,
} from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

function RefillApp() {
  const [refills, setRefills] = useState([]);
  const [selectedRefill, setSelectedRefill] = useState(null);
  const [refillId, setRefillId] = useState("");
  const [error, setError] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [usernames, setUsernames] = useState([]);
  const [newRefill, setNewRefill] = useState({
    id_user: 0,
    credit: "",
    description: "",
    payment: false,
  });
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Fetch usernames
  const fetchUsernames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users/users");
      setUsernames(response.data.users);
    } catch (error) {
      console.error("Erreur lors du chargement des usernames", error);
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

  // Handle input change for new refill
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRefill({ ...newRefill, [name]: value });
  };

  // Handle add refill
  const handleAddRefill = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/admin/refills/add", newRefill);
      if (response.status === 201) {
        fetchRefills(); // Recharger les refills après l'ajout
        setNewRefill({ username: "", credit: "", description: "", payment: false });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du refill", error);
    }
  };

  useEffect(() => {
    fetchRefills();
    fetchUsernames();
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

      {/* Add Refill Button and Modal */}
      <div className="mb-4">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Ajouter
        </Button>

        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Ajouter un Refill</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                    {newRefill.username || "Sélectionner un utilisateur"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {usernames.map((user) => (
                      <Dropdown.Item
                        key={user.id}
                        onClick={() => setNewRefill({ ...newRefill, username: user.username })}
                      >
                        {user.username}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Credit</Form.Label>
                <Form.Control
                  type="text"
                  name="credit"
                  value={newRefill.credit}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={newRefill.description}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Payment"
                  name="payment"
                  checked={newRefill.payment}
                  onChange={(e) => setNewRefill({ ...newRefill, payment: e.target.checked })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Fermer
            </Button>
            <Button variant="primary" onClick={handleAddRefill}>
              Ajouter
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

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