import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button, Modal, Form } from "react-bootstrap"; // Import Bootstrap components

const QueueTable = () => {
    const [queues, setQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for managing modal visibility and form data
    const [showModal, setShowModal] = useState(false);
    const [newQueue, setNewQueue] = useState({
        name: "",
        id_user: "",
        strategy: "",
        var_talktime: "",
        var_totalCalls: "",
        var_answeredCalls: "",
    });
    const fetchQueues = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/admin/Queues");
    
            // ✅ Check if response.data contains the expected structure
            const fetchedQueues = response.data.queues || response.data || [];
            setQueues(fetchedQueues);
    
            console.log("Fetched queues:", fetchedQueues); // Debugging
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Error fetching data");
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchQueues();
    }, []);
console.log(queues);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewQueue({ ...newQueue, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting Data:", newQueue); // Debugging
        try {
            const response = await axios.post("http://localhost:5000/api/admin/Queues/add-queue", newQueue);
            console.log("Queue added:", response.data); // Debugging

            setQueues([...queues, response.data.queue]);
            setShowModal(false);
            setNewQueue({
                name: "",
                id_user: "",
                strategy: "",
                var_talktime: "",
                var_totalCalls: "",
                var_answeredCalls: "",
            });
        } catch (error) {
            console.error("Error adding queue:", error.response ? error.response.data : error.message);
            setError(error.response ? error.response.data.message : "Error adding queue");
        }
    };


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="primary" />
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                {error}
            </Alert>
        );
    }

    return (
        <div>
            <h2>Queue List</h2>
            <Button variant="primary" onClick={handleShow}>Add New Queue</Button>
            <h2></h2>
            {/* Modal for adding new queue */}
            <Modal show={showModal} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add New Queue</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form onSubmit={handleSubmit}>
  {/* Queue Name */}
  <Form.Group controlId="formQueueName">
    <Form.Label>Username</Form.Label>
    <Form.Control
      as="select"
      name="id_user"
      value={newQueue.id_user}
      onChange={handleChange}
      required
    >
      <option value="">Select Username</option>
      {queues.map((queue) => (
        <option key={queue.id_user} value={queue.id_user}>
          {queue.username}
        </option>
      ))}
    </Form.Control>
  </Form.Group>

  {/* Name */}
  <Form.Group controlId="formUserId">
    <Form.Label>Name</Form.Label>
    <Form.Control
      type="text"
      name="name"
      value={newQueue.name}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* Language */}
  <Form.Group controlId="formLanguage">
    <Form.Label>Language</Form.Label>
    <Form.Control
      as="select"
      name="language"
      value={newQueue.language}
      onChange={handleChange}
    >
      <option value="En">English</option>
      <option value="Fr">French</option>
      <option value="Sp">Spanish</option>
      <option value="Rus">Russian</option>
      <option value="Port">Portuguese</option>
      <option value="It">Italian</option>
      <option value="Ger">German</option>
      <option value="Ch">Chinese</option>
      <option value="Jap">Japanese</option>
    </Form.Control>
  </Form.Group>

  {/* Strategy */}
  <Form.Group controlId="formStrategy">
    <Form.Label>Strategy</Form.Label>
    <Form.Control
      as="select"
      name="strategy"
      value={newQueue.strategy}
      onChange={handleChange}
    >
      <option value="Ringall">Ringall - Ring all available channels until one answers</option>
      <option value="LeastRecent">LeastRecent - Round robin with memory</option>
      <option value="FewestCalls">FewestCalls - Ring interface with fewest calls</option>
      <option value="Random">Random - Ring a random interface</option>
      <option value="RoundRobin">RoundRobin - Ring interfaces in order</option>
      <option value="Wrap">Wrap - Rings interfaces in the order they were listed</option>
    </Form.Control>
  </Form.Group>

  {/* Ring Time */}
  <Form.Group controlId="formRingTime">
    <Form.Label>Ring Time</Form.Label>
    <Form.Control
      type="number"
      placeholder="Enter Ring Time"
      name="ringinuse"
      value={newQueue.ringinuse}
      onChange={handleChange}
    />
  </Form.Group>

  {/* Time for Another Agent */}
  <Form.Group controlId="formMOH">
    <Form.Label>Time for another agent</Form.Label>
    <Form.Control
      type="number"
      placeholder="1"
      name="time"
      value={newQueue.time}
      onChange={handleChange}
    />
  </Form.Group>

  {/* Time for Another Call */}
  <Form.Group controlId="formctimecall">
    <Form.Label>Time for another call</Form.Label>
    <Form.Control
      type="number"
      placeholder="1"
      name="timecall"
      value={newQueue.timecall}
      onChange={handleChange}
    />
  </Form.Group>

  {/* Weight */}
  <Form.Group controlId="formweight">
    <Form.Label>Weight</Form.Label>
    <Form.Control
      type="text"
      placeholder="Weight"
      name="weight"
      value={newQueue.weight}
      onChange={handleChange}
    />
  </Form.Group>

  {/* Frequency */}
  <Form.Group controlId="formFrequency">
    <Form.Label>Frequency</Form.Label>
    <Form.Control
      type="text"
      placeholder="Frequency"
      name="Frequency"
      value={newQueue.Frequency}
      onChange={handleChange}
    />
  </Form.Group>

  {/* Announce Position */}
  <Form.Group controlId="formAnnounce">
    <Form.Label>Announce Position</Form.Label>
    <Form.Control
      as="select"
      name="announce"
      value={newQueue.announce}
      onChange={handleChange}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </Form.Control>
  </Form.Group>

  {/* Announce Hold Time */}
  <Form.Group controlId="formAnnounceHoldtime">
    <Form.Label>Announce Holdtime</Form.Label>
    <Form.Control
      as="select"
      name="announce_holdtime"
      value={newQueue.announce_holdtime}
      onChange={handleChange}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </Form.Control>
  </Form.Group>

  {/* Announce Frequency */}
  <Form.Group controlId="formAnnounceFrequency">
    <Form.Label>Announce Frequency</Form.Label>
    <Form.Control
      as="select"
      name="announceFrequency"
      value={newQueue.announceFrequency}
      onChange={handleChange}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </Form.Control>
  </Form.Group>

  {/* Join Empty */}
  <Form.Group controlId="formJoin">
    <Form.Label>Join Empty</Form.Label>
    <Form.Control
      as="select"
      name="join"
      value={newQueue.join}
      onChange={handleChange}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </Form.Control>
  </Form.Group>

  {/* Leave When Empty */}
  <Form.Group controlId="formLeave">
    <Form.Label>Leave When Empty</Form.Label>
    <Form.Control
      as="select"
      name="leavewhenempty"
      value={newQueue.leavewhenempty}
      onChange={handleChange}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </Form.Control>
  </Form.Group>

  {/* Max Wait Time */}
  <Form.Group controlId="formMaxWaitTime">
    <Form.Label>Max Wait Time</Form.Label>
    <Form.Control
      type="number"
      placeholder="Enter Max Wait Time"
      name="max_wait_time"
      value={newQueue.max_wait_time}
      onChange={handleChange}
    />
  </Form.Group>

  {/* Max Wait Time Action */}
  <Form.Group controlId="formMaxWaitTimeAction">
    <Form.Label>Max Wait Time Action</Form.Label>
    <Form.Control
      type="text"
      placeholder="Max Wait Time Action"
      name="maxwait"
      value={newQueue.maxwait}
      onChange={handleChange}
    />
  </Form.Group>

  {/* Ring or Playing MOH */}
  <Form.Group controlId="formRingOrMOH">
    <Form.Label>Ring or Playing MOH</Form.Label>
    <Form.Control
      as="select"
      name="ring_or_moh"
      value={newQueue.ring_or_moh}
      onChange={handleChange}
    >
      <option value="moh">MOH</option>
      <option value="ring">Ring</option>
    </Form.Control>
  </Form.Group>

  {/* Submit Button */}
  <Button variant="primary" type="submit">
    Add Queue
  </Button>
</Form>

                </Modal.Body>
            </Modal>

            {/* Queue Table */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Strategy</th>
                        <th>Talk Time</th>
                        <th>Total Calls</th>
                        <th>Answered</th>
                    </tr>
                </thead>
                <tbody>
                {Array.isArray(queues) && queues.length > 0 ? (
    queues.map((queue) => (
        <tr key={queue.id}>
            <td>{queue.name}</td>
            <td>{queue.username}</td>
            <td>{queue.strategy}</td>
            <td>{queue.var_talktime}</td>
            <td>{queue.var_totalCalls}</td>
            <td>{queue.var_answeredCalls}</td>
        </tr>
    ))
) : (
    <tr><td colSpan="6">No data available</td></tr>
)}

                </tbody>
            </Table>
        </div>
    );
};

export default QueueTable;