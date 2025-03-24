import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Dropdown, Alert } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { CSVLink } from "react-csv";
import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";

const CallerIdTable = () => {
  const [callerIds, setCallerIds] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCallerId, setNewCallerId] = useState({
    callerid: "",
    username: "",
    name: "",
    description: "",
    status: "1",
  });
  const [editCallerId, setEditCallerId] = useState({
    id: "",
    callerid: "",
    username: "",
    name: "",
    description: "",
    status: "1",
  });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchCallerIds();
    fetchUsernames();
  }, []);

  const fetchCallerIds = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/CallerId/affiche");
      setCallerIds(response.data.callerid);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      setError("Erreur lors de la récupération des données.");
    }
  };

  const fetchUsernames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users/users");
      setUsernames(response.data.users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      setError("Erreur lors de la récupération des utilisateurs.");
    }
  };

  const handleAddCallerId = async () => {
    if (!newCallerId.callerid || !newCallerId.username || !newCallerId.name) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/admin/CallerId/ajouter", newCallerId);
      if (response.status === 201) {
        fetchCallerIds();
        setNewCallerId({ callerid: "", username: "", name: "", description: "", status: "1" });
        setShowAddModal(false);
        setError("");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du Caller ID :", error.response?.data || error.message);
      setError("Erreur lors de l'ajout du Caller ID.");
    }
  };

  const handleEditCallerId = async () => {
    if (!editCallerId.callerid || !editCallerId.username || !editCallerId.name) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/CallerId/modifier/${editCallerId.id}`,
        {
          cid: editCallerId.callerid,
          id_user: editCallerId.username,
          name: editCallerId.name,
          description: editCallerId.description,
          activated: editCallerId.status,
        }
      );

      if (response.status === 200) {
        fetchCallerIds();
        setShowEditModal(false);
        setEditCallerId({ id: "", callerid: "", username: "", name: "", description: "", status: "1" });
        setError("");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du Caller ID :", error.response?.data || error.message);
      setError("Erreur lors de la modification du Caller ID.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCallerId({ ...newCallerId, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCallerId({ ...editCallerId, [name]: value });
  };

  const handleDeleteCallerId = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce Caller ID ?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/CallerId/delete/${id}`);
      fetchCallerIds();
      setError("");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error.response?.data || error.message);
      setError("Erreur lors de la suppression. Veuillez réessayer.");
    }
  };

  const openEditModal = (caller) => {
    setEditCallerId({
      id: caller.id,
      callerid: caller.cid,
      username: caller.id_user, // Ensure this matches your backend
      name: caller.name,
      description: caller.description,
      status: caller.activated.toString(),
    });
    setShowEditModal(true);
  };

  const offset = currentPage * itemsPerPage;
  const filteredCallerIds = callerIds.filter(caller =>
    caller.cid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentData = filteredCallerIds.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredCallerIds.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const csvData = [
    ["Caller ID", "Nom", "Utilisateur", "Description", "Statut"],
    ...callerIds.map((caller) => [
      caller.cid,
      caller.name,
      caller.username,
      caller.description,
      caller.activated == 1 ? "Actif" : "Inactif",
    ]),
  ];

  return (
    <div className="container mt-4">
      <h2>Liste des Caller IDs</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Control
        type="text"
        placeholder="Rechercher par Caller ID ou Nom"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
      />
      <Button variant="primary" onClick={() => setShowAddModal(true)} className="me-2">
        Ajouter
      </Button>
      <CSVLink data={csvData} filename="callerid_export.csv" className="btn btn-success">
        Exporter CSV
      </CSVLink>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Caller ID</th>
            <th>Nom</th>
            <th>Utilisateur</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((caller) => (
            <tr key={caller.id}>
              <td>{caller.cid}</td>
              <td>{caller.name}</td>
              <td>{caller.username}</td>
              <td>{caller.description}</td>
              <td>
                {caller.activated == 1 ? (
                  <FaCheckCircle color="green" size={20} title="Actif" />
                ) : (
                  <FaTimesCircle color="red" size={20} title="Inactif" />
                )}
              </td>
              <td>
                <Button variant="warning" onClick={() => openEditModal(caller)} className="me-2">
                  <FaEdit />
                </Button>
                <Button variant="danger" onClick={() => handleDeleteCallerId(caller.id)}>
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ReactPaginate
        previousLabel={"← Précédent"}
        nextLabel={"Suivant →"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination justify-content-center"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"page-item"}
        previousLinkClassName={"page-link"}
        nextClassName={"page-item"}
        nextLinkClassName={"page-link"}
        breakClassName={"page-item"}
        breakLinkClassName={"page-link"}
        activeClassName={"active"}
      />

      {/* Add Caller ID Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Caller ID</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Caller ID</Form.Label>
              <Form.Control
                type="text"
                name="callerid"
                value={newCallerId.callerid}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newCallerId.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Utilisateur</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {newCallerId.username || "Sélectionner un utilisateur"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {usernames.map((user) => (
                    <Dropdown.Item
                      key={user.id}
                      onClick={() => setNewCallerId({ ...newCallerId, username: user.id })}
                    >
                      {user.username}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newCallerId.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="status"
                value={newCallerId.status}
                onChange={handleInputChange}
              >
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleAddCallerId}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Caller ID Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Caller ID</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Caller ID</Form.Label>
              <Form.Control
                type="text"
                name="callerid"
                value={editCallerId.callerid}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editCallerId.name}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Utilisateur</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {usernames.find(user => user.id === editCallerId.username)?.username || "Sélectionner un utilisateur"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {usernames.map((user) => (
                    <Dropdown.Item
                      key={user.id}
                      onClick={() => setEditCallerId({ ...editCallerId, username: user.id })}
                    >
                      {user.username}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={editCallerId.description}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="status"
                value={editCallerId.status}
                onChange={handleEditInputChange}
              >
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleEditCallerId}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CallerIdTable;