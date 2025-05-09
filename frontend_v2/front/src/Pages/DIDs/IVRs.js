import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Table, Alert, Button, Form, Modal, Tabs, Tab, Container } from 'react-bootstrap';

const IvrTable = () => {
  const [ivrs, setIvrs] = useState([]);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [visibleColumns, setVisibleColumns] = useState({
    ID: false,
    Utilisateur: true,
    Nom: true,
    'Début Semaine': false,
    'Début Samedi': false,
    'Début Dimanche': false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // New state for edit modal
  const [editIvr, setEditIvr] = useState(null); // State for the IVR being edited
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [monFriStart, setMonFriStart] = useState('09:00-12:00|14:00-20:00');
  const [satStart, setSatStart] = useState('09:00-12:00');
  const [sunStart, setSunStart] = useState('09:00-12:00');
  const [useHolidays, setUseHolidays] = useState('00:00');
  const [options, setOptions] = useState([
    { value: 'Undefined', label: 'Undefined' },
    { value: 'SIP', label: 'SIP' },
    { value: 'IVR', label: 'IVR' },
    { value: 'Queue', label: 'Queue' },
    { value: 'Group', label: 'Group' },
    { value: 'Number', label: 'Number' },
    { value: 'Repeat_ivr', label: 'Repeat_ivr' },
    { value: 'Hangup', label: 'Hangup' },
    { value: 'Custom', label: 'Custom' },
  ]);
  const [selectedOptions, setSelectedOptions] = useState(Array(10).fill(''));
  const [unavailableOptions, setUnavailableOptions] = useState([]);
  const [users, setUsers] = useState([]);

  const apiUrl = 'http://localhost:5000/api/admin/IVRs/affiche';
  const addIvrUrl = 'http://localhost:5000/api/admin/IVRs/add';

  const fetchUsers = () => {
    axios
      .get('http://localhost:5000/api/admin/users/users')
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
      });
  };

  useEffect(() => {
    const fetchIVRs = async () => {
      try {
        const response = await axios.get(apiUrl);
        if (response.data.ivrs) {
          setIvrs(response.data.ivrs);
        } else {
          setMessage('Aucun IVR trouvé');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des IVRs :', error);
        setMessage('Échec du chargement des données');
      }
    };

    fetchIVRs();
    fetchUsers();
  }, []);

  const filteredIVRs = ivrs.filter(
    (ivr) =>
      ivr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ivr.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCSVExport = () => {
    const headers = Object.keys(visibleColumns).filter((key) => visibleColumns[key]);
    const csvRows = [
      headers.join(','),
      ...ivrs.map((ivr) =>
        headers
          .map((column) => {
            switch (column) {
              case 'ID':
                return ivr.id;
              case 'Utilisateur':
                return ivr.username;
              case 'Nom':
                return ivr.name;
              case 'Début Semaine':
                return ivr.monFriStart;
              case 'Début Samedi':
                return ivr.satStart;
              case 'Début Dimanche':
                return ivr.sunStart;
              default:
                return '';
            }
          })
          .join(','),
      ),
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ivrs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = async (ivr) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/IVRs/get/${ivr.id}`);
      const ivrData = response.data.ivr;
  
      setEditIvr(ivrData);
      setName(ivrData.name);
      setUserId(ivrData.id_user);
      setMonFriStart(ivrData.monFriStart);
      setSatStart(ivrData.satStart);
      setSunStart(ivrData.sunStart);
      setShowEditModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'IVR :', error);
      setMessage('Échec de la récupération de l\'IVR pour modification');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newIvr = {
      id_user: userId,
      name: name,
      monFriStart: monFriStart,
      satStart: satStart,
      sunStart: sunStart,
      use_holidays: useHolidays,
      options: selectedOptions.map((option) => ({ option })),
    };

    try {
      if (editIvr) {
        const response = await axios.put(`http://localhost:5000/api/admin/IVRs/modify/${editIvr.id}`, newIvr);
        if (response.data.message) {
          setMessage('IVR modifié avec succès'); // Success message for modification
        }
      } else {
        const response = await axios.post(addIvrUrl, newIvr);
        if (response.data.message) {
          setMessage('IVR ajouté avec succès'); // Success message for addition
        }
      }
      const fetchResponse = await axios.get(apiUrl);
      setIvrs(fetchResponse.data.ivrs);
    } catch (error) {
      console.error('Erreur lors de l\'ajout ou de la modification de l\'IVR :', error);
      setMessage('Échec de l\'ajout ou de la modification de l\'IVR'); // General error message
    }

    // Reset states after submission
    setName('');
    setUserId('');
    setMonFriStart('');
    setSatStart('');
    setSunStart('');
    setUseHolidays('00:00');
    setSelectedOptions(Array(10).fill(''));
    setEditIvr(null);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIVRs = filteredIVRs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container>
      <h1 className="mt-5">Liste des IVRs</h1>

      {message && <Alert variant="info">{message}</Alert>}

      <div className="mb-3 d-flex gap-2">
        <Button variant="success" onClick={handleCSVExport}>
          Exporter en CSV
        </Button>
        <Button variant="secondary" onClick={() => setShowColumnSelector(!showColumnSelector)}>
          Masquer Colonnes
        </Button>
        <Button variant="primary" onClick={handleAddClick}>
          Ajouter
        </Button>
      </div>

      {showColumnSelector && (
        <div className="mb-3 p-3 border rounded">
          <h5>Choisir les colonnes à afficher :</h5>
          {Object.keys(visibleColumns).map((column) => (
            <Form.Check
              key={column}
              type="checkbox"
              label={column}
              checked={visibleColumns[column]}
              onChange={() => handleColumnToggle(column)}
            />
          ))}
        </div>
      )}

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Rechercher par nom ou utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un IVR</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="General" className="mb-3">
            <Tab eventKey="General" title="General">
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Form.Label>Utilisateur</Form.Label>
                <Form.Select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Intervalles en semaine</Form.Label>
                <Form.Control
                  type="text"
                  value={monFriStart}
                  onChange={(e) => setMonFriStart(e.target.value)}
                  required
                />
                <Form.Label>Intervalles le samedi</Form.Label>
                <Form.Control
                  type="text"
                  value={satStart}
                  onChange={(e) => setSatStart(e.target.value)}
                  required
                />
                <Form.Label>Intervalles le dimanche</Form.Label>
                <Form.Control
                  type="text"
                  value={sunStart}
                  onChange={(e) => setSunStart(e.target.value)}
                  required
                />
                <Form.Label>Utiliser les jours fériés</Form.Label>
                <Form.Select
                  value={useHolidays}
                  onChange={(e) => setUseHolidays(e.target.value)}
                  required
                >
                  <option value="00:00">Non</option>
                  <option value="01:00">Oui</option>
                </Form.Select>
              </Form.Group>
            </Tab>
            <Tab eventKey="Options" title="Options disponibles">
              {Array.from({ length: 10 }).map((_, index) => (
                <Form.Group key={index} controlId={`formOption${index}`} className="mb-3">
                  <Form.Label>Option {index}</Form.Label>
                  <Form.Select
                    value={selectedOptions[index]}
                    onChange={(e) => {
                      const newOptions = [...selectedOptions];
                      newOptions[index] = e.target.value;
                      setSelectedOptions(newOptions);
                    }}
                  >
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              ))}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier un IVR</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="General" className="mb-3">
            <Tab eventKey="General" title="General">
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Form.Label>Utilisateur</Form.Label>
                <Form.Select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Intervalles en semaine</Form.Label>
                <Form.Control
                  type="text"
                  value={monFriStart}
                  onChange={(e) => setMonFriStart(e.target.value)}
                  required
                />
                <Form.Label>Intervalles le samedi</Form.Label>
                <Form.Control
                  type="text"
                  value={satStart}
                  onChange={(e) => setSatStart(e.target.value)}
                  required
                />
                <Form.Label>Intervalles le dimanche</Form.Label>
                <Form.Control
                  type="text"
                  value={sunStart}
                  onChange={(e) => setSunStart(e.target.value)}
                  required
                />
                <Form.Label>Utiliser les jours fériés</Form.Label>
                <Form.Select
                  value={useHolidays}
                  onChange={(e) => setUseHolidays(e.target.value)}
                  required
                >
                  <option value="00:00">Non</option>
                  <option value="01:00">Oui</option>
                </Form.Select>
              </Form.Group>
            </Tab>
            <Tab eventKey="Options" title="Options disponibles">
              {Array.from({ length: 10 }).map((_, index) => (
                <Form.Group key={index} controlId={`formOption${index}`} className="mb-3">
                  <Form.Label>Option {index}</Form.Label>
                  <Form.Select
                    value={selectedOptions[index]}
                    onChange={(e) => {
                      const newOptions = [...selectedOptions];
                      newOptions[index] = e.target.value;
                      setSelectedOptions(newOptions);
                    }}
                  >
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              ))}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>

      <Table striped bordered hover>
        <thead>
          <tr>
            {visibleColumns.ID && <th>ID</th>}
            {visibleColumns.Utilisateur && <th>Utilisateur</th>}
            {visibleColumns.Nom && <th>Nom</th>}
            {visibleColumns['Début Semaine'] && <th>Début Semaine</th>}
            {visibleColumns['Début Samedi'] && <th>Début Samedi</th>}
            {visibleColumns['Début Dimanche'] && <th>Début Dimanche</th>}
            <th>Actions</th> {/* New column for actions */}
          </tr>
        </thead>
        <tbody>
          {currentIVRs.map((ivr) => (
            <tr key={ivr.id}>
              {visibleColumns.ID && <td>{ivr.id}</td>}
              {visibleColumns.Utilisateur && <td>{ivr.username}</td>}
              {visibleColumns.Nom && <td>{ivr.name}</td>}
              {visibleColumns['Début Semaine'] && <td>{ivr.monFriStart}</td>}
              {visibleColumns['Début Samedi'] && <td>{ivr.satStart}</td>}
              {visibleColumns['Début Dimanche'] && <td>{ivr.sunStart}</td>}
              <td>
                <Button variant="warning" onClick={() => handleEditClick(ivr)}>
                  Modifier
                </Button>
                {/* Additional delete button can be added here if needed */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-center">
        <Button 
          variant="link" 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Précédent
        </Button>
        <span className="mx-2">{currentPage}</span>
        <Button
          variant="link"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredIVRs.length / itemsPerPage)}
        >
          Suivant
        </Button>
      </div>
    </Container>
  );
};

export default IvrTable;