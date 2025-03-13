import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { CSVLink } from "react-csv";

const CallerIdTable = () => {
  const [callerIds, setCallerIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCallerId, setNewCallerId] = useState({
    callerid: "",
    username: "",
    name: "",
    description: "",
    status: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCallerIds();
  }, []);

  const fetchCallerIds = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/CallerId/affiche");
      setCallerIds(response.data.callerid);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  const handleAddCallerId = async () => {
    try {
      await axios.post("http://localhost:5000/api/admin/CallerId/ajouter", newCallerId);
      fetchCallerIds();
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
    }
  };

  const handleDeleteCallerId = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/CallerId/delete/:id/${id}`);
      fetchCallerIds();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  // Gestion de la pagination
  const offset = currentPage * itemsPerPage;
  const currentData = callerIds.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(callerIds.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Générer les données CSV
  const csvData = [
    ["Caller ID", "Nom", "Description", "Utilisateur", "Statut"],
    ...callerIds.map((caller) => [
      caller.cid,
      caller.name,
      caller.description,
      caller.id_user,
      caller.activated ? "Actif" : "Inactif",
    ]),
  ];

  return (
    <div className="container mt-4">
      <h2>Liste des Caller IDs</h2>
      <Button variant="primary" onClick={() => setShowModal(true)} className="me-2">
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
            <th>Description</th>
            <th>Utilisateur</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((caller) => (
            <tr key={caller.id}>
              <td>{caller.cid}</td>
              <td>{caller.name}</td>
              <td>{caller.description}</td>
              <td>{caller.id_user}</td>
              <td>{caller.activated ? "Actif" : "Inactif"}</td>
              <td>
                <Button variant="danger" onClick={() => handleDeleteCallerId(caller.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
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

      {/* Modal d'ajout */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Caller ID</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Caller ID</Form.Label>
              <Form.Control type="text" value={newCallerId.callerid} onChange={(e) => setNewCallerId({ ...newCallerId, callerid: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nom</Form.Label>
              <Form.Control type="text" value={newCallerId.name} onChange={(e) => setNewCallerId({ ...newCallerId, name: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Utilisateur</Form.Label>
              <Form.Control type="text" value={newCallerId.username} onChange={(e) => setNewCallerId({ ...newCallerId, username: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" value={newCallerId.description} onChange={(e) => setNewCallerId({ ...newCallerId, description: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Statut</Form.Label>
              <Form.Control as="select" value={newCallerId.status} onChange={(e) => setNewCallerId({ ...newCallerId, status: e.target.value })}>
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Fermer</Button>
          <Button variant="primary" onClick={handleAddCallerId}>Ajouter</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CallerIdTable;
