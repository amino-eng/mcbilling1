import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { saveAs } from "file-saver";

const QueueMembersTable = () => {
  const [queueMembers, setQueueMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetching queue members
  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/QueuesMembers/")
      .then((response) => {
        setQueueMembers(response.data.queueMembers);
        setFilteredMembers(response.data.queueMembers);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch queue members");
        setLoading(false);
      });

    fetchUsers();
  }, []);

  // Filter members based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMembers(queueMembers);
    } else {
      const results = queueMembers.filter(member =>
        member.queue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.interface.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMembers(results);
    }
  }, [searchTerm, queueMembers]);

  // Fetching users
  const fetchUsers = () => {
    axios.get("http://localhost:5000/api/admin/SIPUsers/nom")
      .then(res => setUsers(res.data.users))
      .catch(err => console.log(err));
  };

  // Exporting data to CSV
  const handleCSVExport = () => {
    const csvData = [
      ["Destination", "Queues", "sip", "Paused"],
      ...filteredMembers.map((member) => [
        member.interface,
        member.queue_name,
        member.sip || "N/A",
        member.paused === 0 ? "No" : "Yes",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," +
      csvData.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "queue_members.csv");
  };

  // Handling modal actions
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  // Handling form submission for adding new member
  const handleAddNewMember = () => {
    const newMemberData = {
      queue_name: selectedQueue,
      interface: `SIP/${selectedUser}`,
      paused: document.getElementById("paused").value,
      id_user: selectedUser
    };

    axios.post("http://localhost:5000/api/admin/QueuesMembers/ajouter", newMemberData)
      .then((response) => {
        alert("New Queue Member Added Successfully!");
        // Refresh the list
        return axios.get("http://localhost:5000/api/admin/QueuesMembers/");
      })
      .then((response) => {
        setQueueMembers(response.data.queueMembers);
        setShowModal(false);
      })
      .catch((error) => {
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
            filteredMembers.map((member, index) => (
              <tr key={member.id}>
                <td>{member.interface}</td>
                <td>{member.queue_name}</td>
                <td>{member.name || "Vide"}</td>
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
          <form>
            <div className="mb-3">
              <label htmlFor="queue" className="form-label">Select Queue</label>
              <select
                className="form-select"
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                required
              >
                <option value="">Select Queue</option>
                {[...new Set(queueMembers.map(member => member.queue_name))].map((queueName, index) => (
                  <option key={index} value={queueName}>
                    {queueName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="user" className="form-label">Sip User</label>
              <select
                className="form-select"
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
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="paused" className="form-label">Paused</label>
              <select className="form-control" id="paused" required>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </form>
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