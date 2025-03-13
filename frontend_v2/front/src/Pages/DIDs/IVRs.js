import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table, Alert, Col, Row, Container, Dropdown, Modal, Button, Form, Tabs, Tab, FormGroup } from 'react-bootstrap';

const IvrTable = () => {
  const [ivrs, setIvrs] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [visibleColumns, setVisibleColumns] = useState({
    ID: false,
    Utilisateur: true,
    Nom: true,
    "Début Semaine": false,
    "Début Samedi": false,
    "Début Dimanche": false,
  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // State to control modal visibility
  const [name, setName] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const[users,setUsers]=useState([])
  const [options, setOptions] = useState([
    { value: "Undefined", label: "Undefined" },
    { value: "SIP", label: "SIP" },
    { value: "IVR", label: "IVR" },
    { value: "Queue", label: "Queue" },
    { value: "Group", label: "Group" },
    { value: "Number", label: "Number" },
    { value: "Repeat_ivr", label: "Repeat_ivr" },
    { value: "Hangup", label: "Hangup" },
    { value: "Custom", label: "Custom" },
  ]);

  const apiUrl = "http://localhost:5000/api/admin/IVRs/affiche";
  const addIvrUrl = "http://localhost:5000/api/admin/IVRs/add";
  


  const fetchUser=  ()=>{
        axios.get("http://localhost:5000/api/admin/users/users")
           .then((response) => {
                setUsers(response.data.users)
            })
            .catch((err) => {
                console.error('Error fetching user:', err)
            })
  }
  useEffect(() => {
    const fetchIVRs = async () => {
      try {
        const response = await axios.get(apiUrl);
        if (response.data.ivrs) {
          setIvrs(response.data.ivrs);
        } else {
          setMessage("Aucun IVR trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des IVRs :", error);
        setMessage("Échec du chargement des données");
      }
    };

    fetchIVRs();
    fetchUser()
  }, []);
console.log(users);

  const handleCSVExport = () => {
    const headers = Object.keys(visibleColumns).filter((key) => visibleColumns[key]);
    const csvRows = [
      headers.join(","),
      ...ivrs.map((ivr) =>
        headers
          .map((column) => {
            switch (column) {
              case "ID":
                return ivr.id;
              case "Utilisateur":
                return ivr.username;
              case "Nom":
                return ivr.name;
              case "Début Semaine":
                return ivr.monFriStart;
              case "Début Samedi":
                return ivr.satStart;
              case "Début Dimanche":
                return ivr.sunStart;
              default:
                return "";
            }
          })
          .join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ivrs.csv";
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
    setShowAddModal(true); // Open the modal
  };

  const handleCloseModal = () => {
    setShowAddModal(false); // Close the modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newIvr = {
      id_user: 1, // Replace with the logged-in user's ID
      name: name,
      [selectedOption]: destination,
      monFriStart: "09:00-12:00|14:00-18:00",
      satStart: "09:00-12:00",
      sunStart: "00:00",
      use_holidays: 0,
    };

    try {
      const response = await axios.post(addIvrUrl, newIvr);
      if (response.data.success) {
        setMessage("IVR ajouté avec succès");
        const fetchResponse = await axios.get(apiUrl);
        setIvrs(fetchResponse.data.ivrs);
      } else {
        setMessage("Erreur lors de l'ajout de l'IVR");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'IVR :", error);
      setMessage("Échec de l'ajout de l'IVR");
    }

    setName("");
    setSelectedOption("");
    setDestination("");
    setDescription("");
    setShowAddModal(false); // Close the modal after submission
  };

  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIVRs = ivrs.slice(indexOfFirstItem, indexOfLastItem);

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

      {/* Modal for Adding IVR */}
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
                <Form.Label>Username</Form.Label>
                <select>
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                <Form.Label>MonFri intervals</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Form.Label>Saturday intervals</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                 <Form.Label>Use Holidays</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
            </Tab>
            <Tab eventKey="Options" title="Available Options">
              <Form.Group controlId="formOption" className="mb-3">
                <Form.Label>Option 0</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 1</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 2</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 3</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 4</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 5</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 6</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 7</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 8</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>

                <Form.Label>Option 9</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>

                <Form.Label>Default option</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>

                <Form.Label>Enable known SIP user</Form.Label>
                <Form.Select>
                  <option value="Yes">Oui</option>
                  <option value="No">Non</option>               </Form.Select>
                

              </Form.Group>
              
            </Tab>
            <Tab eventKey="Option" title="Unavailable Options">
              <Form.Group controlId="formUnavailableOptions" className="mb-3">
                <Form.Label>Option 0</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 1</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 2</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 3</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 4</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 5</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 6</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 7</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Label>Option 8</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>

                <Form.Label>Option 9</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>

                <Form.Label>Default option</Form.Label>
                <Form.Select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>

      <Table striped bordered hover>
        <thead>
          <tr>
            {visibleColumns.ID && <th>ID</th>}
            {visibleColumns.Utilisateur && <th>Utilisateur</th>}
            {visibleColumns.Nom && <th>Nom</th>}
            {visibleColumns["Début Semaine"] && <th>Début Semaine</th>}
            {visibleColumns["Début Samedi"] && <th>Début Samedi</th>}
            {visibleColumns["Début Dimanche"] && <th>Début Dimanche</th>}
          </tr>
        </thead>
        <tbody>
          {currentIVRs.map((ivr) => (
            <tr key={ivr.id}>
              {visibleColumns.ID && <td>{ivr.id}</td>}
              {visibleColumns.Utilisateur && <td>{ivr.username}</td>}
              {visibleColumns.Nom && <td>{ivr.name}</td>}
              {visibleColumns["Début Semaine"] && <td>{ivr.monFriStart}</td>}
              {visibleColumns["Début Samedi"] && <td>{ivr.satStart}</td>}
              {visibleColumns["Début Dimanche"] && <td>{ivr.sunStart}</td>}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default IvrTable;