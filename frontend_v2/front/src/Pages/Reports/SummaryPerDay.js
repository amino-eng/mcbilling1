import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Alert, Spinner, Modal, Pagination } from "react-bootstrap";
import { FaEuroSign, FaPercent, FaCheck, FaTimes } from "react-icons/fa"; // Icons for euro and percentage

const SummaryPerDay = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null); // ID of the item to delete
    const [showModal, setShowModal] = useState(false); // Manage modal visibility
    const [deletedMessage, setDeletedMessage] = useState(""); // Deletion confirmation message
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const itemsPerPage = 10; // Maximum items per page

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
            // Send delete request for the item by ID
            await axios.delete(
                `http://localhost:5000/api/admin/SummaryPerDay/${confirmDelete}`
            );

            // Filter data to remove the item from the local array
            setData(data.filter((item) => item.id !== confirmDelete));
            setShowModal(false); // Close modal after deletion
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
        const headers = [
            "Day",
            "Session Time",
            "ALOC Calls",
            "Nb Call",
            "Nb Call Fail",
            "Buy Cost",
            "Session Bill",
            "Lucro",
            "ASR",
        ];
        csvRows.push(headers.join(","));

        // Add data rows
        data.forEach((item) => {
            const values = [
                item.day,
                item.sessiontime,
                item.aloc_all_calls,
                item.nbcall,
                item.nbcall_fail,
                item.buycost,
                item.sessionbill,
                item.lucro,
                item.asr,
            ];
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
                <Button variant="success" onClick={exportToCSV}>
                    Export to CSV
                </Button>
            </div>

            <Table striped bordered hover responsive className="table-custom mt-3">
                <thead>
                    <tr className="table-primary">
                        <th>Day</th>
                        <th>Session Time</th>
                        <th>ALOC Calls</th>
                        <th>Nb Call</th>
                        <th>Nb Call Fail</th>
                        <th>Buy Cost <FaEuroSign /></th> {/* Euro icon */}
                        <th>Session Bill</th>
                        <th>Lucro</th>
                        <th>ASR <FaPercent /></th> {/* Percentage icon */}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="10" className="text-center">
                                <Spinner animation="border" />
                            </td>
                        </tr>
                    ) : currentItems.length > 0 ? (
                        currentItems.map((item) => (
                            <tr key={item.id} className="table-row">
                                <td>{item.day}</td>
                                <td>{item.sessiontime}</td>
                                <td>{item.aloc_all_calls}</td>
                                <td>{item.nbcall}</td>
                                <td>{item.nbcall_fail}</td>
                                <td>{item.buycost} €</td> {/* Euro icon */}
                                <td>{item.sessionbill}</td>
                                <td>{item.lucro}</td>
                                <td>{item.asr} %</td> {/* Percentage icon */}
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
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10" className="text-center">
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