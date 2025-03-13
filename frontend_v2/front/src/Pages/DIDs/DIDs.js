import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function DIDs() {
  const [dids, setDids] = useState([]);
  const [didForm, setDidForm] = useState({
    did_number: '',
    country: '',
    active: true,
    id_user: '',
  });

  // Fetch DIDs on component mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/admin/DIDs/afficher')
      .then((response) => setDids(response.data.dids))
      .catch((error) => console.error('Error fetching DIDs:', error));
  }, []);

  // Add a new DID
  const addDID = (did) => {
    axios
      .post('http://localhost:5000/api/admin/DIDs/ajouter', did)
      .then((response) => {
        setDids([...dids, { ...did, id: response.data.id }]);
        setDidForm({ did_number: '', country: '', active: true, id_user: '' });
      })
      .catch((error) => console.error('Error adding DID:', error));
  };

  // Update a DID
  const updateDID = (didId, updatedDID) => {
    axios
      .put(`http://localhost:5000/api/admin/DIDs/modifier/${didId}`, updatedDID)
      .then(() => {
        const updatedDIDs = dids.map((did) =>
          did.id === didId ? { ...did, ...updatedDID } : did
        );
        setDids(updatedDIDs);
      })
      .catch((error) => console.error('Error updating DID:', error));
  };

  // Delete a DID
  const deleteDID = (didId) => {
    axios
      .delete(`http://localhost:5000/api/admin/DIDs/supprimer/${didId}`)
      .then(() => {
        setDids(dids.filter((did) => did.id !== didId));
      })
      .catch((error) => console.error('Error deleting DID:', error));
  };

  // Export DIDs to CSV
  const exportToCSV = () => {
    const headers = [
      'DID', 'Reserved', 'Status', 'Username', 'Setup Price', 'Monthly Price', 'Time Used', 'Country'
    ];
    const rows = dids.map((did) => [
      did.did_number,
      did.reserved ? 'Yes' : 'No',
      did.active ? 'Activated' : 'Inactive',
      did.username,
      did.connection_charge,
      did.fixrate,
      did.expirationdate,
      did.country,
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dids.csv');
    document.body.appendChild(link);
    link.click();
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDidForm({ ...didForm, [name]: value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    addDID(didForm);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Manage DIDs</h1>

      {/* Buttons for Add New DID and Export to CSV */}
      <div className="d-flex justify-content-between mb-3">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          Add New DID
        </button>
        <button className="btn btn-success" onClick={exportToCSV}>
          Export to CSV
        </button>
      </div>

      {/* Table for displaying DIDs */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>DID</th>
            <th>Reserved</th>
            <th>Status</th>
            <th>Username</th>
            <th>Setup Price</th>
            <th>Monthly Price</th>
            <th>Time Used</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dids.map((did) => (
            <tr key={did.id}>
              <td>{did.id}</td>
              <td>{did.did_number}</td>
              <td>{did.reserved ? 'Yes' : 'No'}</td>
              <td>{did.active ? 'Activated' : 'Inactive'}</td>
              <td>{did.username}</td>
              <td>{did.connection_charge}</td>
              <td>{did.fixrate}</td>
              <td>{did.expirationdate}</td>
              <td>{did.country}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() =>
                    updateDID(did.id, { active: !did.active })
                  }
                >
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteDID(did.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding New DID */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add New DID
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">DID Number</label>
                  <input
                    type="text"
                    name="did_number"
                    value={didForm.did_number}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={didForm.country}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">User ID</label>
                  <input
                    type="text"
                    name="id_user"
                    value={didForm.id_user}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="active"
                    value={didForm.active}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                  
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Add DID
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DIDs;
