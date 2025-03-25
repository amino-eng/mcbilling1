import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';

function DIDs() {
  const [dids, setDids] = useState([]);
  const [filteredDids, setFilteredDids] = useState([]);
  const [didForm, setDidForm] = useState({
    did: '',
    country: '',
    activated: 1,
    connection_charge: '',
    fixrate: '',
    id_user: 1,
    min_time_buy: '',
    buy_price_inblock: '',
    buy_price_increment: '',
    min_time_sell: '',
    initial_block: '',
    billing_block: '',
    charge_who: 'DID owner',
    back: 'Backup',
    server: '',
    description: ''
  });
  const [updateForm, setUpdateForm] = useState({
    id: '',
    did: '',
    country: '',
    activated: 1,
    connection_charge: '',
    fixrate: ''
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [didToDelete, setDidToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDIDs = () => {
    axios.get('http://localhost:5000/api/admin/DIDs/afficher')
      .then((response) => {
        setDids(response.data.dids);
        setFilteredDids(response.data.dids);
      })
      .catch((error) => console.error('Error fetching DIDs:', error));
  };

  useEffect(() => {
    fetchDIDs();
  }, []);

  useEffect(() => {
    const filtered = dids.filter(did =>
      did.did && did.did.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDids(filtered);
    setCurrentPage(1);
  }, [searchTerm, dids]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDids.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredDids.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const addDID = (did) => {
    axios.post('http://localhost:5000/api/admin/DIDs/ajouter', did)
      .then((response) => {
        setDids([...dids, response.data]);
        setDidForm({
          did: '',
          country: '',
          activated: 1,
          connection_charge: '',
          fixrate: '',
          id_user: 1,
          min_time_buy: '',
          buy_price_inblock: '',
          buy_price_increment: '',
          min_time_sell: '',
          initial_block: '',
          billing_block: '',
          charge_who: 'DID owner',
          back: 'Backup',
          server: '',
          description: ''
        });
        document.getElementById('addModal').classList.remove('show');
        document.querySelector('.modal-backdrop').remove();
        fetchDIDs();
      })
      .catch((error) => console.error('Error adding DID:', error));
  };

  const updateDID = (didId, updatedDID) => {
    axios.put(`http://localhost:5000/api/admin/DIDs/modifier/${didId}`, updatedDID)
      .then(() => {
        fetchDIDs();
        setShowUpdateModal(false);
      })
      .catch((error) => {
        console.error('Error updating DID:', error);
        alert(`Failed to update DID: ${error.response?.data?.message || error.message}`);
      });
  };

  const deleteDID = (didId) => {
    axios.delete(`http://localhost:5000/api/admin/DIDs/supprimer/${didId}`)
      .then(() => {
        setDids(dids.filter((did) => did.id !== didId));
        setShowDeleteModal(false);
      })
      .catch((error) => console.error('Error deleting DID:', error));
  };

  const handleDelete = () => {
    if (didToDelete) {
      deleteDID(didToDelete);
    }
  };

  const handleEdit = (did) => {
    setUpdateForm({
      id: did.id,
      did: did.did,
      country: did.country,
      activated: did.activated,
      connection_charge: did.connection_charge,
      fixrate: did.fixrate
    });
    setShowUpdateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDidForm({ ...didForm, [name]: value });
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm({ ...updateForm, [name]: name === 'activated' ? parseInt(value) : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addDID(didForm);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    updateDID(updateForm.id, updateForm);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Manage DIDs</h1>
      <div className="d-flex justify-content-between mb-3">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addModal"
          onClick={() => setDidForm({
            did: '',
            country: '',
            activated: 1,
            connection_charge: '',
            fixrate: '',
            id_user: 1,
            min_time_buy: '',
            buy_price_inblock: '',
            buy_price_increment: '',
            min_time_sell: '',
            initial_block: '',
            billing_block: '',
            charge_who: 'DID owner',
            back: 'Backup',
            server: '',
            description: ''
          })}
        >
          Add New DID
        </button>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by DID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
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
              <th>Acti ns</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((did) => (
              <tr key={did.id}>
                <td>{did.did}</td>
                <td>{did.reserved ? 'Yes' : 'No'}</td>
                <td>
                  {did.activated === 1 ? (
                    <span className="text-success d-flex align-items-center gap-1">
                      <FaCheckCircle /> Active
                    </span>
                  ) : (
                    <span className="text-danger d-flex align-items-center gap-1">
                      <FaTimesCircle /> Inactive
                    </span>
                  )}
                </td>
                <td>{did.username || '-'}</td>
                <td>{did.connection_charge || '0'} €</td>
                <td>{did.fixrate || '0'} €</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                      onClick={() => handleEdit(did)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                      onClick={() => {
                        setDidToDelete(did.id);
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
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages).keys()].map((page) => (
            <li
              key={page + 1}
              className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update DID</h5>
                <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3">
                    <label className="form-label">DID Number</label>
                    <input
                      type="text"
                      name="did"
                      value={updateForm.did || ''}
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
                      name="activated"
                      value={updateForm.activated}
                      onChange={handleUpdateInputChange}
                      className="form-select"
                      required
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Setup Price (€)</label>
                    <input
                      type="number"
                      name="connection_charge"
                      value={updateForm.connection_charge || ''}
                      onChange={handleUpdateInputChange}
                      className="form-control"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Monthly Price (€)</label>
                    <input
                      type="number"
                      name="fixrate"
                      value={updateForm.fixrate || ''}
                      onChange={handleUpdateInputChange}
                      className="form-control"
                      step="0.01"
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setShowUpdateModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add DID Modal */}
      <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addModalLabel">Add New DID</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* First Column */}
                  <div className="col-md-6">
                    {/* Basic DID Information */}
                    <div className="mb-3">
                      <label className="form-label">DID Number</label>
                      <input
                        type="text"
                        name="did"
                        value={didForm.did}
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
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        name="activated"
                        value={didForm.activated}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Monthly Price (€)</label>
                      <input
                        type="number"
                        name="fixrate"
                        value={didForm.fixrate}
                        onChange={handleInputChange}
                        className="form-control"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Connection Charge (€)</label>
                      <input
                        type="number"
                        name="connection_charge"
                        value={didForm.connection_charge}
                        onChange={handleInputChange}
                        className="form-control"
                        step="0.0001"
                        required
                      />
                    </div>
                  </div>
                  {/* Second Column */}
                  <div className="col-md-6">
                    {/* DID Increment Buy */}
                    <div className="border p-3 mb-3">
                      <h6>DID Increment Buy</h6>
                      <input
                        type="number"
                        name="min_time_buy"
                        value={didForm.min_time_buy}
                        onChange={handleInputChange}
                        className="form-control mb-2"
                        placeholder="Minimum Time to Charge"
                      />
                      <input
                        type="number"
                        name="buy_price_inblock"
                        value={didForm.buy_price_inblock}
                        onChange={handleInputChange}
                        className="form-control mb-2"
                        placeholder="Buy Price Inblock"
                      />
                      <input
                        type="number"
                        name="buy_price_increment"
                        value={didForm.buy_price_increment}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Buy Price Increment"
                      />
                    </div>
                    {/* DID Increment Sell */}
                    <div className="border p-3 mb-3">
                      <h6>DID Increment Sell</h6>
                      <input
                        type="number"
                        name="min_time_sell"
                        value={didForm.min_time_sell}
                        onChange={handleInputChange}
                        className="form-control mb-2"
                        placeholder="Minimum Time to Charge"
                      />
                      <input
                        type="number"
                        name="initial_block"
                        value={didForm.initial_block}
                        onChange={handleInputChange}
                        className="form-control mb-2"
                        placeholder="Initial Block"
                      />
                      <input
                        type="number"
                        name="billing_block"
                        value={didForm.billing_block}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Billing Block"
                      />
                    </div>
                    {/* Charge Who */}
                    <div className="mb-3">
                      <label className="form-label">Charge Who</label>
                      <select
                        name="charge_who"
                        value={didForm.charge_who}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="DID owner">DID Owner</option>
                        <option value="Client">CallerID, only allowing calls from registered callerIDs</option>
                      </select>
                    </div>
                    {/* Server */}
                    <div className="mb-3">
                      <label className="form-label">Server</label>
                      <select
                        name="back"
                        value={didForm.back}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="Backup">Backup</option>
                      </select>
                      <input
                        type="text"
                        name="server"
                        value={didForm.server}
                        onChange={handleInputChange}
                        className="form-control mt-2"
                        placeholder="Server Name"
                      />
                    </div>
                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        value={didForm.description}
                        onChange={handleInputChange}
                        className="form-control"
                      ></textarea>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this DID?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DIDs;