import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './RestricNumber.css'; // Import the CSS file (if you're using a separate file)

function RestricNumber() {
  const [phoneData, setPhoneData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restrictionType, setRestrictionType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userRestrict, setUserRestrict] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/agent/affiche')
      .then((response) => {
        setPhoneData(response.data.restrictions);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUser = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/agent/afficheuserRestrict')
      .then((response) => {
        if (Array.isArray(response.data.users)) {
          setUserRestrict(response.data.users);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setError('Error fetching user data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const handleAddRestriction = () => {
    if (!phoneNumber || !restrictionType || !selectedUser) {
      setError('Please enter phone number, restriction type, and select a user.');
      return;
    }

    const data = {
      number: phoneNumber,
      direction: restrictionType,
      id_user: selectedUser,
    };

    setLoading(true);
    axios.post('http://localhost:5000/api/admin/agent/add', data)
      .then(() => {
        toast.success('Restriction added successfully!');
        resetForm();
        fetchData();
      })
      .catch((error) => {
        console.error('Error adding restriction:', error);
        toast.error('Error adding restriction');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteRestriction = (restrictionId) => {
    if (window.confirm('Are you sure you want to delete this restriction?')) {
      setLoading(true);
      axios.delete(http://localhost:5000/api/admin/agent/delete/${restrictionId})
        .then(() => {
          toast.success('Restriction deleted successfully!');
          fetchData();
        })
        .catch((error) => {
          console.error('Error deleting restriction:', error);
          toast.error('Error deleting restriction');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setRestrictionType('');
    setSelectedUser('');
    setShowForm(false);
  };

  // Filtered phone data based on the search term
  const filteredPhoneData = phoneData.filter(item =>
    item.agent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.number.includes(searchTerm)
  );

  const sortedPhoneData = [...filteredPhoneData].sort((a, b) => {
    const aValue = sortDirection === 'asc' ? a.agent.username : b.agent.username;
    const bValue = sortDirection === 'asc' ? b.agent.username : a.agent.username;
    return aValue.localeCompare(bValue);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPhoneData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPhoneData.length / itemsPerPage);

  return (
    <div className="container mt-4">
      <ToastContainer />

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username or phone number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Restriction'}
        </button>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      <div className="mb-3">
        <label htmlFor="itemsPerPage" className="form-label">Items per page:</label>
        <select
          id="itemsPerPage"
          className="form-select"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                Username {sortDirection === 'asc' ? '↑' : '↓'}
              </th>
              <th>Phone Number</th>
              <th>Direction</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((e, i) => (
                <tr key={i}>
                  <td>{e.agent.username}</td>
                  <td>{e.number}</td>
                  <td>{e.direction === 2 ? 'Inbound' : 'Outbound'}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteRestriction(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No Restrictions Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between">
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {showForm && (
        <div className="mt-3">
          <div className="mb-3">
            <label htmlFor="userSelect" className="form-label">Select User:</label>
            <select
              className="form-select"
              id="userSelect"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user</option>
              {userRestrict.length > 0 && userRestrict.map((e, i) => (
                <option key={i} value={e.id}>
                  {e.username}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
            <input
              type="text"
              className="form-control"
              id="phoneNumber"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="restrictionType" className="form-label">Restriction Type:</label>
            <select
              className="form-select"
              id="restrictionType"
              value={restrictionType}
              onChange={(e) => setRestrictionType(e.target.value)}
            >
              <option value="">Select Restriction Type</option>
              <option value="2">Inbound</option>
              <option value="1">Outbound</option>
            </select>
          </div>

          <button
            className="btn btn-success"
            onClick={handleAddRestriction}
            disabled={loading}
          >
            Confirm
          </button>

          {error && <div className="text-danger mt-2">{error}</div>}
          {success && <div className="text-success mt-2">{success}</div>}
        </div>
      )}
    </div>
  );
}

export default RestricNumber;