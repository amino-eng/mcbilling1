import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button, Modal } from "react-bootstrap";
import { saveAs } from "file-saver";

const QueueMembersTable = () => {
  const [queueMembers, setQueueMembers] = useState([]);
  const [users, setUsers] = useState([]); // For storing SIP users
  const [selectedUser, setSelectedUser] = useState(""); // For storing selected SIP user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(""); // For storing selected queue

  // Fetching queue members
  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/QueuesMembers/")
      .then((response) => {
        setQueueMembers(response.data.queueMembers);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch queue members");
        setLoading(false);
      });

    fetchUsers();
  }, []);
console.log(queueMembers);

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
      ...queueMembers.map((member) => [
        member.interface,
        member.queue_name,
        member.sip || "N/A",
        member.paused === 0 ? "No" : "Yes",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
      + csvData.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "queue_members.csv");
  };

  // Handling modal actions
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  // Handling form submission for adding new member
  const handleAddNewMember = () => {
    const newMemberData = {
      queue: selectedQueue,
      user: selectedUser,
      sipUser: document.getElementById("Sip").value,
      paused: document.getElementById("paused").value,
    };

    // Post data to the backend (add new queue member)
    axios.post("http://localhost:5000/api/admin/QueuesMembers", newMemberData)
      .then((response) => {
        alert("New Queue Member Added Successfully!");
        setQueueMembers([...queueMembers, response.data.queueMember]); // Update the state
        setShowModal(false); // Close modal
      })
      .catch((error) => {
        setError("Failed to add new member");
      });
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Queue Members</h2>

      <div className="mb-3">
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
          {queueMembers.length > 0 ? (
            queueMembers.map((member, index) => (
              <tr key={member.id}>
                <td>{member.interface}</td>
                <td>{member.queue_name}</td>
                <td>{member.name || "Vide"}</td>
                <td>{member.paused === 0 ? "No" : "Yes"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No Queue Members Found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for Add New Queue Member */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Queue Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Form for adding new member */}
          <form>
            <div className="mb-3">
              <label htmlFor="queue" className="form-label">Select Queue</label>
              <select
                className="form-select"
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                required>
                  <option value="">Select Queue</option>
                  {queueMembers.map((member) => (
                    <option key={member.id} value={member.queue_name}>
                      {member.queue_name}
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
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {console.log(users)}
                    {user.accountcode} || {user.name} 
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="paused" className="form-label">Paused</label>
              <select className="form-control" id="paused">
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
