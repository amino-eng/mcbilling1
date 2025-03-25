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

  // Fetch Queues
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

  // Fetch Queue Members and Users on Mount
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

  // Fetch Users when a specific Queue is selected
  useEffect(() => {
    if (selectedQueue) {
      const selectedQueueItem = queue.find(q => q.id === selectedQueue);
      if (selectedQueueItem) {
        const fetchUsersForQueue = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/admin/SIPUsers/nom?userId=${selectedQueueItem.id_user}`);
            const data = await response.json();
            setUsers(data.users); 
          } catch (error) {
            console.error('Error fetching SIP users:', error);
          }
        };
        fetchUsersForQueue();
      }
    } else {
      setUsers([]); // Reset users if no queue is selected
    }
  }, [selectedQueue, queue]);

  // Filter Queue Members based on Search Term
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

  // Handle Export to CSV
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

  // Handle Modal Open/Close
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  // Handle Add New Member
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
        <Button variant="success" onClick={handleShowModal}>
          Add New
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
                <td>{member.interface}</td>
                <td>{member.queue_name}</td>
                <td>{member.user_username}</td>
                <td>{member.paused === 0 ? "No" : "Yes"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                {searchTerm ? "No matching members found" : "No Queue Members Found"}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Queue Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Queue Selection */}
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
                    {queueItem.name} {/* Display name of the queue */}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* SIP User Selection */}
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

            {/* Paused Selection */}
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
    </div>
  );
};

export default QueueMembersTable;
