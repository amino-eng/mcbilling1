"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Table, Button, Modal, Form, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner, Tabs, Tab } from "react-bootstrap"
import ReactPaginate from "react-paginate"
import { CSVLink } from "react-csv"
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaRobot,
} from "react-icons/fa"

// Constants
const ITEMS_PER_PAGE = 10

// Header with Export & Add
function IVRsHeader({ onAddClick, ivrs, isExporting }) {
  const csvData = [
    ["ID", "Utilisateur", "Nom", "Début Semaine", "Début Samedi", "Début Dimanche"],
    ...ivrs.map((ivr) => [
      ivr.id,
      ivr.username,
      ivr.name,
      ivr.monFriStart || "",
      ivr.satStart || "",
      ivr.sunStart || "",
    ]),
  ]

  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
          {Array(5).fill().map((_, i) => (
            <div
              key={i}
              className="floating-icon position-absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <FaRobot
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
            <FaRobot className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Manage IVRs</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Manage your Interactive Voice Response systems</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{ivrs.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaRobot size={12} />
            </span>
          </Badge>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={onAddClick}
            className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          >
            <div className="icon-container">
              <FaPlusCircle />
            </div>
            <span>Add IVR</span>
          </Button>
          <CSVLink
            data={csvData}
            filename={"ivrs.csv"}
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
            </div>
            <span>Export</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  )
}

// Search Bar
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        placeholder="Search IVRs..."
        value={searchTerm}
        onChange={onSearchChange}
        className="ps-4 rounded-pill border-0 shadow-sm"
        style={{ height: "46px" }}
      />
      <FaSearch className="position-absolute text-muted" style={{ left: "15px", top: "15px" }} />
    </div>
  )
}

// Action Buttons
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2 justify-content-end">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onEdit}
        className="action-btn d-flex align-items-center justify-content-center p-2"
      >
        <FaEdit className="btn-icon" />
      </Button>
      {onDelete && (
        <Button
          variant="outline-danger"
          size="sm"
          onClick={onDelete}
          className="action-btn d-flex align-items-center justify-content-center p-2"
        >
          <FaTrashAlt className="btn-icon" />
        </Button>
      )}
    </div>
  )
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-5">
      <div className="mb-3 text-muted">
        <FaRobot size={48} />
      </div>
      <h5>No IVRs Found</h5>
      <p className="text-muted">Add your first IVR to get started</p>
    </div>
  )
}

// Table
function IVRsTable({ ivrs, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading IVRs...</p>
      </div>
    )
  }

  if (ivrs.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <Table hover className="elegant-table mb-0">
        <thead>
          <tr className="bg-light">
            <th className="fw-semibold">Utilisateur</th>
            <th className="fw-semibold">Nom</th>
            <th className="fw-semibold">Début Semaine</th>
            <th className="fw-semibold">Début Samedi</th>
            <th className="fw-semibold">Début Dimanche</th>
            <th className="fw-semibold text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ivrs.map((ivr) => (
            <tr key={ivr.id} className="align-middle">
              <td>{ivr.username}</td>
              <td>
                <div className="fw-semibold">{ivr.name}</div>
              </td>
              <td>{ivr.monFriStart}</td>
              <td>{ivr.satStart}</td>
              <td>{ivr.sunStart}</td>
              <td>
                <ActionButtons onEdit={() => onEdit(ivr)} onDelete={onDelete ? () => onDelete(ivr.id) : null} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// Pagination
function PaginationSection({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      previousLabel={"Previous"}
      nextLabel={"Next"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination justify-content-center mb-0"}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link"}
      previousClassName={"page-item"}
      previousLinkClassName={"page-link"}
      nextClassName={"page-item"}
      nextLinkClassName={"page-link"}
      breakClassName={"page-item"}
      breakLinkClassName={"page-link"}
      activeClassName={"active"}
      forcePage={currentPage}
      renderOnZeroPageCount={null}
    />
  )
}

// Modal Form
function IVRModal({
  show,
  onHide,
  title,
  onSubmit,
  ivr,
  onInputChange,
  isSubmitting,
  users,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <div className="d-flex align-items-center">
            <FaRobot className="me-2" /> {title}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Tabs defaultActiveKey="General" className="mb-4">
            <Tab eventKey="General" title="General Information">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="formName">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={ivr.name || ''}
                      onChange={(e) => onInputChange(e, 'name')}
                      required
                      className="shadow-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formUserId">
                    <Form.Label>Utilisateur</Form.Label>
                    <Form.Select
                      name="userId"
                      value={ivr.userId || ''}
                      onChange={(e) => onInputChange(e, 'userId')}
                      required
                      className="shadow-sm"
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="formMonFriStart">
                    <Form.Label>Intervalles en semaine</Form.Label>
                    <Form.Control
                      type="text"
                      name="monFriStart"
                      value={ivr.monFriStart || ''}
                      onChange={(e) => onInputChange(e, 'monFriStart')}
                      required
                      className="shadow-sm"
                      placeholder="Ex: 09:00-12:00|14:00-20:00"
                    />
                    <Form.Text className="text-muted">
                      Format: HH:MM-HH:MM|HH:MM-HH:MM
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formSatStart">
                    <Form.Label>Intervalles le samedi</Form.Label>
                    <Form.Control
                      type="text"
                      name="satStart"
                      value={ivr.satStart || ''}
                      onChange={(e) => onInputChange(e, 'satStart')}
                      required
                      className="shadow-sm"
                      placeholder="Ex: 09:00-12:00"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formSunStart">
                    <Form.Label>Intervalles le dimanche</Form.Label>
                    <Form.Control
                      type="text"
                      name="sunStart"
                      value={ivr.sunStart || ''}
                      onChange={(e) => onInputChange(e, 'sunStart')}
                      required
                      className="shadow-sm"
                      placeholder="Ex: 09:00-12:00"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formUseHolidays">
                    <Form.Label>Utiliser les jours fériés</Form.Label>
                    <Form.Select
                      name="useHolidays"
                      value={ivr.useHolidays || '00:00'}
                      onChange={(e) => onInputChange(e, 'useHolidays')}
                      required
                      className="shadow-sm"
                    >
                      <option value="00:00">Non</option>
                      <option value="01:00">Oui</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="Options" title="Options disponibles">
              <Row className="g-3">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Col md={6} key={index}>
                    <Form.Group controlId={`formOption${index}`}>
                      <Form.Label>Option {index}</Form.Label>
                      <Form.Select
                        name={`option${index}`}
                        value={ivr.selectedOptions ? ivr.selectedOptions[index] : ''}
                        onChange={(e) => {
                          const newOptions = [...(ivr.selectedOptions || Array(10).fill(''))];
                          newOptions[index] = e.target.value;
                          onInputChange({ target: { value: newOptions } }, 'selectedOptions');
                        }}
                        className="shadow-sm"
                      >
                        {ivr.options && ivr.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={onHide} className="fw-semibold">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            className="d-flex align-items-center gap-2 fw-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner animation="border" size="sm" /> : <FaCheckCircle />}
            {title === "Add IVR" ? "Add" : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

// Main Page Component
function IvrTable() {
  // State management
  const [ivrs, setIvrs] = useState([]);
  const [filteredIvrs, setFilteredIvrs] = useState([]);
  const [pagedIvrs, setPagedIvrs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    username: true,
    name: true,
    monFriStart: true,
    satStart: true,
    sunStart: true
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form states
  const [newIvr, setNewIvr] = useState({
    name: '',
    userId: '',
    monFriStart: '09:00-12:00|14:00-20:00',
    satStart: '09:00-12:00',
    sunStart: '09:00-12:00',
    useHolidays: '00:00',
    selectedOptions: Array(10).fill(''),
    options: [
      { value: 'Undefined', label: 'Undefined' },
      { value: 'SIP', label: 'SIP' },
      { value: 'IVR', label: 'IVR' },
      { value: 'Queue', label: 'Queue' },
      { value: 'Group', label: 'Group' },
      { value: 'Number', label: 'Number' },
      { value: 'Repeat_ivr', label: 'Repeat_ivr' },
      { value: 'Hangup', label: 'Hangup' },
      { value: 'Custom', label: 'Custom' },
    ]
  });
  
  const [editIvr, setEditIvr] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Handle input changes for forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal) {
      setEditIvr({ ...editIvr, [name]: value });
    } else {
      setNewIvr({ ...newIvr, [name]: value });
    }
  };

  // API endpoints
  const apiUrl = 'http://localhost:5000/api/admin/IVRs/affiche';
  const addIvrUrl = 'http://localhost:5000/api/admin/IVRs/add';
  const editIvrUrl = 'http://localhost:5000/api/admin/IVRs/update';
  const deleteIvrUrl = 'http://localhost:5000/api/admin/IVRs/delete';

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

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const openEditModal = async (ivr) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/IVRs/get/${ivr.id}`);
      const ivrData = response.data.ivr || ivr;

      setEditIvr({
        ...ivrData,
        userId: ivrData.id_user,
        useHolidays: ivrData.use_holidays || '00:00',
        selectedOptions: ivrData.options?.map(o => o.option) || Array(10).fill(''),
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'IVR :', error);
      setErrorMessage('Échec de la récupération de l\'IVR pour modification');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ivrData = {
      id_user: newIvr.userId,
      name: newIvr.name,
      monFriStart: newIvr.monFriStart,
      satStart: newIvr.satStart,
      sunStart: newIvr.sunStart,
      use_holidays: newIvr.useHolidays,
      options: newIvr.selectedOptions.map((option) => ({ option })),
    };

    try {
      if (editIvr) {
        await axios.put(`${editIvrUrl}/${editIvr.id}`, ivrData);
        setSuccessMessage('IVR modifié avec succès');
      } else {
        await axios.post(addIvrUrl, ivrData);
        setSuccessMessage('IVR ajouté avec succès');
      }
      const response = await axios.get(apiUrl);
      setIvrs(response.data.ivrs);
    } catch (error) {
      console.error('Erreur lors de l\'ajout ou de la modification de l\'IVR :', error);
      setErrorMessage('Échec de l\'ajout ou de la modification de l\'IVR');
    } finally {
      setIsSubmitting(false);
      handleCloseModal();
      setNewIvr({
        name: '',
        userId: '',
        monFriStart: '09:00-12:00|14:00-20:00',
        satStart: '09:00-12:00',
        sunStart: '09:00-12:00',
        useHolidays: '00:00',
        selectedOptions: Array(10).fill(''),
      });
      setEditIvr(null);
    }
  };

  const handleDeleteIvr = async (ivrId) => {
    if (window.confirm('Are you sure you want to delete this IVR?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/IVRs/delete/${ivrId}`);
        const response = await axios.get(apiUrl);
        setIvrs(response.data.ivrs);
        setSuccessMessage('IVR deleted successfully');
      } catch (error) {
        console.error('Error deleting IVR:', error);
        setErrorMessage('Failed to delete IVR');
      }
    }
  };

  // Effect to filter IVRs based on search term
  useEffect(() => {
    const filtered = ivrs.filter(
      (ivr) =>
        ivr.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ivr.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIvrs(filtered);
    setCurrentPage(0); // Reset to first page when search changes
  }, [ivrs, searchTerm]);

  // Effect to paginate filtered IVRs
  useEffect(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPagedIvrs(filteredIvrs.slice(startIndex, endIndex));
  }, [filteredIvrs, currentPage]);

  // Fetch IVRs
  useEffect(() => {
    const fetchIVRs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(apiUrl);
        if (response.data.ivrs) {
          setIvrs(response.data.ivrs);
        } else {
          setErrorMessage('No IVRs found');
        }
      } catch (error) {
        console.error('Error fetching IVRs:', error);
        setErrorMessage('Failed to load IVRs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIVRs();
    fetchUsers();
  }, []);

  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .btn-hover-effect .icon-container {
          transition: transform 0.3s ease;
        }
        .btn-hover-effect:hover .icon-container {
          transform: translateY(-3px);
        }
        .pulse-effect {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .elegant-table th, .elegant-table td {
          border-top: none;
          border-bottom: 1px solid #e9ecef;
        }
        .action-btn .btn-icon {
          transition: transform 0.2s ease;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
      `,
      }} />

      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
              <IVRsHeader
                onAddClick={handleAddClick}
                ivrs={ivrs}
                isExporting={isExporting}
              />
              <Card.Body className="p-4">
                {errorMessage && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaTimesCircle className="me-2" /> {errorMessage}
                  </Alert>
                )}
                {successMessage && (
                  <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaCheckCircle className="me-2" /> {successMessage}
                  </Alert>
                )}

                <SearchBar searchTerm={searchTerm} onSearchChange={(e) => setSearchTerm(e.target.value)} />
                <IVRsTable
                  ivrs={pagedIvrs}
                  onEdit={openEditModal}
                  onDelete={handleDeleteIvr}
                  isLoading={isLoading}
                />
                <PaginationSection
                  pageCount={Math.ceil(filteredIvrs.length / ITEMS_PER_PAGE)}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  currentPage={currentPage}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add Modal */}
      <IVRModal
        show={showAddModal}
        onHide={handleCloseModal}
        title="Add IVR"
        onSubmit={handleSubmit}
        ivr={newIvr}
        onInputChange={handleInputChange}
        isSubmitting={isSubmitting}
        users={users}
      />

      {/* Edit Modal */}
      {showEditModal && (
        <IVRModal
          show={showEditModal}
          onHide={handleCloseModal}
          title="Edit IVR"
          onSubmit={handleSubmit}
          ivr={editIvr}
          onInputChange={handleInputChange}
          isSubmitting={isSubmitting}
          users={users}
        />
      )}
    </div>
  );
}

export default IvrTable;
