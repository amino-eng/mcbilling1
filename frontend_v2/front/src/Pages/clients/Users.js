import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Dropdown, Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { FaChevronDown,FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([
    'username', 'credit',  'active', 'creationdate'
  ]);
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
    description: ''
  });

  const [groups, setGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal de confirmation
  const [userIdToDelete, setUserIdToDelete] = useState(null); // ID de l'utilisateur à supprimer

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

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
  
    const userData = {
      username: newUser.username,
      password: newUser.password,
      id_group: newUser.group,
      id_plan: newUser.plan,
      language: newUser.language,
      active: newUser.status === 'Active' ? 1 : 0,
      email: newUser.email, 
      id_user: newUser.id
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
        description: ''
      });
  
    } catch (error) {
      console.error('Error adding user:', error);
    }
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

      <Modal show={showForm} onHide={() => setShowForm(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>New User</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleNewUserSubmit}>
            <Tabs defaultActiveKey="General" className='mb-3'>
              <Tab eventKey="General" title="General">
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" name="username" value={newUser.username} onChange={handleNewUserChange} required />
                </Form.Group>

                <Form.Group controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" value={newUser.password} onChange={handleNewUserChange} required />
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
                    <option value="Blocked In">Blocked In</option>
                    <option value="Blocked In Out">Blocked In Out</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCountry">
                  <Form.Label>Country</Form.Label>
                  <Form.Control as="Select" name="country" value={newUser.country} onChange={handleNewUserChange}>
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
              </Tab>
              {/* Add additional tabs as needed */}
            </Tabs>
            <Button variant="primary" type="submit">
              Add User
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation de suppression */}
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
        {users.map((user, index) => (
  <tr key={index}>
    {selectedColumns.map((col, idx) => (
      <td key={idx}>
        {col === "creationdate" && user[col]
          ? new Date(user[col]).toLocaleString() 
          : col === "active" // Check if the column is 'active'
            ? (user[col] === 1 
                ? <FaCheckCircle color="green" /> // Active icon
                : <FaTimesCircle color="red" />) // Not active icon
            : user[col] !== null && user[col] !== undefined
              ? user[col].toString()
              : 'vide!'}
      </td>
    ))}
    <td>
      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
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