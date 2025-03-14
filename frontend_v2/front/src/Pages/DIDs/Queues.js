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
    queue_name: "",
    id_user: "",
    strategy: "",
    var_talktime: "",
    var_totalCalls: "",
    var_answeredCalls: "",
  });

  useEffect(() => {
    // Fetch the queues data from the backend
    const fetchQueues = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/Queues");
        setQueues(response.data.queues);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchQueues();
  }, []);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQueue({ ...newQueue, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Post the new queue data to the backend
      const response = await axios.post("http://localhost:5000/api/admin/Queues", newQueue);
      setQueues([...queues, response.data.queue]); // Add the new queue to the list
      setShowModal(false); // Close the modal
      setNewQueue({
        queue_name: "",
        id_user: "",
        strategy: "",
        var_talktime: "",
        var_totalCalls: "",
        var_answeredCalls: "",
      }); // Reset form
    } catch (error) {
      console.error("Error adding queue:", error);
      setError("Error adding queue");
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
              type="text"
              placeholder="Enter username"
              name="username"
              value={newQueue.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* User ID */}
          <Form.Group controlId="formUserId">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter User ID"
              name="id_user"
              value={newQueue.id_user}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Language */}
          <Form.Group controlId="formLanguage">
            <Form.Label>Language</Form.Label>
            <Form.Control as="select" name="language" value={newQueue.language} onChange={handleChange}>
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="Russian">Russian</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Italian">Italian</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              
            </Form.Control>
          </Form.Group>

          {/* Strategy */}
          <Form.Group controlId="formStrategy">
            <Form.Label>Strategy</Form.Label>
            <Form.Control as="select" name="strategy" value={newQueue.strategy} onChange={handleChange}>
              <option value="Ringall">Ringall - Ring all available channels until one answers</option>
              <option value="LeastRecent">Rememory - Round robin with memory, remember where we left off last ring pass</option>
              <option value="FewestCalls">Leastrecent - Ring interface which was least recently called by this queue</option>
              <option value="Random">FewestCalls - Ring the one with fewest completed calls from this queue</option>
              <option value="RoundRobin">Random - Ring random interface</option>
              <option value="Wrap">Linear - Rings interfaces in the order they are listed in the configuration file. 
                Dynamic members will be rung in the order in which they were added</option>
                <option value="RRMemory">Wrandom -Rings a random interface, but uses the agent's penalty as a weight </option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formRinginuse">
            <Form.Label>Ringinuse</Form.Label>
            <Form.Control as="select" name="Ringinuse" value={newQueue.Ringinuse} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Control>
          </Form.Group>


          {/* Ring Time */}
          <Form.Group controlId="formRingTime">
            <Form.Label>Ring for</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter Ring Time"
              name="ring_time"
              value={newQueue.ring_time}
              onChange={handleChange}
            />
          </Form.Group>

          
          <Form.Group controlId="formMOH">
            <Form.Label>Time for another agent</Form.Label>
            <Form.Control
              type="number"
              placeholder=" 1"
              name="time"
              value={newQueue.time}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formctimecall">
            <Form.Label>Time for another call</Form.Label>
            <Form.Control
              type="number"
              placeholder=" 1"
              name="timecall"
              value={newQueue.timecall}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formweight">
            <Form.Label>Weight</Form.Label>
            <Form.Control type="text" placeholder="weight" name="weight" value={newQueue.weight} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="formFrequency">
            <Form.Label>Frequency</Form.Label>
            <Form.Control type="text" placeholder="Frequency" name="Frequency" value={newQueue.Frequency} onChange={handleChange} />
          </Form.Group>


          <Form.Group controlId="formAnnounce">
            <Form.Label>Announce Position</Form.Label>
            <Form.Control as="select" name="announce" value={newQueue.announce} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Control>
          </Form.Group>

          

          <Form.Group controlId="formAnnounceHoldtime">
            <Form.Label>Announce Holdtime</Form.Label>
            <Form.Control as="select" name="announce_holdtime" value={newQueue.announce_holdtime} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Control>
          </Form.Group>


          <Form.Group controlId="formAnnounceFrequency">
            <Form.Label>AnnounceFrequency</Form.Label>
            <Form.Control as="select" name="announceFrequency" value={newQueue.announceFrequency} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Control>
          </Form.Group>



          {/* Max Wait Time */}
          <Form.Group controlId="formMaxWaitTime">
            <Form.Label>Max Wait Time (seconds)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter Max Wait Time"
              name="max_wait_time"
              value={newQueue.max_wait_time}
              onChange={handleChange}
            />
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
          {queues.map((queue) => (
            <tr key={queue.id}>
              <td>{queue.name}</td>
              <td>{queue.username}</td>
              <td>{queue.strategy}</td>
              <td>{queue.var_talktime}</td>
              <td>{queue.var_totalCalls}</td>
              <td>{queue.var_answeredCalls}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default QueueTable;
