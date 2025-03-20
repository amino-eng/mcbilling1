import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Dropdown, Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { FaChevronDown, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaLock, FaUnlock, FaEdit, FaTrash } from 'react-icons/fa';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumns, setSelectedColumns] = useState(['username', 'credit', 'active', 'creationdate']);
  const [numberOfSipUsers, setNumberOfSipUsers] = useState(1);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    group: '',
    plan: '',
    language: 'fr',
    status: '',
    country: 'United States/Canada',
    description: '',
    numberOfIax: 1, // Default value set to 1
  });
  const [groups, setGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [errors, setErrors] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showPassword, setShowPassword] = useState(false);

  const availableColumns = [
    'username', 'credit', 'plan_name', 'group_name', 'agent', 'active', 'creationdate',
    'sip_count', 'email', 'phone', 'address', 'city', 'lastname', 'firstname', 'mobile',
    'email2', 'vat', 'company_name', 'company_website', 'lastusedate', 'expirationdate',
    'contract_value', 'last_login', 'googleAuthenticator_enable', 'callingcard_pin',
    'description', 'last_notification'
  ];

  const fetchGroup = () => {
    axios.get('http://localhost:5000/api/admin/users/groups')
      .then(response => {
        setGroups(response.data.groups);
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
        setError('Erreur lors de la récupération des groupes');
      });
  };

  const fetchPlan = () => {
    axios.get('http://localhost:5000/api/admin/users/plans')
      .then(response => {
        setPlans(response.data.plans);
      })
      .catch(err => {
        console.error('Error fetching plans:', err);
        setError('Erreur lors de la récupération des plans');
      });
  };

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/admin/users/users')
      .then(response => {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Erreur lors de la récupération des utilisateurs');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    fetchGroup();
    fetchPlan();
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(term) // Only filter by username
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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

  const handleDelete = (id) => {
    setUserIdToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:5000/api/admin/users/supprimer/${userIdToDelete}`)
      .then(() => {
        fetchUsers();
        setShowConfirmModal(false);
      })
      .catch(err => console.log(err));
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prevState => ({ ...prevState, [name]: value }));
  };

  const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();

    if (!newUser.password) {
      newUser.password = generateRandomPassword();
    }

    const statusMapping = {
      'Active': 1,
      'Inactive': 0,
      'Pending': 2,
      'Blocked': 3,
      'Blocked In Out': 4,
    };
    const activeStatus = statusMapping[newUser.status] != null ? statusMapping[newUser.status] : 0; 
    const userData = {
      username: newUser.username,
      password: newUser.password,
      id_group: newUser.group,
      id_plan: newUser.plan,
      language: newUser.language,
      active: activeStatus,
      email: newUser.email,
      numberOfSipUsers: numberOfSipUsers,
      numberOfIax: newUser.numberOfIax, // Use updated number of Iax
    };

    try {
      const response = await fetch('http://localhost:5000/api/admin/users/ajouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        setErrors("SIP user already exists");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      fetchUsers();
      setShowForm(false);
      resetNewUser();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEdit = (id) => {
    const userToEdit = users.find(user => user.id === id);
    setNewUser(userToEdit);
    setShowForm(true);
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();

    const statusMapping = {
      'Active': 1,
      'Inactive': 0,
      'Pending': 2,
      'Blocked': 3,
      'Blocked In Out': 4,
    };
    const activeStatus = statusMapping[newUser.status] != null ? statusMapping[newUser.status] : 0;

    const userData = {
      username: newUser.username,
      password: newUser.password ? newUser.password : undefined,
      language: newUser.language,
      active: activeStatus,
      id_group: newUser.group,
      id_plan: newUser.plan,
      numberOfSipUsers: numberOfSipUsers,
      numberOfIax: newUser.numberOfIax, // Use updated number of Iax
    };

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/modifier/${newUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.error || "Error updating user");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      fetchUsers();
      setShowForm(false);
      resetNewUser();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const resetNewUser = () => {
    setNewUser({
      username: '',
      password: '',
      group: '',
      plan: '',
      language: 'English',
      status: '',
      description: '',
      numberOfIax: 1, // Reset to default value
    });
    setNumberOfSipUsers(1);
  };

  const handleCancel = () => {
    resetNewUser();
    setShowForm(false);
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
      <div className="mb-3 text-end">
        <Button variant="primary" onClick={() => setShowForm(true)}>
          New User
        </Button>
        <Button className="ms-2" variant="success" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>

      <Form.Group controlId="formSearch" className="mb-3">
        <Form.Label>Rechercher un utilisateur par username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrez un nom d'utilisateur..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Form.Group>

      <Modal show={showForm} onHide={handleCancel} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>{newUser.id ? 'Edit User' : 'New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={newUser.id ? handleUpdateUserSubmit : handleNewUserSubmit}>
            <Tabs defaultActiveKey="General" className='mb-3'>
              <Tab eventKey="General" title="General">
                {errors && <h1>{errors}</h1>}
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={newUser.username}
                    onChange={handleNewUserChange}
                    required
                  />
                  {newUser.username.trim().length < 6 && (
                    <Form.Text className="text-danger">
                      Username must be at least 6 characters long.
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={newUser.password}
                      onChange={handleNewUserChange}
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                  {(newUser.password.length < 8 || newUser.password.length > 12) && (
                    <Form.Text className="text-danger">
                      Password must be between 8 and 12 characters long.
                    </Form.Text>
                  )}
                </Form.Group>
                {!newUser.id && ( 
                  <>
                    <Form.Group controlId="formGroup">
                      <Form.Label>Group</Form.Label>
                      <Form.Select
                        name="group"
                        value={newUser.group}
                        onChange={handleNewUserChange} required
                      >
                        <option value="">Select a group</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="formPlan">
                      <Form.Label>Plan</Form.Label>
                      <Form.Select
                        name="plan"
                        value={newUser.plan}
                        onChange={handleNewUserChange} required
                      >
                        <option value="">Select a plan</option>
                        {plans.map(plan => (
                          <option key={plan.id} value={plan.name}>
                            {plan.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </>
                )}
                <Form.Group controlId="formLanguage">
                  <Form.Label>Language</Form.Label>
                  <Form.Control as="select" name="language" value={newUser.language} onChange={handleNewUserChange} required>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="sp">Spanish</option>
                    <option value="it">Portuguese</option>
                    <option value="rs">Russian</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Control as="select" name="status" value={newUser.status} onChange={handleNewUserChange} required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Blocked In Out">Blocked In Out</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formCountry">
                  <Form.Label>Country</Form.Label>
                  <Form.Control as="select" name="country" value={newUser.country} onChange={handleNewUserChange}>
                    <option value="United States/Canada">United States/Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Spain">Spain</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control type="text" name="description" value={newUser.description} onChange={handleNewUserChange} />
                </Form.Group>
                <Form.Group controlId="formNumberOfSipUsers">
                  <Form.Label>Number of SIP Users</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfSipUsers"
                    value={numberOfSipUsers}
                    onChange={(e) => setNumberOfSipUsers(parseInt(e.target.value, 10))}
                    min="0"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formNumberOfIax">
                  <Form.Label>Number of Iax</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfIax"
                    value={newUser.numberOfIax} // Use updated number of Iax
                    onChange={(e) => setNewUser(prev => ({ ...prev, numberOfIax: parseInt(e.target.value, 10) }))}
                    min="0"
                    required
                  />
                </Form.Group>
              </Tab>
            </Tabs>
            <Button variant="primary" type="submit">
              {newUser.id ? 'Update User' : 'Add User'}
            </Button>
            {newUser.id && (
              <Button variant="secondary" onClick={handleCancel} className="ms-2">
                Cancel
              </Button>
            )}
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
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
          {currentUsers.map((user, index) => (
            <tr key={index}>
              {selectedColumns.map((col, idx) => (
                <td key={idx}>
                  {col === "creationdate" && user[col] ? new Date(user[col]).toLocaleString()
                    : col === "active"
                    ? user[col] === 1 ? <FaCheckCircle color="green" title="Active" />
                    : user[col] === 0 ? <FaTimesCircle color="red" title="Inactive" />
                    : user[col] === 2 ? <FaExclamationCircle color="orange" title="Pending" />
                    : user[col] === 3 ? <FaLock color="blue" title="Blocked" />
                    : user[col] === 4 ? <FaUnlock color="purple" title="Blocked In Out" />
                    : 'Unknown Status'
                  : user[col] !== null && user[col] !== undefined
                  ? user[col].toString()
                  : 'vide!'}
                </td>
              ))}
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(user.id)}>
                  <FaEdit />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center mt-3">
        <Button variant="secondary" onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span className="mx-3">Page {currentPage} of {totalPages}</span>
        <Button variant="secondary" onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default Users;