import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Dropdown, Modal, Button, Form, Tabs, Tab, FormGroup } from 'react-bootstrap';
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
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    group: '',
    plan: '',
    language: 'English',
    status: 'Active',
    country: 'United States/Canada',
    description: ''
  });

  const [groups, setGroups] = useState([]);  // Corrected here
  const [plans, setPlans] = useState([]);  // Corrected here

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

  const handleDelete = () => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== confirmDeleteId));
    setShowModal(false);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prevState => ({ ...prevState, [name]: value }));
  };

  const handleNewUserSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the new user data to your API
    setUsers(prevUsers => [...prevUsers, { ...newUser, id: users.length + 1 }]);
    setShowForm(false);
    setNewUser({
      username: '',
      password: '',
      group: '',
      plan: '',
      language: 'English',
      status: 'Active',
      country: 'United States/Canada',
      description: ''
    });
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

      {/* New User Button */}
      <div className="mb-3 text-end">
        <Button variant="primary" onClick={() => setShowForm(true)}>
          New User
        </Button>
        <Button className="ms-2" variant="success" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>

      {/* New User Form */}
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
                    onChange={handleNewUserChange}
                  >
                    <option value="">Select a group</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.name}>
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
                    onChange={handleNewUserChange}
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
                  <Form.Control as="select" name="language" value={newUser.language} onChange={handleNewUserChange}>
                    <option value="English">Undefined</option>
                    <option value="French">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Italian">Portuguese</option>
                    <option value="Russian">Russian</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formUsername">
                  <Form.Label>Prefix rules</Form.Label>
                  <Form.Control type="text" name="username" value={newUser.username} onChange={handleNewUserChange} required />
                </Form.Group>
                <Form.Group controlId="formUsername">
                  <Form.Label>Status</Form.Label>
                  <Form.Control as="select" name="status" value={newUser.status} onChange={handleNewUserChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked In">Blocked In</option>
                    <option value="Blocked In Out">Blocked In Out</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formUsername">
                  <Form.Label>country</Form.Label>
                  <Form.Control as="Select" name="country" value={newUser.country} on change={handleNewUserChange}>
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

                <Form.Group controlId="formUsername">
                  <Form.Label>Activate offer </Form.Label>
                  <Form.Control as="Select" name="Activate offer" value={newUser.country} on change={handleNewUserChange}>
                    <option value="Undefined">Undefined</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formUsername">
                  <Form.Label>Description</Form.Label>
                  <Form.Control type="text" name="username" value={newUser.username} onChange={handleNewUserChange} required />
                </Form.Group>
              </Tab>
<Tab eventKey="personal Data " title="Personal">
  <Form.Group 
    controlId="formUsercomany">
                  <Form.Label>Company website</Form.Label>
                  <Form.Control type="text" name="company" value={newUser.company} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUsercomany">
                  <Form.Label>Company name</Form.Label>
                  <Form.Control type="text" name="company" value={newUser.company} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUsercommercial">
                  <Form.Label>Commercial name</Form.Label>
                  <Form.Control type="text" name="commercial" value={newUser.company} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserstate">
                  <Form.Label>State number</Form.Label>
                  <Form.Control type="text" name="state" value={newUser.company} onChange={handleNewUserChange} required />         
  </Form.Group>

 
  <Form.Group 
    controlId="formUserfirstname">
                  <Form.Label>First name</Form.Label>
                  <Form.Control type="text" name="lastname" value={newUser.firstname} onChange={handleNewUserChange} required />         
  </Form.Group>

  
  <Form.Group 
    controlId="formUsercity">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" name="lastname" value={newUser.city} onChange={handleNewUserChange} required />         
  </Form.Group>

  
  <Form.Group 
    controlId="formUseradresse">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control type="text" name="Adresse" value={newUser.adresse} onChange={handleNewUserChange} required />         
  </Form.Group>

  
  <Form.Group 
    controlId="formUserState">
                  <Form.Label>State</Form.Label>
                  <Form.Control type="text" name="State" value={newUser.State} onChange={handleNewUserChange} required />         
  </Form.Group>


  <Form.Group 
    controlId="formUserNeighborhood">
                  <Form.Label>Neighborhood</Form.Label>
                  <Form.Control type="text" name="Neighborhood" value={newUser.Neighborhood} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserZipcode">
                  <Form.Label>Zip code</Form.Label>
                  <Form.Control type="text" name="Zipcode" value={newUser.Zipcode} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserPhone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" name="Phone" value={newUser.Phone} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserMobile">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control type="text" name="Mobile" value={newUser.Mobile} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="text" name="Email" value={newUser.Email} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserEmail2 ">
                  <Form.Label>Email 2</Form.Label>
                  <Form.Control type="text" name="Email" value={newUser.Email} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserDOC">
                  <Form.Label>DOC</Form.Label>
                  <Form.Control type="text" name="DOC" value={newUser.DOC} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserVAT">
                  <Form.Label>VAT</Form.Label>
                  <Form.Control type="text" name="DOC" value={newUser.VAT} onChange={handleNewUserChange} required />         
  </Form.Group>

  <Form.Group 
    controlId="formUserContractvalue">
                  <Form.Label>Contract value</Form.Label>
                  <Form.Control type="text" name="Contract value" value={newUser.Contractvalue} onChange={handleNewUserChange} required />     
                      
  </Form.Group>

  <Form.Group 
    controlId="formUserDIST">
                  <Form.Label>DIST</Form.Label>
                  <Form.Control type="text" name="DIST" value={newUser.DIST} onChange={handleNewUserChange} required />         
  </Form.Group>
  
  
  

  
</Tab>
            
            <Tab eventKey="Supplementary info " title="Supplementary info">
            <Form.Group 
            controlId="formUserDIST">
                  <Form.Label>Type paid</Form.Label>
                  <Form.Control type="text" name="DIST" value={newUser.DIST} onChange={handleNewUserChange} required />
            </Form.Group>

              </Tab>
               </Tabs>
              

           
              {/* Other form fields... */}
              <Button variant="primary" type="submit">
                Add User
              </Button>
          </Form>
        </Modal.Body>
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