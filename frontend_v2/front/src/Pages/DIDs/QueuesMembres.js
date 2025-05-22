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
function ActionButtons({ onEdit, onDelete, onModify }) {
  return (
    <div className="d-flex gap-2">
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={onModify}
        className="d-flex align-items-center"
      >
        <FaEdit />
      </Button>
      <Button 
        variant="outline-danger" 
        size="sm" 
        onClick={onDelete}
        className="d-flex align-items-center"
      >
        <FaTrashAlt />
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
function MembersTable({ members, onDelete, isLoading, onModify }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading queue members...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table striped bordered hover responsive className="mb-0">
      <thead className="table-light">
        <tr>
          <th>Queue</th>
          <th>Interface</th>
          <th>User</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id}>
            <td>{member.queue_name}</td>
            <td>{member.interface}</td>
            <td>{member.user_username || 'N/A'}</td>
            <td>
              <StatusBadge paused={member.paused} />
            </td>
            <td>
              <ActionButtons 
                onModify={() => onModify(member)}
                onDelete={() => onDelete(member.id)}
              />
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
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [memberToModify, setMemberToModify] = useState(null);

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/dids/queues-members/${id}`);
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
      setSuccessMessage('Member deleted successfully');
      clearMessages();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete member');
      clearMessages();
    }
  };

  const handleFieldChange = async (id, fieldName, value) => {
    try {
      await axios.put(`/api/dids/queues-members/${id}`, { [fieldName]: value });
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
      setSuccessMessage('Member updated successfully');
      clearMessages();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update member');
      clearMessages();
    }
  };

  const handleModifyClick = (member) => {
    // Find matching queue and user from existing lists
    const selectedQueue = queue.find(q => q.name === member.queue_name);
    const selectedUser = users.find(u => {
      // Extract SIP username from interface (format: SIP/username)
      const sipName = member.interface?.replace('SIP/', '');
      return u.name === sipName;
    });
    
    setMemberToModify({
      ...member,
      queue: selectedQueue?.id || '',
      sipUser: selectedUser?.id || ''
    });
    setShowModifyModal(true);
  };

  const handleModify = async () => {
    try {
      if (!memberToModify) return;
      
      // Prepare update data matching backend expectations
      const updateData = {
        queue_name: queue.find(q => q.id === memberToModify.queue)?.name || '',
        interface: `SIP/${users.find(u => u.id === memberToModify.sipUser)?.name || ''}`,
        paused: memberToModify.paused
      };

      setLoading(true);
      
      await axios.put(`http://localhost:5000/api/admin/QueuesMembers/${memberToModify.id}`, updateData);
      
      setSuccessMessage('Member updated successfully');
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
      setShowModifyModal(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update member');
    } finally {
      setLoading(false);
    }
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
                    onDelete={handleDelete}
                    isLoading={loading}
                    onModify={handleModifyClick}
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
      {/* Modify Modal */}
      <Modal show={showModifyModal} onHide={() => setShowModifyModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Modify Queue Member</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {memberToModify && (
            <Form>
              <Form.Group className="mb-3" controlId="queue">
                <Form.Label>Queue</Form.Label>
                <Form.Select
                  value={memberToModify.queue}
                  onChange={(e) => setMemberToModify({...memberToModify, queue: e.target.value})}
                  required
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
                  value={memberToModify.sipUser}
                  onChange={(e) => setMemberToModify({...memberToModify, sipUser: e.target.value})}
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
                <Form.Select 
                  value={memberToModify.paused} 
                  onChange={(e) => setMemberToModify({...memberToModify, paused: e.target.value})}
                  required
                  id="pausedModify"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModifyModal(false)} className="d-flex align-items-center gap-2">
            <FaTimesCircle />
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleModify} 
            disabled={loading}
            className="d-flex align-items-center gap-2"
          >
            {loading ? <Spinner animation="border" size="sm" /> : <FaCheckCircle />}
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueueMembersTable;