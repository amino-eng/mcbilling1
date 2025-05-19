"use client"

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Table, Button, Modal, Form, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { CSVLink } from "react-csv";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaPhoneAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBan,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaExclamationCircle,
  FaInfoCircle,
  FaEllipsisV
} from "react-icons/fa";
import './RestricNumber.css';

function RestricNumber() {
  const [phoneData, setPhoneData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restrictionType, setRestrictionType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userRestrict, setUserRestrict] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isEditing, setIsEditing] = useState(false);
  const [currentRestrictionId, setCurrentRestrictionId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/RestrictNumber/affiche');
      setPhoneData(response.data.restrictions);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Erreur lors de la récupération des restrictions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/RestrictNumber/afficheuserRestrict');
      if (Array.isArray(response.data.users)) {
        setUserRestrict(response.data.users);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setError('Erreur lors de la récupération des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const handleAddRestriction = async () => {
    if (!phoneNumber || !restrictionType || !selectedUser) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const now = new Date();
    const formattedDate = formatDateTime(now); 

    const data = {
      number: phoneNumber,
      direction: restrictionType,
      id_user: selectedUser,
      date: formattedDate
    };

    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/RestrictNumber/edit/${currentRestrictionId}`, data);
        toast.success('Restriction modifiée avec succès !');
      } else {
        await axios.post('http://localhost:5000/api/admin/RestrictNumber/add', data);
        toast.success('Restriction ajoutée avec succès !');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la restriction:", error);
      toast.error(isEditing ? "Erreur lors de la modification de la restriction." : "Erreur lors de l'ajout de la restriction.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRestriction = (restriction) => {
    setPhoneNumber(restriction.number);
    setRestrictionType(restriction.direction);
    setSelectedUser(restriction.id_user);
    setCurrentRestrictionId(restriction.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteRestriction = async (restrictionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette restriction ?')) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/RestrictNumber/delete/${restrictionId}`);
      toast.success('Restriction supprimée avec succès !');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setRestrictionType('');
    setSelectedUser('');
    setShowForm(false);
    setError('');
    setIsEditing(false);
    setCurrentRestrictionId(null);
  };

  const filteredPhoneData = useMemo(() => {
    return phoneData.filter((item) =>
      (item.agent?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      item.number.includes(searchTerm)
    );
  }, [phoneData, searchTerm]);

  const sortedPhoneData = useMemo(() => {
    return [...filteredPhoneData].sort((a, b) => {
      return sortDirection === 'asc'
        ? a.agent?.username?.localeCompare(b.agent?.username || '')
        : b.agent?.username?.localeCompare(a.agent?.username || '');
    });
  }, [filteredPhoneData, sortDirection]);

  const totalPages = Math.max(Math.ceil(sortedPhoneData.length / itemsPerPage), 1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPhoneData.slice(indexOfFirstItem, indexOfLastItem);

  // Header Component
  const RestrictionHeader = () => {
    const csvData = [
      ["Utilisateur", "Numéro", "Direction", "Date"],
      ...filteredPhoneData.map((item) => [
        item.agent?.username || "",
        item.number,
        item.direction === 2 ? "Entrant" : "Sortant",
        formatDateTime(item.date),
      ]),
    ];

    return (
      <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
        <div className="bg-primary p-3 w-100 position-relative">
          <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
            {Array(5)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="floating-icon position-absolute"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  <FaBan
                    className="text-white opacity-25"
                    style={{
                      fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                    }}
                  />
                </div>
              ))}
          </div>
          <div className="d-flex align-items-center position-relative z-2">
            <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
              <FaBan className="text-primary fs-3" />
            </div>
            <div>
              <h2 className="fw-bold mb-0 text-white">Gestion des Restrictions</h2>
              <p className="text-white-50 mb-0 d-none d-md-block">Gérez les numéros restreints facilement</p>
            </div>
          </div>
        </div>
        <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
              <span className="me-2 fw-normal">
                Total: <span className="fw-bold">{filteredPhoneData.length}</span>
              </span>
              <span
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "24px", height: "24px" }}
              >
                <FaBan size={12} />
              </span>
            </Badge>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
              className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            >
              <div className="icon-container">
                <FaPlusCircle />
              </div>
              <span>{showForm ? 'Annuler' : 'Ajouter'}</span>
            </Button>
            <CSVLink
              data={csvData}
              filename={"restrictions.csv"}
              className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            >
              <div className="icon-container">
                <FaDownload />
              </div>
              <span>Exporter</span>
            </CSVLink>
          </div>
        </div>
      </Card.Header>
    );
  };

  // Search Bar Component
  const SearchBar = () => {
    return (
      <div className="position-relative mb-4">
        <Form.Control
          type="text"
          placeholder="Rechercher par utilisateur ou numéro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ps-4 shadow-sm border-0"
          style={{ height: "48px", borderRadius: "24px" }}
        />
        <FaSearch className="position-absolute text-muted" style={{ top: "16px", left: "16px" }} />
      </div>
    );
  };

  // Direction Badge Component
  const DirectionBadge = ({ direction }) => {
    if (direction === 2) {
      return (
        <Badge bg="info" pill className="px-3 py-2">
          <FaArrowDown className="me-1" /> Entrant
        </Badge>
      );
    } else {
      return (
        <Badge bg="warning" pill className="px-3 py-2">
          <FaArrowUp className="me-1" /> Sortant
        </Badge>
      );
    }
  };

  // Action Buttons Component
  const ActionButtons = ({ onEdit, onDelete }) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button variant="outline-primary" onClick={onEdit} size="sm" className="action-btn">
          <FaEdit className="btn-icon" />
        </Button>
        <Button variant="outline-danger" onClick={onDelete} size="sm" className="action-btn">
          <FaTrashAlt className="btn-icon" />
        </Button>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = () => {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
            <FaBan className="text-muted" style={{ fontSize: "2rem" }} />
          </div>
        </div>
        <h5>Aucune restriction trouvée</h5>
        <p className="text-muted">Ajoutez une nouvelle restriction ou modifiez votre recherche</p>
      </div>
    );
  };

  // Form Component
  const RestrictionForm = () => {
    if (!showForm) return null;
    
    return (
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">{isEditing ? 'Modifier la restriction' : 'Ajouter une restriction'}</h5>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Utilisateur</Form.Label>
                  <Form.Select 
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {userRestrict.map((e, i) => (
                      <option key={i} value={e.id}>{e.username}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Numéro</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Numéro"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Direction</Form.Label>
                  <Form.Select
                    value={restrictionType}
                    onChange={(e) => setRestrictionType(e.target.value)}
                  >
                    <option value="">Type de restriction</option>
                    <option value="2">Entrant</option>
                    <option value="1">Sortant</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={formatDateTime(new Date())}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={resetForm}>
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAddRestriction} 
                disabled={loading}
                className="d-flex align-items-center gap-2"
              >
                {loading && <Spinner animation="border" size="sm" />}
                {isEditing ? 'Modifier' : 'Confirmer'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  // Pagination Component
  const PaginationSection = () => {
    const pageCount = Math.ceil(filteredPhoneData.length / itemsPerPage);
    
    if (pageCount <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-4">
        <ReactPaginate
          previousLabel={"Précédent"}
          nextLabel={"Suivant"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={({ selected }) => setCurrentPage(selected + 1)}
          forcePage={currentPage - 1}
          containerClassName={"pagination mb-0"}
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
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <style jsx="true">{`
        .dashboard-container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .dashboard-main {
          transition: all 0.3s ease;
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .pulse-effect {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .btn-hover-effect {
          transition: all 0.3s ease;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .btn-icon {
          transition: transform 0.2s ease;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <ToastContainer />
      
      <div className="dashboard-main">
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow border-0 overflow-hidden main-card">
                <RestrictionHeader />
                
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {error}
                    </Alert>
                  )}
                  
                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <SearchBar />
                    </Col>
                  </Row>
                  
                  <RestrictionForm />
                  
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th className="py-3 px-4 border-0" onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                                <div className="d-flex align-items-center">
                                  Utilisateur
                                  {sortDirection === 'asc' ? <FaArrowUp className="ms-2" /> : <FaArrowDown className="ms-2" />}
                                </div>
                              </th>
                              <th className="py-3 px-4 border-0">Numéro</th>
                              <th className="py-3 px-4 border-0 text-center">Direction</th>
                              <th className="py-3 px-4 border-0">Date</th>
                              <th className="py-3 px-4 border-0 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <Spinner animation="border" variant="primary" />
                                  <p className="mt-3 text-muted">Chargement des données...</p>
                                </td>
                              </tr>
                            ) : currentItems.length === 0 ? (
                              <tr>
                                <td colSpan="5">
                                  <EmptyState />
                                </td>
                              </tr>
                            ) : (
                              currentItems.map((e, i) => (
                                <tr key={i}>
                                  <td className="py-3 px-4">{e.agent?.username || <span className="text-muted fst-italic">Non spécifié</span>}</td>
                                  <td className="py-3 px-4">{e.number?.replace(/(\d{2})(?=\d)/g, '$1 ') || ''}</td>
                                  <td className="py-3 px-4 text-center">
                                    <DirectionBadge direction={e.direction} />
                                  </td>
                                  <td className="py-3 px-4">{formatDateTime(e.date)}</td>
                                  <td className="py-3 px-4 text-center">
                                    <ActionButtons 
                                      onEdit={() => handleEditRestriction(e)} 
                                      onDelete={() => handleDeleteRestriction(e.id)} 
                                    />
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  <PaginationSection />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default RestricNumber;