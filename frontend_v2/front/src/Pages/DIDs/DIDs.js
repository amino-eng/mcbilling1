import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function DIDs() {
  const [dids, setDids] = useState([]);
  const [didForm, setDidForm] = useState({
    did_number: '',
    country: '',
    active: true,
    id_user: 1,
  });
  const [updateForm, setUpdateForm] = useState({}); // State for the update form
  const [showUpdateModal, setShowUpdateModal] = useState(false); // State for the update modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for the delete confirmation modal
  const [didToDelete, setDidToDelete] = useState(null); // Store the DID to delete

  const fetchDidi = () => {
    axios
      .get('http://localhost:5000/api/admin/DIDs/afficher')
      .then((response) => setDids(response.data.dids))
      .catch((error) => console.error('Error fetching DIDs:', error));
  };

  useEffect(() => {
    fetchDidi();
  }, []);

  const addDID = (did) => {
    axios
      .post('http://localhost:5000/api/admin/DIDs/ajouter', did)
      .then((response) => {
        setDids([...dids, { ...did, id: response.data.id }]);
        setDidForm({ did_number: '', country: '', active: true, id_user: 1 });
        // Close the modal
        document.getElementById('exampleModal').classList.remove('show');
        fetchDidi();
      })
      .catch((error) => console.error('Error adding DID:', error));
  };

  const updateDID = (didId, updatedDID) => {
    axios
      .put(`http://localhost:5000/api/admin/DIDs/modifier/${didId}`, updatedDID)
      .then(() => {
        const updatedDIDs = dids.map((did) =>
          did.id === didId ? { ...did, ...updatedDID } : did
        );
        setDids(updatedDIDs);
        setShowUpdateModal(false); // Close the update modal after updating
      })
      .catch((error) => console.error('Error updating DID:', error));
  };

  const deleteDID = (didId) => {
    axios
      .delete(`http://localhost:5000/api/admin/DIDs/supprimer/${didId}`)
      .then(() => {
        setDids(dids.filter((did) => did.id !== didId));
        setShowDeleteModal(false); // Close the delete modal after deletion
      })
      .catch((error) => console.error('Error deleting DID:', error));
  };

  const handleDelete = () => {
    if (didToDelete) {
      deleteDID(didToDelete);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDidForm({ ...didForm, [name]: value });
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm({ ...updateForm, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addDID(didForm);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    updateDID(updateForm.id, updateForm); // Make sure to include the ID in the update
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Manage DIDs</h1>

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

      {/* Responsive Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered shadow-sm rounded">
          <thead className="table-light">
            <tr>
              <th>DID</th>
              <th>Reserved</th>
              <th>Status</th>
              <th>Username</th>
              <th>Setup Price €</th>
              <th>Monthly Price €</th>
              <th>Time Used</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dids.map((did) => (
              <tr key={did.id}>
                <td>{did.did}</td>
                <td>{did.reserved ? 'Yes' : 'No'}</td>
                <td>{did.activated === 1 ? 'Activated' : 'Inactive'}</td>
                <td>{did.username}</td>
                <td>{did.connection_charge} €</td>
                <td>{did.fixrate} €</td>
                <td>{did.TimeOfDay_sun}</td>
                <td>{did.country}</td>
                <td>
                                    <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setDidToDelete(did.id); // Set the DID to delete
                      setShowDeleteModal(true); // Show the confirmation modal
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update DID</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowUpdateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3">
                    <label className="form-label">DID Number</label>
                    <input
                      type="text"
                      name="did_number"
                      value={updateForm.did_number || ''}
                      onChange={handleUpdateInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={updateForm.country || ''}
                      onChange={handleUpdateInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      name="active"
                      value={updateForm.active ? 'true' : 'false'}
                      onChange={handleUpdateInputChange}
                      className="form-select"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation of Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this record? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete} // Perform the deletion
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding New DID */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Add New DID</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* First Column */}
                  <div className="col-md-6">
                    {/* DID Number */}
                    <div className="mb-3">
                      <label className="form-label">DID Number</label>
                      <input type="text" name="did_number" value={didForm.did_number} onChange={handleInputChange} className="form-control" required />
                    </div>

                    {/* Country */}
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <input type="text" name="country" value={didForm.country} onChange={handleInputChange} className="form-control" />
                    </div>

                    {/* Record Call */}
                    <div className="mb-3">
                      <label className="form-label">Record Call</label>
                      <select name="record_call" value={didForm.record_call} onChange={handleInputChange} className="form-select">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select name="active" value={didForm.active} onChange={handleInputChange} className="form-select">
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                    </div>

                    {/* CallerID Name */}
                    <div className="mb-3">
                      <label className="form-label">CallerID Name</label>
                      <input type="text" name="callerid_name" value={didForm.callerid_name} onChange={handleInputChange} className="form-control" />
                    </div>

                    {/* Pricing Fields */}
                    <div className="mb-3">
                      <label className="form-label">Setup Price (€)</label>
                      <input type="number" name="setup_price" value={didForm.setup_price} onChange={handleInputChange} className="form-control" step="0.0001" required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Monthly Price (€)</label>
                      <input type="number" name="monthly_price" value={didForm.monthly_price} onChange={handleInputChange} className="form-control" step="0.0001" required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Connection Charge (€)</label>
                      <input type="number" name="connection_charge" value={didForm.connection_charge} onChange={handleInputChange} className="form-control" step="0.0001" required />
                    </div>
                  </div>

                  {/* Second Column */}
                  <div className="col-md-6">
                    {/* DID Increment Buy */}
                    <div className="border p-3 mb-3">
                      <h6>DID Increment Buy</h6>
                      <input type="number" name="min_time_buy" value={didForm.min_time_buy} onChange={handleInputChange} className="form-control mb-2" placeholder="Minimum Time to Charge" />
                      <input type="number" name="buy_price_inblock" value={didForm.buy_price_inblock} onChange={handleInputChange} className="form-control mb-2" placeholder="Buy Price Inblock" />
                      <input type="number" name="buy_price_increment" value={didForm.buy_price_increment} onChange={handleInputChange} className="form-control" placeholder="Buy Price Increment" />
                    </div>

                    {/* DID Increment Sell */}
                    <div className="border p-3 mb-3">
                      <h6>DID Increment Sell</h6>
                      <input type="number" name="min_time_sell" value={didForm.min_time_sell} onChange={handleInputChange} className="form-control mb-2" placeholder="Minimum Time to Charge" />
                      <input type="number" name="initial_block" value={didForm.initial_block} onChange={handleInputChange} className="form-control mb-2" placeholder="Initial Block" />
                      <input type="number" name="billing_block" value={didForm.billing_block} onChange={handleInputChange} className="form-control" placeholder="Billing Block" />
                    </div>

                    {/* Charge Who */}
                    <div className="mb-3">
                      <label className="form-label">Charge Who</label>
                      <select name="charge_who" value={didForm.charge_who} onChange={handleInputChange} className="form-select">
                        <option value="DID owner">DID Owner</option>
                        <option value="Client">CallerID, only allowing calls from registered callerIDs</option>
                      </select>
                    </div>

                    {/* Server */}
                    <div className="mb-3">
                      <label className="form-label">Server</label>
                      <select name="back" value={didForm.back} onChange={handleInputChange} className="form-select">
                        <option value="Backup">Backup</option>
                      </select>
                      <input type="text" name="server" value={didForm.server} onChange={handleInputChange} className="form-control mt-2" placeholder="Server Name" />
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea name="description" value={didForm.description} onChange={handleInputChange} className="form-control"></textarea>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary w-100">Add DID</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DIDs;