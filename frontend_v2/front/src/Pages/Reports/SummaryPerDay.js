import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Alert, Spinner, Modal, Pagination } from "react-bootstrap";
import { FaEuroSign, FaPercent, FaCheck, FaTimes } from "react-icons/fa";

const SummaryPerDay = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletedMessage, setDeletedMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    Actions: true,
  });

  // Function to fetch data
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

  // Function to delete a row
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/SummaryPerDay/${confirmDelete}`
      );
      setData(data.filter((item) => item.id !== confirmDelete));
      setShowModal(false);
      setDeletedMessage("Item has been successfully deleted.");
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Unable to delete item. Please check if the server is running.");
    }
  };

  // Function to export table data to CSV
  const exportToCSV = () => {
    const csvRows = [];

    // Add headers
    const headers = Object.keys(visibleColumns)
      .filter((key) => visibleColumns[key])
      .map((key) => key.replace("_", " "));
    csvRows.push(headers.join(","));

    // Add data rows
    data.forEach((item) => {
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

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate data for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Generate pagination items
  const totalPages = Math.ceil(data.length / itemsPerPage);
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

  // Composant Dropdown pour la visibilité des colonnes
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
                <label className="form-check-label">{key.replace("_", " ")}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-primary">Summary of Data by Day</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {deletedMessage && <Alert variant="success">{deletedMessage}</Alert>}

      <div className="d-flex justify-content-between mb-3">
        <Button
          variant="primary"
          onClick={fetchData}
          disabled={loading}
          className="me-2"
        >
          {loading ? (
            <Spinner as="span" animation="border" size="sm" />
          ) : (
            "Refresh Data"
          )}
        </Button>
        <div>
          <Button variant="success" onClick={exportToCSV} className="me-2">
            Export to CSV
          </Button>
          <ColumnVisibilityDropdown
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        </div>
      </div>

      <Table striped bordered hover responsive className="table-custom mt-3">
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
            {visibleColumns.Actions && <th>Actions</th>}
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
              <tr key={item.id} className="table-row">
                {visibleColumns.Day && <td>{item.day}</td>}
                {visibleColumns.SessionTime && <td>{item.sessiontime}</td>}
                {visibleColumns.ALOC_Calls && <td>{item.aloc_all_calls}</td>}
                {visibleColumns.Nb_Call && <td>{item.nbcall}</td>}
                {visibleColumns.Nb_Call_Fail && <td>{item.nbcall_fail}</td>}
                {visibleColumns.Buy_Cost && <td>{item.buycost} €</td>}
                {visibleColumns.Session_Bill && <td>{item.sessionbill}</td>}
                {visibleColumns.Lucro && <td>{item.lucro}</td>}
                {visibleColumns.ASR && <td>{item.asr} %</td>}
                {visibleColumns.Actions && (
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setConfirmDelete(item.id);
                        setShowModal(true);
                      }}
                      className="btn-delete"
                    >
                      Delete
                    </Button>
                  </td>
                )}
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
      {data.length > itemsPerPage && (
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

      {/* Confirmation Modal for Deletion */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation of Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this record? This action cannot
            be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel <FaTimes />
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Confirm <FaCheck />
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CSS Styles Inline */}
      <style jsx>{`
        .table-custom th,
        .table-custom td {
          text-align: center;
          vertical-align: middle;
          font-size: 14px;
        }

        .table-primary {
          background-color: rgb(168, 170, 245);
          color: white;
          font-weight: bold;
        }

        .table-row:hover {
          background-color: #f1f1f1;
          cursor: pointer;
        }

        .btn-delete:hover {
          background-color: rgb(39, 27, 207);
          color: white;
        }

        .btn-delete:focus {
          outline: none;
        }

        .table-custom {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .container {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default SummaryPerDay;