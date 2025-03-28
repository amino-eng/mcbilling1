import { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { Table, Dropdown, Pagination, Container, Row, Col, Form, Button, Modal, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const IaxTable = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]); // Stocke les utilisateurs SIP
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [hiddenColumns, setHiddenColumns] = useState([
    'Context', 'CallerID', 'Codec', 'NAT', 'Qualify', 'Dtmfmode', 'Insecure', 'Type', 'IP',
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    user_name: '',
    accountcode:'',
    id_user: '',
    secret: '',
    host: 'dynamic',
    ip: '',
    context: 'billing',
    callerid: '',
    allow: 'All',
    nat: 'force,report,comedia',
    qualify: 'no',
    dtmfmode: 'RFC2833',
    insecure: 'no',
    type: 'friend',
    call_limit: 0
  });
  const [formData, setFormData] = useState({
    codecs: ['g729', 'alaw', 'gsm', 'ulaw']
  });
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Récupère les utilisateurs SIP
  const fetchIax = () => {
    axios.get('http://localhost:5000/api/admin/Iax/nom')
      .then((res) => {setUsers(res.data.users)
        console.log(users);
        
      })
      .catch(err => console.log(err));
  };

  // Récupère les données IAX
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/Iax/affiche');
      setData(response.data.iax);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  useEffect(() => {
    fetchIax(); 
    fetchData(); 
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredData = data.filter(item =>
    item.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleColumnVisibility = (column) => {
    setHiddenColumns((prev) =>
      prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
    );
  };

  const columns = [
    'Username', 'IAX User', 'IAX Pass', 'Host', 'IP', 'Context',
    'CallerID', 'Codec', 'NAT', 'Qualify', 'Dtmfmode', 'Insecure', 'Type', 'Actions'
  ];

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
      pageNumbers.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
          {i}
        </Pagination.Item>
      );
    }
    return <Pagination>{pageNumbers}</Pagination>;
  };

  const handleDelete = (id) => {
    setDeleteItemId(id);
  };

  const confirmDelete = async () => {
    if (deleteItemId) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/Iax/delete/${deleteItemId}`);
        setData(data.filter(item => item.id !== deleteItemId)); // Update data after deletion
        setDeleteItemId(null); // Reset delete item
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleAddNew = async () => {
    const generatedPassword = generatePassword();
    setNewEntry({ ...newEntry, secret: generatedPassword });

    try {
      const response = await axios.post('http://localhost:5000/api/admin/Iax/ajouter', { 
        ...newEntry, 
        allow: formData.codecs.join(','),
        secret: generatedPassword // Utiliser le mot de passe généré
      });

      setData([...data, response.data]); // Ajouter la nouvelle entrée à la liste
      setShowAddModal(false); // Fermer le modal
      setNewEntry({
        accountcode: '',
        id_user: '',
        secret: '',
        host: 'dynamic',
        ip: '',
        context: 'billing',
        callerid: '',
        allow: 'All',
        nat: 'force,report,comedia',
        qualify: 'no',
        dtmfmode: 'RFC2833',
        insecure: 'no',
        type: 'friend',
        call_limit: 0
      }); // Réinitialiser le formulaire avec les valeurs par défaut
      setFormData({ codecs: ['g729', 'alaw', 'gsm', 'ulaw'] }); // Réinitialiser les codecs avec les valeurs par défaut
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert("Failed to add the new entry. Please check the console for more details.");
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => {
      const codecs = prev.codecs.includes(value)
        ? prev.codecs.filter((codec) => codec !== value)
        : [...prev.codecs, value];
      return { ...prev, codecs };
    });
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">IAX Table</h2>
      <Row className="mb-3">
        <Col>
          <CSVLink data={data} filename="iax_data.csv" className="btn btn-primary me-2">
            Export CSV
          </CSVLink>
        </Col>
        <Col>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Toggle Columns
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {columns.map((column) => (
                <Dropdown.Item key={column}>
                  <Form.Check
                    inline
                    label={column}
                    type="checkbox"
                    checked={!hiddenColumns.includes(column)}
                    onChange={() => toggleColumnVisibility(column)}
                  />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col>
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            Ajouter
          </Button>
        </Col>
        <Col>
          <Form.Control
            type="text"
            placeholder="Rechercher par username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns.map(
              (column) => !hiddenColumns.includes(column) && <th key={column}>{column}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              {!hiddenColumns.includes('name') && <td>{item.name}</td>}
              {!hiddenColumns.includes('user_name') && <td>{item.user_name}</td>}
              {!hiddenColumns.includes('IAX Pass') && <td>{item.secret}</td>}
              {!hiddenColumns.includes('Host') && <td>{item.host}</td>}
              {!hiddenColumns.includes('IP') && <td>{item.ip}</td>}
              {!hiddenColumns.includes('Context') && <td>{item.context}</td>}
              {!hiddenColumns.includes('CallerID') && <td>{item.callerid}</td>}
              {!hiddenColumns.includes('Codec') && <td>{item.allow}</td>}
              {!hiddenColumns.includes('NAT') && <td>{item.nat}</td>}
              {!hiddenColumns.includes('Qualify') && <td>{item.qualify}</td>}
              {!hiddenColumns.includes('Dtmfmode') && <td>{item.dtmfmode}</td>}
              {!hiddenColumns.includes('Insecure') && <td>{item.insecure}</td>}
              {!hiddenColumns.includes('Type') && <td>{item.type}</td>}
              <td>
                <Button variant="danger" onClick={() => handleDelete(item.id)}>
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center">
        {renderPagination()}
      </div>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un nouvel utilisateur IAX</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Tabs defaultActiveKey="General" className="mb-3">
              <Tab eventKey="General" title="General">
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    as="select"
                    value={newEntry.user_name}
                    onChange={(e) => setNewEntry({ ...newEntry, user_name: e.target.value,accountcode: e.target.value})}
                  >
                    {users.map((user) => (
                      <option key={user.username} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formIAXUser">
                  <Form.Label>IAX User</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEntry.iax_user}
                    onChange={(e) => setNewEntry({ ...newEntry, iax_user: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="formIAXPass">
                  <Form.Label>IAX Password</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEntry.secret}
                    onChange={(e) => setNewEntry({ ...newEntry, secret: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="formDisallow">
                  <Form.Label>Disallow</Form.Label>
                  <Form.Control type="text" value="All" />
                </Form.Group>
                <Form.Group controlId="formHost">
                  <Form.Label>Host</Form.Label>
                  <Form.Control type="text" value="dynamic"  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Codecs</Form.Label>
                  <div className="row">
                    {['g729', 'g726', 'ulaw', 'speex', 'h264', 'g723', 'opus', 'g722', 'h263p', 'vp8', 'gsm', 'alaw', 'ilbc', 'h263'].map(codec => (
                      <div className="col-4" key={codec}>
                        <Form.Check
                          type="checkbox"
                          label={codec}
                          name="codecs"
                          value={codec}
                          onChange={handleChange}
                          checked={formData.codecs.includes(codec)}
                        />
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Tab>
              <Tab eventKey="NAT details" title="NAT details">
                <Form.Group controlId="formNAT">
                  <Form.Label>NAT</Form.Label>
                  <Form.Control type="text" value="force,report,comedia"  />
                </Form.Group>
              </Tab>
              <Tab eventKey="Supplementary info" title="Supplementary info">
                <Form.Group controlId="formContext">
                  <Form.Label>Context</Form.Label>
                  <Form.Control type="text" value="billing"  />
                </Form.Group>
                <Form.Group controlId="formQualify">
                  <Form.Label>Qualify</Form.Label>
                  <Form.Control
                    as="select"
                    value={newEntry.qualify || 'no'} // Set the default value to 'no'
                    onChange={(e) => setNewEntry({ ...newEntry, qualify: e.target.value })}
                  >
                    <option value="no">No</option>
                    <option value="yes">yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formDtmfmode">
                  <Form.Label>Dtmfmode</Form.Label>
                  <Form.Control type="text" value="RFC2833"  />
                </Form.Group>
                <Form.Group controlId="formInsecure">
                  <Form.Label>Insecure</Form.Label>
                  <Form.Control type="text" value="no"  />
                </Form.Group>
                <Form.Group controlId="formType">
                  <Form.Label>Type</Form.Label>
                  <Form.Control type="text" value="friend"  />
                </Form.Group>
                <Form.Group controlId="formCallLimit">
                  <Form.Label>Call Limit</Form.Label>
                  <Form.Control type="number" value={0}  />
                </Form.Group>
              </Tab>
            </Tabs>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleAddNew}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={deleteItemId !== null} onHide={() => setDeleteItemId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer cet élément ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteItemId(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IaxTable;