import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RestricNumber() {
  const [phoneData, setPhoneData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restrictionType, setRestrictionType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userRestrict, setUserRestrict] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [alert, setAlert] = useState(null); // State for alerts

  // Fetch the data for restrictions
  const fetchData = () => {
    axios.get('http://localhost:5000/api/admin/agent/affiche')
      .then((response) => {
        setPhoneData(response.data.restrictions);
        console.log(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setAlert({ type: 'danger', message: 'Error fetching data.' });
      });
  };

  // Fetch the user restrict data (agent names)
  const fetchUser = () => {
    axios.get('http://localhost:5000/api/admin/agent/afficheuserRestrict')
      .then((response) => {
        if (Array.isArray(response.data.users)) {
          setUserRestrict(response.data.users);
        } else {
          console.error('Received data is not an array', response.data);
          setAlert({ type: 'danger', message: 'Received data is not an array.' });
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setAlert({ type: 'danger', message: 'Error fetching user data.' });
      });
  };

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  // Handle adding a new restriction
  const handleAddRestriction = () => {
    if (!phoneNumber || !restrictionType || !selectedUser) {
      setAlert({ type: 'warning', message: 'Please enter phone number, restriction type, and select a user.' });
      return;
    }

    axios.post('http://localhost:5000/add-restriction', {
      number: phoneNumber,
      direction: restrictionType,
      agentId: selectedUser
    })
      .then(() => {
        setAlert({ type: 'success', message: 'Restriction added successfully!' });
        setPhoneNumber('');
        setRestrictionType('');
        setSelectedUser('');
        setShowForm(false);
        fetchData();
      })
      .catch((error) => {
        console.error('Error adding restriction:', error);
        setAlert({ type: 'danger', message: 'Error adding restriction.' });
      });
  };

  return (
    <div className="container mt-4">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      )}

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Restriction'}
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Restricted Numbers</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Phone Number</th>
                  <th>Direction</th>
                </tr>
              </thead>
              <tbody>
                {phoneData.length > 0 && phoneData.map((e, i) => (
                  <tr key={i}>
                    <td>{e.agent.username}</td>
                    <td>{e.number}</td>
                    <td>
                      {e.direction === 2 ? 'Inbound' : 'Outbound'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Conditional rendering of the form */}
      {showForm && (
        <div className="card mt-3 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">Add New Restriction</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="userSelect" className="form-label">Select User:</label>
                <select
                  className="form-select"
                  id="userSelect"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select a user</option>
                  {Array.isArray(userRestrict) && userRestrict.map((e, i) => (
                    <option key={i} value={e.id}>
                      {e.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  id="phoneNumber"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="col-md-12">
                <label htmlFor="restrictionType" className="form-label">Restriction Type:</label>
                <input
                  type="text"
                  className="form-control"
                  id="restrictionType"
                  placeholder="Restriction Type"
                  value={restrictionType}
                  onChange={(e) => setRestrictionType(e.target.value)}
                />
              </div>

              <div className="col-12">
                <button
                  className="btn btn-success"
                  onClick={handleAddRestriction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestricNumber;