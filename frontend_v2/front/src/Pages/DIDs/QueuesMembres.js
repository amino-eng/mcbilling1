"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button, Modal, Form, Card, Container, Row, Col, Badge, Dropdown } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { saveAs } from "file-saver";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaPhoneAlt,
  FaUsers,
  FaCog,
  FaFilter,
  FaHeadset
} from "react-icons/fa";

// Constants
const ITEMS_PER_PAGE = 10;

// Header Component
function QueueMembersHeader({ onAddClick, members, onExportClick, isExporting }) {
  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
          {Array(5)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className="floating-icon position-absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <FaHeadset
                  className="text-white opacity-25"
                  style={{
                    fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                  }}
                />
              </div>
            ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaUsers className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Queue Members</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Manage your call queue members</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{members.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaUsers size={12} />
            </span>
          </Badge>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={onAddClick}
            className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          >
            <div className="icon-container">
              <FaPlusCircle />
            </div>
            <span>Add Member</span>
          </Button>
          <Button
            variant="success"
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
      </div>
    </Card.Header>
  );
}

// Search Bar Component
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        placeholder="Search queue members..."
        value={searchTerm}
        onChange={onSearchChange}
        className="ps-4 shadow-sm rounded-pill"
      />
      <FaSearch className="position-absolute text-muted" style={{ left: "10px", top: "10px" }} />
    </div>
  );
}

// Status Badge Component
function StatusBadge({ paused }) {
  return paused === 0 ? (
    <Badge bg="success" className="d-inline-flex align-items-center gap-1 px-2 py-1">
      <FaCheckCircle size={10} />
      <span>Active</span>
    </Badge>
  ) : (
    <Badge bg="warning" text="dark" className="d-inline-flex align-items-center gap-1 px-2 py-1">
      <FaTimesCircle size={10} />
      <span>Paused</span>
    </Badge>
  );
}

// Action Buttons Component
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2 action-btn">
      <Button variant="outline-primary" size="sm" onClick={onEdit} className="d-flex align-items-center">
        <FaEdit className="btn-icon" />
      </Button>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-5">
      <div className="mb-3">
        <FaUsers size={48} className="text-muted" />
      </div>
      <h5>No Queue Members Found</h5>
      <p className="text-muted">Try adjusting your search or add a new queue member.</p>
    </div>
  );
}

// Members Table Component
function MembersTable({ members, onEdit, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading queue members...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table responsive hover className="elegant-table">
      <thead className="bg-light">
        <tr>
          <th>Queue</th>
          <th>Destination</th>
          <th>Username</th>
          <th>Paused</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id} className="align-middle">
            <td>
              <div className="d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-2">
                  <FaHeadset className="text-primary" />
                </div>
                <span className="fw-medium">{member.queue_name}</span>
              </div>
            </td>
            <td>{member.interface}</td>
            <td className="align-middle">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">{member.user_username || member.id_user}</span>
              </div>
            </td>
            <td>
              <StatusBadge paused={member.paused} />
            </td>
            <td className="text-end">
              <ActionButtons onEdit={() => onEdit(member)} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// Pagination Component
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      previousLabel={"Previous"}
      nextLabel={"Next"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination justify-content-end mb-0"}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link"}
      previousClassName={"page-item"}
      previousLinkClassName={"page-link"}
      nextClassName={"page-item"}
      nextLinkClassName={"page-link"}
      breakClassName={"page-item"}
      breakLinkClassName={"page-link"}
      activeClassName={"active"}
      forcePage={currentPage}
    />
  );
}

// Main Component
const QueueMembersTable = () => {
  // State variables
  const [queue, setQueue] = useState([]);
  const [queueMembers, setQueueMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modifiedMembers, setModifiedMembers] = useState({});
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditField, setBulkEditField] = useState("");
  const [bulkEditValue, setBulkEditValue] = useState("");

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/QueuesMembers/queues');
        setQueue(response.data.queues);
      } catch (error) {
        console.error('Error fetching queues:', error);
        setError("Failed to fetch queues");
      }
    };

    fetchQueues();
  }, []);

  useEffect(() => {
    const fetchQueueMembers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/QueuesMembers/");
        setQueueMembers(response.data.queueMembers);
        setFilteredMembers(response.data.queueMembers);
      } catch (error) {
        setError("Failed to fetch queue members");
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/QueuesMembers/sip-users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchQueueMembers();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredMembers(queueMembers);
    } else {
      setFilteredMembers(
        queueMembers.filter(member =>
          member.queue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.interface.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, queueMembers]);

  // Clear messages after timeout
  const clearMessages = () => {
    if (successMessage || error) {
      setTimeout(() => {
        setSuccessMessage("");
        setError(null);
      }, 5000);
    }
  };

  useEffect(() => {
    clearMessages();
  }, [successMessage, error]);

  const handleCSVExport = () => {
    setIsExporting(true);
    const csvData = [
      ["Destination", "Queues", "SIP", "Paused"],
      ...filteredMembers.map(member => [
        member.interface,
        member.queue_name,
        member.sip || "N/A",
        member.paused === 0 ? "No" : "Yes",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "queue_members.csv");
    setIsExporting(false);
    setSuccessMessage("Queue members exported successfully!");
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleAddNewMember = async () => {
    try {
      if (!selectedQueue || !selectedUser) {
        setError("Please select both queue and user");
        return;
      }

      const pausedValue = document.getElementById("paused").value;
      
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/admin/QueuesMembers/ajouter', {
        queue: selectedQueue,
        paused: pausedValue,
        sipUser: selectedUser
      });
      
      if (response.data.message) {
        setSuccessMessage(response.data.message);
        const fetchQueueMembers = async () => {
          try {
            const response = await axios.get("http://localhost:5000/api/admin/QueuesMembers/");
            setQueueMembers(response.data.queueMembers);
          } catch (error) {
            setError("Failed to fetch queue members");
          } finally {
            setLoading(false);
          }
        };
        fetchQueueMembers();
        handleCloseModal();
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to add queue member");
    } finally {
      setLoading(false);
    }
  };

  // New functions for bulk editing
  const handleBulkEditStart = () => {
    setShowBulkEditModal(true);
  };

  const handleBulkEditSave = () => {
    setLoading(true);
    const updates = Object.entries(modifiedMembers).map(([id, changes]) => ({
      id: parseInt(id),
      ...changes
    }));

    if (updates.length === 0) {
      alert("No changes to save");
      return;
    }

    axios.put('http://localhost:5000/api/admin/QueuesMembers/bulk', { updates })
      .then(() => {
        alert("Bulk update successful!");
        return axios.get('http://localhost:5000/api/admin/QueuesMembers/');
      })
      .then(response => {
        setQueueMembers(response.data.queueMembers);
        setModifiedMembers({});
      })
      .catch(error => {
        setError("Failed to bulk update: " + (error.response?.data?.error || error.message));
      })
      .finally(() => {
        setShowBulkEditModal(false);
      });
  };

  const handleBulkFieldChange = () => {
    const newModifiedMembers = { ...modifiedMembers };
    
    filteredMembers.forEach(member => {
      if (!newModifiedMembers[member.id]) {
        newModifiedMembers[member.id] = {};
      }
      newModifiedMembers[member.id][bulkEditField] = bulkEditValue;
    });

    setModifiedMembers(newModifiedMembers);
    setShowBulkEditModal(false);
    alert(`Bulk edit applied to ${filteredMembers.length} members`);
  };

  const handleFieldChange = (id, fieldName, value) => {
    setModifiedMembers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [fieldName]: value
      }
    }));
  };

  // Calculate pagination
  const pageCount = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  if (loading && !queueMembers.length) return <Spinner animation="border" />;
  if (error && !queueMembers.length) return <Alert variant="danger">{error}</Alert>;

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)"
    }}>
      <style>
        {`
        .floating-icon {
          position: absolute;
          animation: float 8s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .btn-hover-effect {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
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
        .action-btn .btn-icon {
          transition: transform 0.2s ease;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>

      <div className="dashboard-main" style={{ marginLeft: "80px" }}>
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow border-0 overflow-hidden main-card">
                <QueueMembersHeader 
                  onAddClick={handleShowModal}
                  members={queueMembers}
                  onExportClick={handleCSVExport}
                  isExporting={isExporting}
                />
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaCheckCircle className="me-2" />
                      {successMessage}
                    </Alert>
                  )}

                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <SearchBar 
                        searchTerm={searchTerm} 
                        onSearchChange={(e) => setSearchTerm(e.target.value)} 
                      />
                    </Col>
                  </Row>

                  <MembersTable 
                    members={paginatedMembers}
                    onEdit={(member) => {
                      setEditingId(member.id);
                      setShowBulkEditModal(true);
                    }}
                    isLoading={loading}
                  />

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!loading && (
                        <>
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{paginatedMembers.length}</span> of {filteredMembers.length} Members
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtered from {queueMembers.length} total
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <PaginationSection
                      pageCount={pageCount}
                      onPageChange={({ selected }) => setCurrentPage(selected)}
                      currentPage={currentPage}
                    />
                  </div>

                  {Object.keys(modifiedMembers).length > 0 && (
                    <div className="text-end mt-3">
                      <Button 
                        variant="success" 
                        onClick={handleBulkEditSave}
                        className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect ms-auto"
                      >
                        <FaCheckCircle />
                        <span>Save All Changes ({Object.keys(modifiedMembers).length})</span>
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {/* Add New Member Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Add New QueueMember</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3" controlId="formQueueSelect">
              <Form.Label>Select Queue</Form.Label>
              <Form.Select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                required
                aria-label="Select queue"
              >
                <option value="">Select Queue</option>
                {queue.map((queueItem) => (
                  <option key={queueItem.id} value={queueItem.id}>
                    {queueItem.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SIP User</Form.Label>
              <Form.Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.accountcode})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Paused</Form.Label>
              <Form.Select id="paused" required>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal} className="d-flex align-items-center gap-2">
            <FaTimesCircle />
            Close
          </Button>
          <Button variant="primary" onClick={handleAddNewMember} className="d-flex align-items-center gap-2">
            <FaPlusCircle />
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Edit Modal */}
      <Modal show={showBulkEditModal} onHide={() => setShowBulkEditModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Bulk Edit</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Field to Edit</Form.Label>
              <Form.Select
                value={bulkEditField}
                onChange={(e) => setBulkEditField(e.target.value)}
                required
              >
                <option value="">Select Field</option>
                <option value="paused">Paused Status</option>
              </Form.Select>
            </Form.Group>

            {bulkEditField === "paused" && (
              <Form.Group className="mb-3">
                <Form.Label>New Value</Form.Label>
                <Form.Select
                  value={bulkEditValue}
                  onChange={(e) => setBulkEditValue(e.target.value)}
                  required
                >
                  <option value="">Select Value</option>
                  <option value="0">No (Active)</option>
                  <option value="1">Yes (Paused)</option>
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowBulkEditModal(false)} className="d-flex align-items-center gap-2">
            <FaTimesCircle />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkFieldChange} className="d-flex align-items-center gap-2">
            <FaEdit />
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueueMembersTable;