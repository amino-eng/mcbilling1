import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Dropdown } from 'react-bootstrap';
import { FaChevronDown } from 'react-icons/fa';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([
    'username', 'credit', 'plan_name', 'group_name', 'agent', 'active', 'creationdate', 'sip_count'
  ]);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const availableColumns = [
    'username', 'credit', 'plan_name', 'group_name', 'agent', 'active', 'creationdate', 
    'sip_count', 'email', 'phone', 'address', 'city', 'lastname', 'firstname', 'mobile', 'email2', 'vat', 'company_name', 
    'company_website', 'lastusedate', 'expirationdate', 'contract_value', 'last_login', 'googleAuthenticator_enable', 
    'callingcard_pin', 'description', 'last_notification'
  ];

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/users/users')
      .then(response => {
        setUsers(response.data.users);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Erreur lors de la récupération des utilisateurs');
        setLoading(false);
      });
  }, []);

  const handleColumnChange = (column) => {
    if (!selectedColumns.includes(column)) {
      setSelectedColumns(prevColumns => [...prevColumns, column]);
    }
  };

  const toggleDropdown = (column) => {
    setDropdownVisibility(prevState => ({
      ...prevState,
      [column]: !prevState[column]
    }));
  };

  const exportToCSV = () => {
    const csvContent = [
      selectedColumns.join(','), 
      ...users.map(user => selectedColumns.map(col => user[col] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = () => {
    console.log('Deleting user with ID:', confirmDeleteId);
    setUsers(prevUsers => prevUsers.filter(user => user.id !== confirmDeleteId));
    setShowModal(false);
  };

  if (loading) {
    return <div className="alert alert-info text-center">Chargement des utilisateurs...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  if (users.length === 0) {
    return <div className="alert alert-warning text-center">Aucun utilisateur trouvé</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Liste des utilisateurs</h1>

      {/* Export Button */}
      <div className="mb-3 text-end">
        <button className="btn btn-success" onClick={exportToCSV}>
          Export to CSV
        </button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {selectedColumns.map((col, index) => (
              <th key={index} onClick={() => toggleDropdown(col)} style={{ position: 'relative', cursor: 'pointer' }}>
                {col} <FaChevronDown style={{ marginLeft: '5px' }} />
                {dropdownVisibility[col] && (
                  <Dropdown.Menu show style={{ position: 'absolute' }}>
                    {availableColumns.map((item) => (
                      !selectedColumns.includes(item) && (
                        <Dropdown.Item key={item} onClick={() => handleColumnChange(item)}>
                          {item}
                        </Dropdown.Item>
                      )
                    ))}
                  </Dropdown.Menu>
                )}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              {selectedColumns.map((col, idx) => (
                <td key={idx}>
                  {col === "creationdate" && user[col] 
                    ? new Date(user[col]).toLocaleString()  // Converts UTC to local time
                    : user[col] !== null && user[col] !== undefined 
                      ? user[col].toString() 
                      : 'vide!'}
                </td>
              ))}
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => {
                  setConfirmDeleteId(user.id);
                  setShowModal(true);
                }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Users;
