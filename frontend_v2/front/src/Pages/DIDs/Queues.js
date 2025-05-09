import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Modal, Form, Table, Alert } from 'react-bootstrap';

function Queues() {
  const [queues, setQueues] = useState([]);
  const [filteredQueues, setFilteredQueues] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [queueForm, setQueueForm] = useState({
    username: '',
    language: 'English',
    strategy: 'Ringal',
    talk_time: 0,
    total_calls: 0,
    answered: 0
  });
  const [newQueue, setNewQueue] = useState({
    id_user: '',
    name: '',
    language: 'En',
    strategy: 'Ringall',
    ringinuse: 0,
    time: 1,
    timecall: 1,
    weight: '',
    Frequency: '',
    announce: 'Yes',
    announce_holdtime: 'Yes',
    announceFrequency: 'Yes',
    join: 'Yes',
    leavewhenempty: 'Yes',
    max_wait_time: 0,
    maxwait: '',
    ring_or_moh: 'moh'
  });
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [queueToDelete, setQueueToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const itemsPerPage = 10;

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const fetchQueues = (sortBy = 'name') => {
    axios.get(`http://localhost:5000/api/admin/Queues/afficher?sortBy=${sortBy}`)
      .then((response) => {
        setQueues(response.data.queues);
        setFilteredQueues(response.data.queues);
      })
      .catch((error) => console.error('Error fetching queues:', error));
  };

  const fetchUsernames = () => {
    axios.get('http://localhost:5000/api/admin/Users') 
      .then((response) => {
        setUsernames(response.data.users);
      })
      .catch((error) => console.error('Error fetching usernames:', error));
  };

  useEffect(() => {
    fetchQueues();
    fetchUsernames();
  }, []);

  useEffect(() => {
    const filtered = queues.filter(queue =>
      queue.username && queue.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQueues(filtered);
    setCurrentPage(1);
  }, [searchTerm, queues]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQueues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQueues.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const addQueue = (queue) => {
    axios.post('http://localhost:5000/api/admin/Queues/ajouter', queue)
      .then((response) => {
        setQueues([...queues, response.data]);
        fetchQueues(); // Refresh the queue list
        showAlert('Queue added successfully!');
        setShowModal(false);
      })
      .catch((error) => {
        console.error('Error adding queue:', error);
        showAlert('Failed to add queue', 'danger');
      });
  };

  const updateQueue = (queueId, updatedQueue) => {
    axios.put(`http://localhost:5000/api/admin/Queues/modifier/${queueId}`, updatedQueue)
      .then(() => {
        fetchQueues();
        setShowUpdateModal(false);
        showAlert('Queue updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating queue:', error);
        showAlert('Failed to update queue', 'danger');
      });
  };

  const deleteQueue = (queueId) => {
    axios.delete(`http://localhost:5000/api/admin/Queues/supprimer/${queueId}`)
      .then(() => {
        setQueues(queues.filter((queue) => queue.id !== queueId));
        setShowDeleteModal(false);
        showAlert('Queue deleted successfully!');
      })
      .catch((error) => {
        console.error('Error deleting queue:', error);
        showAlert('Failed to delete queue', 'danger');
      });
  };

  const handleEdit = (queue) => {
    setNewQueue({
      id_user: queue.id_user,
      name: queue.name,
      language: queue.language,
      strategy: queue.strategy,
      ringinuse: queue.ringinuse,
      time: queue.time,
      timecall: queue.timecall,
      weight: queue.weight,
      Frequency: queue.Frequency,
      announce: queue.announce,
      announce_holdtime: queue.announce_holdtime,
      announceFrequency: queue.announceFrequency,
      join: queue.join,
      leavewhenempty: queue.leavewhenempty,
      max_wait_time: queue.max_wait_time,
      maxwait: queue.maxwait,
      ring_or_moh: queue.ring_or_moh
    });
    setShowUpdateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQueueForm({ ...queueForm, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQueue({ ...newQueue, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addQueue(newQueue);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    updateQueue(newQueue.id_user, newQueue);
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Manage Queues</h1>
      
      {/* Alert Messages */}
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({...alert, show: false})} dismissible>
          {alert.message}
        </Alert>
      )}

      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleShow}>
          Add New Queue
        </Button>
        <select onChange={(e) => fetchQueues(e.target.value)} className="form-select w-auto">
          <option value="name">Sort by Name</option>
          <option value="id_user">Sort by Username</option>
        </select>
      </div>
      <div className="mb-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search by Username..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered shadow-sm rounded">
          <thead className="table-light">
            <tr>
              <th>Username</th>
              <th>Language</th>
              <th>Strategy</th>
              <th>Talk Time</th>
              <th>Total Calls</th>
              <th>Answered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((queue) => (
              <tr key={queue.id}>
                <td>{queue.username}</td>
                <td>{queue.language}</td>
                <td>{queue.strategy}</td>
                <td>{queue.talk_time}</td>
                <td>{queue.total_calls}</td>
                <td>{queue.answered}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => handleEdit(queue)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => {
                        setQueueToDelete(queue.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
          </li>
          {[...Array(totalPages).keys()].map((page) => (
            <li key={page + 1} className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(page + 1)}>{page + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>

      {/* Add Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Queue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formQueueName" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                as="select"
                name="id_user"
                value={newQueue.id_user}
                onChange={handleChange}
                required
              >
                <option value="">Select Username</option>
                {usernames.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formUserId" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newQueue.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formLanguage" className="mb-3">
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

            <Form.Group controlId="formStrategy" className="mb-3">
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

            <Form.Group controlId="formRingTime" className="mb-3">
              <Form.Label>Ring Time</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Ring Time"
                name="ringinuse"
                value={newQueue.ringinuse}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formMOH" className="mb-3">
              <Form.Label>Time for another agent</Form.Label>
              <Form.Control
                type="number"
                placeholder="1"
                name="time"
                value={newQueue.time}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formctimecall" className="mb-3">
              <Form.Label>Time for another call</Form.Label>
              <Form.Control
                type="number"
                placeholder="1"
                name="timecall"
                value={newQueue.timecall}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formweight" className="mb-3">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="text"
                placeholder="Weight"
                name="weight"
                value={newQueue.weight}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formFrequency" className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Control
                type="text"
                placeholder="Frequency"
                name="Frequency"
                value={newQueue.Frequency}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formAnnounce" className="mb-3">
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

            <Form.Group controlId="formAnnounceHoldtime" className="mb-3">
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

            <Form.Group controlId="formAnnounceFrequency" className="mb-3">
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

            <Form.Group controlId="formJoin" className="mb-3">
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

            <Form.Group controlId="formLeave" className="mb-3">
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

            <Form.Group controlId="formMaxWaitTime" className="mb-3">
              <Form.Label>Max Wait Time</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Max Wait Time"
                name="max_wait_time"
                value={newQueue.max_wait_time}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formMaxWaitTimeAction" className="mb-3">
              <Form.Label>Max Wait Time Action</Form.Label>
              <Form.Control
                type="text"
                placeholder="Max Wait Time Action"
                name="maxwait"
                value={newQueue.maxwait}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formRingOrMOH" className="mb-3">
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

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleClose} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Queue
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Queue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateSubmit}>
            <Form.Group controlId="formQueueName" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                as="select"
                name="id_user"
                value={newQueue.id_user}
                onChange={handleChange}
                required
              >
                <option value="">Select Username</option>
                {usernames.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formUserId" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newQueue.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formLanguage" className="mb-3">
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

            <Form.Group controlId="formStrategy" className="mb-3">
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

            <Form.Group controlId="formRingTime" className="mb-3">
              <Form.Label>Ring Time</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Ring Time"
                name="ringinuse"
                value={newQueue.ringinuse}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formMOH" className="mb-3">
              <Form.Label>Time for another agent</Form.Label>
              <Form.Control
                type="number"
                placeholder="1"
                name="time"
                value={newQueue.time}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formctimecall" className="mb-3">
              <Form.Label>Time for another call</Form.Label>
              <Form.Control
                type="number"
                placeholder="1"
                name="timecall"
                value={newQueue.timecall}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formweight" className="mb-3">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="text"
                placeholder="Weight"
                name="weight"
                value={newQueue.weight}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formFrequency" className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Control
                type="text"
                placeholder="Frequency"
                name="Frequency"
                value={newQueue.Frequency}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formAnnounce" className="mb-3">
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

            <Form.Group controlId="formAnnounceHoldtime" className="mb-3">
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

            <Form.Group controlId="formAnnounceFrequency" className="mb-3">
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

            <Form.Group controlId="formJoin" className="mb-3">
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

            <Form.Group controlId="formLeave" className="mb-3">
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

            <Form.Group controlId="formMaxWaitTime" className="mb-3">
              <Form.Label>Max Wait Time</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Max Wait Time"
                name="max_wait_time"
                value={newQueue.max_wait_time}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formMaxWaitTimeAction" className="mb-3">
              <Form.Label>Max Wait Time Action</Form.Label>
              <Form.Control
                type="text"
                placeholder="Max Wait Time Action"
                name="maxwait"
                value={newQueue.maxwait}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formRingOrMOH" className="mb-3">
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

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowUpdateModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Queue
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning!</strong> Are you sure you want to delete this queue? This action cannot be undone.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            deleteQueue(queueToDelete);
            setShowDeleteModal(false);
          }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Queues;