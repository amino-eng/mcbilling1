"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Table, Button, Modal, Form, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner } from "react-bootstrap"
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
  FaPhoneAlt, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt, 
  FaFileImport, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaTimes,
  FaCheck
} from "react-icons/fa"

// Constants
const ITEMS_PER_PAGE = 10

const DEFAULT_NEW_CALLER_ID = {
  callerid: "",
  username: "",
  name: "",
  description: "",
  status: "1",
}

// Header with Export, Import & Add
function CallerIDHeader({ onAddClick, onImportClick, callerIds, isExporting }) {
  const csvData = [
    ["Caller ID", "Name", "User", "Description", "Status"],
    ...callerIds.map((caller) => [
      caller.cid,
      caller.name,
      caller.username,
      caller.description,
      caller.activated == 1 ? "Active" : "Inactive",
    ]),
  ]

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
                <FaPhoneAlt className="text-white opacity-25" />
              </div>
            ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaPhoneAlt className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Caller ID Management</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Easily manage your caller IDs</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{callerIds.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaPhoneAlt size={12} />
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
            <span>Add Caller ID</span>
          </Button>
          <Button
            variant="primary"
            onClick={onImportClick}
            className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          >
            <div className="icon-container">
              <FaFileImport />
            </div>
            <span>Import CSV</span>
          </Button>
          <CSVLink
            data={csvData}
            filename={"caller_ids.csv"}
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
            </div>
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  )
}

// Search Bar
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search-container position-relative mb-4">
      <div className="position-absolute top-50 start-0 translate-middle-y ps-3 search-icon">
        <FaSearch className="text-primary" />
      </div>
      <Form.Control
        type="text"
        placeholder="Search by Caller ID, Name, User..."
        value={searchTerm}
        onChange={onSearchChange}
        className="py-2 ps-5 shadow-sm border-0 search-input"
        style={{
          borderRadius: "50rem",
          background: "#f8f9fa",
          transition: "all 0.3s ease",
          borderLeft: "4px solid transparent",
        }}
      />
    </div>
  )
}

// Status Badge
function StatusBadge({ status }) {
  return status == 1 ? (
    <Badge
      bg="success"
      pill
      className="d-flex align-items-center gap-1 py-2 px-3 position-relative status-badge active"
      style={{
        background: "linear-gradient(45deg, #28a745, #20c997)",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <span className="status-icon">
        <FaCheckCircle />
      </span>{" "}
      Active
    </Badge>
  ) : (
    <Badge
      bg="danger"
      pill
      className="d-flex align-items-center gap-1 py-2 px-3 position-relative status-badge inactive"
      style={{
        background: "linear-gradient(45deg, #dc3545, #ff6b6b)",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <span className="status-icon">
        <FaTimesCircle />
      </span>{" "}
      Inactive
    </Badge>
  )
}

// Action Buttons
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2 justify-content-center action-buttons">
      <Button
        variant="outline-primary"
        onClick={onEdit}
        className="d-flex align-items-center gap-1 action-btn edit-btn"
        size="sm"
      >
        <span className="btn-icon">
          <FaEdit />
        </span>{" "}
        Edit
      </Button>
      <Button
        variant="outline-danger"
        onClick={onDelete}
        className="d-flex align-items-center gap-1 action-btn delete-btn"
        size="sm"
      >
        <span className="btn-icon">
          <FaTrashAlt />
        </span>{" "}
        Delete
      </Button>
    </div>
  )
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-5 my-4 empty-state">
      <div className="empty-icon mb-3">
        <div
          className="icon-circle"
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #e6f0ff, #ffffff)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            fontSize: "2rem",
            boxShadow: "0 10px 25px rgba(13, 110, 253, 0.2)",
            position: "relative",
          }}
        >
          <FaPhoneAlt className="text-primary" />
        </div>
      </div>
      <h4 className="text-dark mb-3">No Caller ID found</h4>
      <p className="text-muted mb-4">Add a new Caller ID or modify your search</p>
      <Button variant="primary" onClick={() => window.location.reload()} className="btn-hover-effect">
        <div className="icon-container me-2">
          <i className="bi bi-arrow-clockwise"></i>
        </div>
        Refresh page
      </Button>
    </div>
  )
}

// Table
function CallerIdTable({ callerIds, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Caller IDs...</p>
      </div>
    )
  }

  if (callerIds.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      className="table-responsive shadow-sm table-container"
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e9ecef",
      }}
    >
      <Table hover className="align-middle mb-0 elegant-table">
        <thead
          style={{
            backgroundColor: "#f8f9fa",
            color: "#495057",
            borderBottom: "2px solid #dee2e6",
          }}
        >
          <tr>
            <th
              className="py-3 px-4"
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                border: "none",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
            >
              Caller ID
            </th>
            <th
              className="py-3 px-4"
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                border: "none",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
            >
              Name
            </th>
            <th
              className="py-3 px-4"
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                border: "none",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
            >
              User
            </th>
            <th
              className="py-3 px-4"
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                border: "none",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
            >
              Description
            </th>
            <th
              className="py-3 px-4 text-center"
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                border: "none",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
            >
              Status
            </th>
            <th
              className="py-3 px-4 text-center"
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                border: "none",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {callerIds.map((caller) => (
            <tr
              key={caller.id}
              className="border-top"
              style={{
                transition: "all 0.2s ease",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <td className="py-3 px-4 fw-semibold">{caller.cid}</td>
              <td className="py-3 px-4">{caller.name}</td>
              <td className="py-3 px-4">{caller.username}</td>
              <td className="py-3 px-4">
                {caller.description || <span className="text-muted fst-italic">Not specified</span>}
              </td>
              <td className="py-3 px-4 text-center">
                <StatusBadge status={caller.activated} />
              </td>
              <td className="py-3 px-4">
                <ActionButtons onEdit={() => onEdit(caller)} onDelete={() => onDelete(caller.id)} />
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
  if (pageCount <= 1) return null

  return (
    <div className="d-flex justify-content-center mt-4">
      <ReactPaginate
        previousLabel={<span>&laquo;</span>}
        nextLabel={<span>&raquo;</span>}
        breakLabel={<span>...</span>}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={onPageChange}
        forcePage={currentPage}
        containerClassName="pagination pagination-md"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakClassName="page-item"
        breakLinkClassName="page-link"
        activeClassName="active"
      />
    </div>
  )
}

// Modal Form
function CallerIdModal({
  show,
  onHide,
  title,
  onSubmit,
  callerId,
  usernames,
  onUsernameChange,
  onInputChange,
  isSubmitting,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" className="callerid-modal">
      <Modal.Header closeButton className="border-0 pb-0 bg-primary bg-opacity-10">
        <Modal.Title className="text-primary fw-bold d-flex align-items-center">
          <FaPhoneAlt className="me-2" /> {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <hr className="mb-4" />
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Caller ID <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="callerid"
                  value={callerId.callerid}
                  onChange={(e) => onInputChange(e, "callerid")}
                  required
                  className="shadow-sm"
                  placeholder="Enter Caller ID"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={callerId.name}
                  onChange={(e) => onInputChange(e, "name")}
                  required
                  className="shadow-sm"
                  placeholder="Enter name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  User <span className="text-danger">*</span>
                </Form.Label>
                <Dropdown className="w-100">
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-basic"
                    className="shadow-sm w-100 text-start d-flex justify-content-between align-items-center"
                  >
                    <span>{callerId.username || "Select a user"}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {usernames.length === 0 ? (
                      <Dropdown.Item disabled>No users available</Dropdown.Item>
                    ) : (
                      usernames.map((user) => (
                        <Dropdown.Item key={user.id} onClick={() => onUsernameChange(user.id)}>
                          {user.username}
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={callerId.status}
                  onChange={(e) => onInputChange(e, "status")}
                  className="shadow-sm"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={callerId.description}
              onChange={(e) => onInputChange(e, "description")}
              className="shadow-sm"
              placeholder="Enter a description (optional)"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 bg-light bg-opacity-50">
        <hr className="w-100 mt-0" />
        <Button variant="light" onClick={onHide} className="fw-semibold shadow-sm" disabled={isSubmitting}>
          <span className="d-flex align-items-center">Cancel</span>
        </Button>
        <Button variant="primary" onClick={onSubmit} className="fw-semibold shadow-sm" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {title === "Add Caller ID" ? "Adding..." : "Saving..."}
            </>
          ) : title === "Add Caller ID" ? (
            "Add"
          ) : (
            "Save"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// Main Page Component
export default function CallerIDPage() {
  const [callerIds, setCallerIds] = useState([])
  const [usernames, setUsernames] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [callerToDelete, setCallerToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [newCallerId, setNewCallerId] = useState(DEFAULT_NEW_CALLER_ID)
  const [editCallerId, setEditCallerId] = useState(DEFAULT_NEW_CALLER_ID)
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importModalShow, setImportModalShow] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [importError, setImportError] = useState("")
  const [importSuccess, setImportSuccess] = useState("")

  // Add a new notification
  const addNotification = (message, type = 'success', duration = 5000) => {
    const id = Date.now()
    const notification = { id, message, type }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [callerRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/CallerId/affiche"),
          axios.get("http://localhost:5000/api/admin/users/users"),
        ])
        setCallerIds(callerRes.data.callerid)
        setUsernames(userRes.data.users)
      } catch (e) {
        addNotification("Error loading data. Please refresh the page.", 'error')
        console.error("Error fetching data:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter caller IDs based on search term
  const filteredCallerIds = callerIds.filter(
    (caller) =>
      caller.callerid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caller.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(0)
  }

  // Paginate caller IDs
  const pageCount = Math.ceil(filteredCallerIds.length / ITEMS_PER_PAGE)
  const pagedCallerIds = filteredCallerIds.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  // Success and error helpers
  const showSuccess = (message, duration = 5000) => {
    return addNotification(message, 'success', duration)
  }
  
  const showError = (message, duration = 5000) => {
    return addNotification(message, 'error', duration)
  }

  // Handlers
  const handleAddCallerId = async (e) => {
    e?.preventDefault();
    if (!newCallerId.callerid || !newCallerId.username || !newCallerId.name) {
      addNotification("Please fill in all required fields.", 'error')
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post("http://localhost:5000/api/admin/CallerId/ajouter", newCallerId)
      setShowAddModal(false)
      setNewCallerId(DEFAULT_NEW_CALLER_ID)
      showSuccess("✅ Caller ID added successfully")
      // Refresh list
      const res = await axios.get("http://localhost:5000/api/admin/CallerId/affiche")
      setCallerIds(res.data.callerid)
    } catch (err) {
      console.error("Error adding caller ID:", err)
      addNotification(`❌ ${err.response?.data?.message || 'Error adding Caller ID'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCallerId = async (e) => {
    e?.preventDefault();
    if (!editCallerId.callerid || !editCallerId.username || !editCallerId.name) {
      addNotification("Please fill in all required fields.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert the activated status to a string
      const activatedStatus = editCallerId.activated ? "1" : "0";
      
      // Prepare the update data
      const updateData = {
        cid: editCallerId.callerid,
        id_user: editCallerId.username, // username contains the user ID
        name: editCallerId.name,
        description: editCallerId.description || "",
        activated: activatedStatus
      };

      console.log('Updating Caller ID with data:', updateData);

      const response = await axios.put(
        `http://localhost:5000/api/admin/CallerId/modifier/${editCallerId.id}`,
        updateData
      );

      console.log('Update response:', response.data);

      setShowEditModal(false);
      setEditCallerId(DEFAULT_NEW_CALLER_ID);
      showSuccess("✅ Caller ID updated successfully");
      
      // Refresh the caller IDs list
      const res = await axios.get("http://localhost:5000/api/admin/CallerId/affiche");
      setCallerIds(res.data.callerid);
    } catch (err) {
      console.error("Error editing caller ID:", err);
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         err.message || 
                         'Error updating Caller ID';
      addNotification(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Open delete confirmation modal
  const confirmDelete = (id) => {
    const caller = callerIds.find((c) => c.id === id)
    setCallerToDelete(caller)
    setDeleteError("")
    setShowDeleteModal(true)
  }

  // Handle actual deletion
  const handleDeleteCallerId = async () => {
    if (!callerToDelete) return

    setIsDeleting(true)
    setDeleteError("")

    try {
      await axios.delete(`http://localhost:5000/api/admin/CallerId/delete/${callerToDelete.id}`)
      showSuccess(`Caller ID ${callerToDelete.cid} has been successfully deleted.`)
      setShowDeleteModal(false)
      // Refresh list
      const res = await axios.get("http://localhost:5000/api/admin/CallerId/affiche")
      setCallerIds(res.data.callerid)
    } catch (err) {
      console.error("Error deleting caller ID:", err)
      addNotification(`Failed to delete Caller ID ${callerToDelete.cid}. Please try again.`, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Modal openers
  function openEditModal(caller) {
    setEditCallerId({
      id: caller.id,
      callerid: caller.cid,
      username: caller.id_user,
      name: caller.name,
      description: caller.description,
      status: caller.activated.toString(),
    })
    setShowEditModal(true)
  }

  // Handle page change
  const handlePageClick = (data) => {
    setCurrentPage(data.selected)
  }

  // Handle file selection for import
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setImportFile(file)
        addNotification("File selected successfully.", 'success')
      } else {
        addNotification("Please select a valid CSV file.", 'error')
      }
    }
  }

  // Fetch caller IDs from the server
  const fetchCallerIds = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/CallerId/affiche")
      setCallerIds(res.data.callerid)
    } catch (err) {
      console.error("Error fetching caller IDs:", err)
      addNotification("Error while fetching caller IDs.", 'error')
    }
  }

  // Handle import submission
  const handleImportSubmit = async () => {
    if (!importFile) {
      addNotification("Please select a file to import.", 'error')
      return
    }

    const formData = new FormData()
    formData.append("file", importFile)

    setIsImporting(true)
    addNotification("Importing file...", 'success')

    try {
      const response = await axios.post("/api/callerid/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      showSuccess(`Caller IDs imported successfully.`)
      fetchCallerIds()
      setImportModalShow(false)
    } catch (error) {
      console.error("Error importing CSV:", error)
      addNotification(`Error while importing file: ${error.response?.data?.message || 'Unknown error'}`, 'error')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div
      className="min-vh-100 caller-id-page"
      style={{
        background: "linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .caller-id-page:before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(13,110,253,0.1) 0%, rgba(13,110,253,0) 70%);
          top: -100px;
          right: -100px;
          z-index: 0;
        }
        .caller-id-page:after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(13,110,253,0.1) 0%, rgba(13,110,253,0) 70%);
          bottom: 50px;
          left: -50px;
          z-index: 0;
        }
        .main-card {
          border-radius: 1rem;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .floating-icon {
          position: absolute;
          animation: float 10s infinite;
        }
        .pulse-effect {
          position: relative;
        }
        .pulse-effect:after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          z-index: -1;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .btn-hover-effect {
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: all 0.3s ease;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .icon-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .btn-hover-effect:hover .icon-container {
          transform: scale(1.2);
        }
        .search-input:focus {
          background: #ffffff !important;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
          transform: translateY(-2px);
          border-left: 4px solid #0d6efd !important;
        }
        .status-icon {
          display: inline-flex;
          animation: pulse 2s infinite;
        }
        .action-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          z-index: 1;
          border-radius: 6px;
        }
        .action-btn:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0%;
          height: 100%;
          z-index: -1;
          transition: all 0.3s ease;
        }
        .edit-btn:before {
          background-color: rgba(13, 110, 253, 0.1);
        }
        .delete-btn:before {
          background-color: rgba(220, 53, 69, 0.1);
        }
        .action-btn:hover:before {
          width: 100%;
        }
        .btn-icon {
          display: inline-flex;
          transition: transform 0.3s ease;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />

      <div className="dashboard-main" style={{ marginLeft: "80px" }}>
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow border-0 overflow-hidden main-card">
                <CallerIDHeader
                  onAddClick={() => setShowAddModal(true)}
                  onImportClick={() => setImportModalShow(true)}
                  callerIds={callerIds}
                  isExporting={false}
                />
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {/* Toast Notifications */}
                  <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
                    <div className="d-flex flex-column">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`toast show mb-2 ${notification.type === 'success' ? 'bg-success' : 'bg-danger'}`}
                          role="alert"
                          style={{ minWidth: '300px' }}
                        >
                          <div className="d-flex">
                            <div className="toast-body text-white d-flex align-items-center">
                              {notification.type === 'success' ? 
                                <FaCheckCircle className="me-2" /> : 
                                <FaTimesCircle className="me-2" />
                              }
                              {notification.message}
                            </div>
                            <button 
                              type="button" 
                              className="btn-close btn-close-white me-2 m-auto" 
                              onClick={() => removeNotification(notification.id)}
                              aria-label="Close"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legacy message containers (kept for any direct state updates) */}
                  <div style={{ display: 'none' }}>
                    {importError && <div>{importError}</div>}
                    {importSuccess && <div>{importSuccess}</div>}
                  </div>

                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <SearchBar searchTerm={searchTerm} onSearchChange={(e) => setSearchTerm(e.target.value)} />
                    </Col>
                  </Row>

                  <CallerIdTable
                    callerIds={pagedCallerIds}
                    onEdit={openEditModal}
                    onDelete={confirmDelete}
                    isLoading={isLoading}
                  />

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!isLoading && (
                        <>
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{pagedCallerIds.length}</span> out of{" "}
                            {filteredCallerIds.length} Caller IDs
                            <span className="fw-semibold">{pagedCallerIds.length}</span> out of {filteredCallerIds.length}{" "}
                            Caller IDs
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtered from {callerIds.length} total
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <PaginationSection
                      pageCount={pageCount}
                      onPageChange={handlePageClick}
                      currentPage={currentPage}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <CallerIdModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        title="Add Caller ID"
        onSubmit={(e) => handleAddCallerId(e)}
        callerId={newCallerId}
        usernames={usernames}
        onUsernameChange={(username) => setNewCallerId((prev) => ({ ...prev, username }))}
        onInputChange={(e, field) => setNewCallerId((prev) => ({ ...prev, [field]: e.target.value }))}
        isSubmitting={isSubmitting}
      />

      <CallerIdModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="Edit Caller ID"
        onSubmit={(e) => handleEditCallerId(e)}
        callerId={editCallerId}
        usernames={usernames}
        onUsernameChange={(username) => setEditCallerId((prev) => ({ ...prev, username }))}
        onInputChange={(e, field) => setEditCallerId((prev) => ({ ...prev, [field]: e.target.value }))}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => !isDeleting && setShowDeleteModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {deleteError && (
            <Alert variant="danger" className="d-flex align-items-center">
              <FaTimesCircle className="me-2" />
              {deleteError}
            </Alert>
          )}
          <p className="mb-1">
            You're about to delete the following Caller ID:
          </p>
          <div className="bg-light p-3 rounded mb-3">
            <div className="d-flex align-items-center mb-2">
              <strong className="me-2">ID:</strong>
              <span>{callerToDelete?.id}</span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-2">Number:</strong>
              <span className="text-primary fw-bold">{callerToDelete?.cid}</span>
            </div>
          </div>
          <p className="text-muted small d-flex align-items-center mt-3">
            <FaInfoCircle className="me-2" />
            This action cannot be undone. Are you sure you want to continue?
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteCallerId}
            disabled={isDeleting}
            className="px-4"
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrashAlt className="me-2" />
                Delete Permanently
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import CSV Modal */}
      <Modal show={importModalShow} onHide={() => setImportModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Caller IDs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Upload a CSV file containing Caller IDs to import.</p>
          <p className="small text-muted mb-3">
            The file should contain the following columns: Caller ID, Name, User, Description, Status
          </p>
          
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select CSV File</Form.Label>
            <Form.Control 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
            />
            {importFile && (
              <div className="mt-2">
                <strong>Selected file:</strong> {importFile.name}
              </div>
            )}
          </Form.Group>

          {importError && <Alert variant="danger">{importError}</Alert>}
          {importSuccess && <Alert variant="success">{importSuccess}</Alert>}

          <div className="mt-3">
            <a 
              href="/templates/callerid_template.csv" 
              download="callerid_template.csv"
              className="btn btn-sm btn-outline-secondary me-2"
            >
              Download Template
            </a>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setImportModalShow(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleImportSubmit}
            disabled={isImporting || !importFile}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
