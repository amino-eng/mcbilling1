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
import { FaCheck, FaTimes } from "react-icons/fa";

const SummaryPerMonth = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // État pour la page actuelle
  const itemsPerPage = 10; // Nombre d'éléments par page

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

  const handleDelete = () => {
    if (confirmDelete) {
      axios
        .delete(`http://localhost:5000/api/admin/SummaryPerMonth/${confirmDelete}`)
        .then(() => {
          setData(data.filter((item) => item.id !== confirmDelete));
          setShowModal(false);
          setConfirmDelete(null);
        })
        .catch(() => {
          setError("Failed to delete data");
          setShowModal(false);
        });
    }
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
    const rows = data.map((item) => [
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

  // Calculer les données pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Générer les numéros de page
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Gérer le clic sur une page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
        <Button variant="success" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>

      {/* Card for main content with shadow */}
      <Card className="shadow-lg border-0">
        <Card.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Table striped bordered hover responsive className="text-center">
                <thead className="bg-primary text-white">
                  <tr>
                    <th>Month</th>
                    <th>Session Time</th>
                    <th>Total Calls</th>
                    <th>Failed Calls</th>
                    <th>Buy Cost (€)</th>
                    <th>Session Bill</th>
                    <th>Profit (Lucro)</th>
                    <th>ASR (%)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {`${item.month.toString().slice(0, 4)}-${item.month
                          .toString()
                          .slice(4)}`}
                      </td>
                      <td>{item.sessiontime.toFixed(2)}</td>
                      <td>{item.nbcall.toFixed(2)}</td>
                      <td>{item.nbcall_fail.toFixed(2)}</td>
                      <td>{item.buycost.toFixed(2)} €</td>
                      <td>{item.sessionbill.toFixed(2)}</td>
                      <td>{item.lucro.toFixed(2)}</td>
                      <td>{item.asr.toFixed(2)} %</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          className="shadow-sm"
                          onClick={() => {
                            setConfirmDelete(item.id);
                            setShowModal(true);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
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

      {/* Modal for confirming delete */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirmation of Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this record? This action cannot be undone.</p>
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
    </div>
  );
};

export default SummaryPerMonth;