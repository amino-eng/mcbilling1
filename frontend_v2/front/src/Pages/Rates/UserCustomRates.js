import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';

function UserCustomRates() {
  const [userRates, setUserRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingRate, setEditingRate] = useState(null); // 🖊️ state to manage editing
  const [editFormData, setEditFormData] = useState({}); // 📑 form data

  const [newRate, setNewRate] = useState({
    username: '',
    prefix: '',
    destination: '',
    rateinitial: '',
    initblock: '',
    billingblock: ''
  }); // State for new rate form

  useEffect(() => {
    fetchUserRates();
  }, []);

  const fetchUserRates = () => {
    axios.get('http://localhost:5000/api/admin/Userrate/afficher')
      .then((response) => {
        setUserRates(response.data.userRates);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user rates:', error);
        setError('Failed to fetch user rates');
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/Userrate/supprimer/${id}`);
        fetchUserRates(); // refresh after delete
      } catch (error) {
        console.error('Error deleting rate:', error);
      }
    }
  };

  const handleEditClick = (rate) => {
    setEditingRate(rate.id);
    setEditFormData({ ...rate });
  };

  const handleCancelEdit = () => {
    setEditingRate(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/Userrate/modifier/${editingRate}`, editFormData);
      fetchUserRates();
      setEditingRate(null);
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  };

  const handleChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const filteredRates = userRates.filter(rate =>
    rate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.prefix.toString().includes(searchTerm) ||
    rate.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChange = (e) => {
    setNewRate({ ...newRate, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/Userrate/ajouter', newRate);
      fetchUserRates(); // Refresh list
      setNewRate({ username: '', prefix: '', destination: '', rateinitial: '', initblock: '', billingblock: '' }); // Reset form
    } catch (error) {
      console.error('Error creating new rate:', error);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRates.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRates.length / rowsPerPage);

  if (loading) return <p>Loading user rates...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>User Custom Rates</h2>
        <CSVLink data={userRates} filename="user_rates.csv" className="btn btn-success">
          Export CSV
        </CSVLink>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Username, Prefix, or Destination"
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Prefix</th>
            <th>Destination</th>
            <th>Initial Rate</th>
            <th>Init Block</th>
            <th>Billing Block</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? currentRows.map(rate => (
            editingRate === rate.id ? (
              <tr key={rate.id}>
                <td>{rate.id}</td>
                <td><input type="text" name="username" value={editFormData.username} onChange={handleChange} /></td>
                <td><input type="text" name="prefix" value={editFormData.prefix} onChange={handleChange} /></td>
                <td><input type="text" name="destination" value={editFormData.destination} onChange={handleChange} /></td>
                <td><input type="text" name="rateinitial" value={editFormData.rateinitial} onChange={handleChange} /></td>
                <td><input type="text" name="initblock" value={editFormData.initblock} onChange={handleChange} /></td>
                <td><input type="text" name="billingblock" value={editFormData.billingblock} onChange={handleChange} /></td>
                <td>
                  <button className="btn btn-success btn-sm me-2" onClick={handleSaveEdit}>Save</button>
                  <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={rate.id}>
                <td>{rate.id}</td>
                <td>{rate.username}</td>
                <td>{rate.prefix}</td>
                <td>{rate.destination}</td>
                <td>{rate.rateinitial}</td>
                <td>{rate.initblock}</td>
                <td>{rate.billingblock}</td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEditClick(rate)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rate.id)}>Delete</button>
                </td>
              </tr>
            )
          )) : (
            <tr>
              <td colSpan="8" className="text-center">No data found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center">
        <nav>
          <ul className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Add New User Rate Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h4>Add New User Rate</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateSubmit}>
            <div className="row mb-3">
              <div className="col">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="form-control"
                  value={newRate.username}
                  onChange={handleCreateChange}
                  required
                />
              </div>
              <div className="col">
                <input
                  type="text"
                  name="prefix"
                  placeholder="Prefix"
                  className="form-control"
                  value={newRate.prefix}
                  onChange={handleCreateChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <input
                  type="text"
                  name="destination"
                  placeholder="Destination"
                  className="form-control"
                  value={newRate.destination}
                  onChange={handleCreateChange}
                  required
                />
              </div>
              <div className="col">
                <input
                  type="text"
                  name="rateinitial"
                  placeholder="Initial Rate"
                  className="form-control"
                  value={newRate.rateinitial}
                  onChange={handleCreateChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <input
                  type="text"
                  name="initblock"
                  placeholder="Init Block"
                  className="form-control"
                  value={newRate.initblock}
                  onChange={handleCreateChange}
                  required
                />
              </div>
              <div className="col">
                <input
                  type="text"
                  name="billingblock"
                  placeholder="Billing Block"
                  className="form-control"
                  value={newRate.billingblock}
                  onChange={handleCreateChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Add Rate</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserCustomRates;
