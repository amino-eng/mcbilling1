import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { saveAs } from "file-saver";

const QueueMembersTable = () => {
  const [queue, setQueue] = useState([]);
  const [queueMembers, setQueueMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
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
        const response = await fetch('http://localhost:5000/api/admin/Queues');
        const data = await response.json();
        setQueue(data.queues);
      } catch (error) {
        console.error('Error fetching queues:', error);
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
        const response = await axios.get("http://localhost:5000/api/admin/SIPUsers/nom");
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

  const handleCSVExport = () => {
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
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleAddNewMember = () => {
    const newMemberData = {
      queue: selectedQueue,
      paused: document.getElementById("paused").value,
      sipUser: selectedUser,
    };

    axios.post("http://localhost:5000/api/admin/QueuesMembers/ajouter", newMemberData)
      .then(() => {
        alert("New Queue Member Added Successfully!");
        return axios.get("http://localhost:5000/api/admin/QueuesMembers/");
      })
      .then(response => {
        setQueueMembers(response.data.queueMembers);
        setShowModal(false);
      })
      .catch(error => {
        setError("Failed to add new member: " + (error.response?.data?.error || error.message));
      });
  };

  // New functions for bulk editing
  const handleBulkEditStart = () => {
    setShowBulkEditModal(true);
  };

  const handleBulkEditSave = () => {
    const updates = Object.entries(modifiedMembers).map(([id, changes]) => ({
      id: parseInt(id),
      ...changes
    }));

    if (updates.length === 0) {
      alert("No changes to save");
      return;
    }

    axios.put("http://localhost:5000/api/admin/QueuesMembers/bulk", { updates })
      .then(() => {
        alert("Bulk update successful!");
        return axios.get("http://localhost:5000/api/admin/QueuesMembers/");
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

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Queue Members</h2>

      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by queue, interface or name..."
          className="mb-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="primary" onClick={handleCSVExport} className="me-2">
          Export CSV
        </Button>
        <Button variant="success" onClick={handleShowModal} className="me-2">
          Add New
        </Button>
        <Button variant="warning" onClick={handleBulkEditStart}>
          Bulk Edit
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Destination</th>
            <th>Queues</th>
            <th>Username</th>
            <th>Paused</th>
           
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>
                  {modifiedMembers[member.id]?.interface !== undefined ? (
                    <Form.Control
                      value={modifiedMembers[member.id].interface}
                      onChange={(e) => handleFieldChange(member.id, 'interface', e.target.value)}
                    />
                  ) : (
                    member.interface
                  )}
                </td>
                <td>
                  {modifiedMembers[member.id]?.queue_name !== undefined ? (
                    <Form.Control
                      value={modifiedMembers[member.id].queue_name}
                      onChange={(e) => handleFieldChange(member.id, 'queue_name', e.target.value)}
                    />
                  ) : (
                    member.queue_name
                  )}
                </td>
                <td>{member.user_username}</td>
                <td>
                  {modifiedMembers[member.id]?.paused !== undefined ? (
                    <Form.Select
                      value={modifiedMembers[member.id].paused}
                      onChange={(e) => handleFieldChange(member.id, 'paused', e.target.value)}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </Form.Select>
                  ) : (
                    member.paused === 0 ? "No" : "Yes"
                  )}
                </td>
                
              </tr>
            ))   
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                {searchTerm ? "No matching members found" : "No Queue Members Found"}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {Object.keys(modifiedMembers).length > 0 && (
        <div className="text-end mt-3">
          <Button variant="success" onClick={handleBulkEditSave}>
            Save All Changes ({Object.keys(modifiedMembers).length})
          </Button>
        </div>
      )}

      {/* Add New Member Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Queue Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                    {user.accountcode} || {user.name}
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
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddNewMember}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Edit Modal */}
      <Modal show={showBulkEditModal} onHide={() => setShowBulkEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Edit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
                    {user.accountcode} || {user.name}
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
          <Button variant="secondary" onClick={() => setShowBulkEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkFieldChange}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueueMembersTable;