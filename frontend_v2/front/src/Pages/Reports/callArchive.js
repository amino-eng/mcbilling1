import React, { useEffect, useState } from 'react'; // Fixed import
import axios from 'axios';
import { Table, Button, Spinner } from 'react-bootstrap';

const CallArchive = () => {
  const [cdrArchive, setCdrArchive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCdrArchive();
  }, []);
console.log(cdrArchive);

  const fetchCdrArchive = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/CallArchive/affiche');
      setCdrArchive(response.data.cdr_archive);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching CDR Archive data:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/CallArchive/delete/${id}`);
      fetchCdrArchive(); // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting CDR Archive record:', error);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div>
      <h2>Call Archive</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Trunk Code</th>
            <th>Server Name</th>
            <th>Call Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cdrArchive.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.username}</td>
              <td>{record.trunkcode}</td>
              <td>{record.server_name}</td>
              <td>{record.call_date}</td>
              <td>{record.duration}</td>
              <td>{record.status}</td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(record.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CallArchive;