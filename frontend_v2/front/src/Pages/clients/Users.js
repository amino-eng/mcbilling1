import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Dropdown, Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { FaChevronDown, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaLock, FaUnlock, FaEdit, FaTrash } from 'react-icons/fa';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // État pour les utilisateurs filtrés
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // État pour le terme de recherche
  const [selectedColumns, setSelectedColumns] = useState(['username', 'credit', 'active', 'creationdate']);
  const [numberOfSipUsers, setNumberOfSipUsers] = useState(1);
  const [numberOfIax, setNumberOfIax] = useState(2);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    group: '',
    plan: '',
    language: 'fr',
    status: 'Active',
    country: 'United States/Canada',
    description: '',
  });
  const [groups, setGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [errors, setErrors] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
        setFilteredUsers(response.data.users); // Initialiser les utilisateurs filtrés
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

  // Fonction pour gérer le changement de terme de recherche
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Filtrer les utilisateurs en fonction du terme de recherche
    const filtered = users.filter(user =>
      Object.values(user).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Réinitialiser la pagination
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser); // Utiliser les utilisateurs filtrés

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / itemsPerPage)) {
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
    ].join('\n'); // Fixed: Use '\n' instead of `
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

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      username: newUser.username,
      password: newUser.password,
      id_group: newUser.group,
      id_plan: newUser.plan,
      language: newUser.language,
      active: newUser.status === 'Active' ? 1 : 0,
      email: newUser.email,
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log('User updated:', result);
      fetchUsers();
      setShowForm(false);
      setNewUser({
        username: '',
        password: '',
        group: '',
        plan: '',
        language: 'fr',
        status: 'Active',
        country: 'United States/Canada',
        description: ''
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    const statusMapping = {
      'Active': 1,
      'Inactive': 0,
      'Pending': 2,
      'Blocked': 3,
      'Blocked In Out': 4
    };
    const activeStatus = statusMapping[newUser.status] !== undefined ? statusMapping[newUser.status] : 0;
    const userData = {
      username: newUser.username,
      password: newUser.password,
      id_group: newUser.group,
      id_plan: newUser.plan,
      language: newUser.language,
      active: activeStatus,
      email: newUser.email,
      numberOfSipUsers: numberOfSipUsers,
      numberOfIax: newUser.numberOfIax,
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
      const result = await response.json();
      console.log('User added:', result);
      fetchUsers();
      setShowForm(false);
      setNewUser({
        username: '',
        password: '',
        group: '',
        plan: '',
        language: 'English',
        status: 'Active',
        description: '',
        numberOfIax: 0,
      });
      setNumberOfSipUsers(1);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEdit = (id) => {
    const userToEdit = users.find(user => user.id === id);
    setNewUser(userToEdit);
    setShowForm(true);
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

      {/* Barre de recherche */}
      <Form.Group controlId="formSearch" className="mb-3">
        <Form.Label>Rechercher un utilisateur</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrez un nom, email, ou autre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Form.Group>

      <Modal show={showForm} onHide={() => setShowForm(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>{newUser.id ? 'Edit User' : 'New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleNewUserSubmit}>
            <Tabs defaultActiveKey="General" className='mb-3'>
              <Tab eventKey="General" title="General">
                <Form.Group controlId="formUsername">
                  {errors && <h1>{errors}</h1>}
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
                  <Form.Control
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    required
                  />
                  {(newUser.password.length < 8 || newUser.password.length > 12) && (
                    <Form.Text className="text-danger">
                      Password must be between 8 and 12 characters long.
                    </Form.Text>
                  )}
                </Form.Group>
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
                <Form.Group controlId="formLanguage">
                  <Form.Label>Language</Form.Label>
                  <Form.Control as="select" name="language" onChange={handleNewUserChange} required>
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
                    onChange={(e) => setNewUser(prev => ({ ...prev, numberOfIax: parseInt(e.target.value, 10) }))}
                    min="0"
                    required
                  />
                </Form.Group>
              </Tab>
              <Tab eventKey="Personal Data" title="Personal">
                <Form.Group controlId="formCompanyWebsite">
                  <Form.Label>Company website</Form.Label>
                  <Form.Control type="text" name="company_website" value={newUser.company_website || ''} onChange={handleNewUserChange} />
                </Form.Group>
                <Form.Group controlId="formCompanyName">
                  <Form.Label>Company name</Form.Label>
                  <Form.Control type="text" name="company_name" value={newUser.company_name || ''} onChange={handleNewUserChange} />
                </Form.Group>
                <Form.Group controlId="formCommercialName">
                  <Form.Label>Commercial name</Form.Label>
                  <Form.Control type="text" name="commercial_name" value={newUser.commercial_name || ''} onChange={handleNewUserChange} />
                </Form.Group>
              </Tab>
              <Tab eventKey="Supplementary Info" title="Supplementary Info">
                <Form.Group controlId="formTypePaid">
                  <Form.Label>Type paid</Form.Label>
                  <Form.Control as="select" name="type_paid" value={newUser.type_paid || ''} onChange={handleNewUserChange}>
                    <option value="Prepaid">Prepaid</option>
                    <option value="Postpaid">Postpaid</option>
                  </Form.Control>
                </Form.Group>
              </Tab>
            </Tabs>
            <Button variant="primary" type="submit">
              {newUser.id ? 'Update User' : 'Add User'}
            </Button>
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
                  {col === "creationdate" && user[col]
                    ? new Date(user[col]).toLocaleString()
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
        <span className="mx-3">Page {currentPage}</span>
        <Button variant="secondary" onClick={nextPage} disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default Users;