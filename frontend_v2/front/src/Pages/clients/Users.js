"use client"

import React, { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { 
  Table, 
  Dropdown, 
  Modal, 
  Button, 
  Form, 
  Tabs, 
  Tab, 
  InputGroup, 
  Toast, 
  ToastContainer, 
  Card, 
  Container, 
  Row, 
  Col, 
  Badge, 
  Spinner, 
  Alert 
} from "react-bootstrap"
import { CSVLink } from "react-csv"
import {
  FaChevronDown,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaLock,
  FaUnlock,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaUserPlus,
  FaUsers,
  FaFilter,
  FaSyncAlt,
  FaUser
} from "react-icons/fa"

// Component definitions to fix ESLint errors
const UsersHeader = ({ onAddClick, users, isExporting, onExportClick }) => (
  <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
    <div className="bg-primary p-3 w-100 position-relative">
      <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
        {Array(5).fill().map((_, i) => (
          <div key={i} className="floating-icon position-absolute" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
          }}>
            <FaUsers className="text-white opacity-25" style={{
              fontSize: `${Math.random() * 1.5 + 0.5}rem`,
            }} />
          </div>
        ))}
      </div>
      <div className="d-flex align-items-center position-relative z-2">
        <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
          <FaUsers className="text-primary fs-3" />
        </div>
        <div>
          <h2 className="fw-bold mb-0 text-white">Gestion des Utilisateurs</h2>
          <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos utilisateurs facilement</p>
        </div>
      </div>
    </div>
    <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
      <div className="d-flex align-items-center gap-3">
        <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
          <span className="me-2 fw-normal">Total: <span className="fw-bold">{users.length}</span></span>
          <span className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: "24px", height: "24px"}}>
            <FaUsers size={12} />
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
            <FaUserPlus />
          </div>
          <span>Ajouter</span>
        </Button>
        <Button
          variant="success"
          onClick={onExportClick}
          className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
        >
          <div className="icon-container">
            <FaDownload />
          </div>
          <span>Exporter</span>
        </Button>
      </div>
    </div>
  </Card.Header>
)

const SearchBar = ({ searchTerm, onSearchChange }) => (
  <div className="search-container position-relative mb-4">
    <div className="position-absolute top-50 start-0 translate-middle-y ps-3 search-icon">
      <FaSearch className="text-primary" />
    </div>
    <Form.Control
      type="text"
      placeholder="Rechercher un utilisateur..."
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

// Helper function to get status display text
const getStatusDisplay = (status) => {
  switch(String(status)) {
    case '1': return 'Active';
    case '0': return 'Inactive';
    case '2': return 'Pending';
    case '3': return 'Blocked';
    case '4': return 'Blocked In Out';
    default: return 'Unknown';
  }
}

// Helper function to get status badge color
const getStatusBadgeColor = (status) => {
  switch(String(status)) {
    case '1': return 'success';
    case '0': return 'secondary';
    case '2': return 'warning';
    case '3': return 'danger';
    case '4': return 'danger';
    default: return 'light';
  }
}

const UsersTable = ({ users, selectedColumns, onEdit, onDelete, isLoading, onStatusFilterChange, statusFilter }) => (
  <div
    className="table-responsive shadow-sm table-container"
    style={{
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #e9ecef",
    }}
  >
    {isLoading ? (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des données...</p>
      </div>
    ) : users.length === 0 ? (
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
            <FaUsers className="text-primary" />
          </div>
        </div>
        <h4 className="text-dark mb-3">Aucun utilisateur trouvé</h4>
        <p className="text-muted mb-4">Ajoutez un nouvel utilisateur ou modifiez votre recherche</p>
        <Button variant="primary" onClick={() => window.location.reload()} className="btn-hover-effect">
          <div className="icon-container me-2">
            <FaSyncAlt />
          </div>
          Rafraîchir la page
        </Button>
      </div>
    ) : (
      <Table hover className="align-middle mb-0 elegant-table">
        <thead
          style={{
            backgroundColor: "#f8f9fa",
            color: "#495057",
            borderBottom: "2px solid #dee2e6",
          }}
        >
          <tr>
            {selectedColumns.map((col, index) => (
              <th
                key={index}
                className="py-3 px-4"
                style={{
                  position: "relative",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  border: "none",
                  paddingTop: "15px",
                  paddingBottom: "15px",
                }}
              >
                {col === 'active' ? (
                  <div className="d-flex align-items-center gap-2">
                    <span>Status</span>
                    <Dropdown>
                      <Dropdown.Toggle 
                        variant="outline-secondary" 
                        size="sm" 
                        className="p-0 px-1 border-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaFilter className="text-muted" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item 
                          active={statusFilter === 'all'}
                          onClick={() => onStatusFilterChange('all')}
                        >
                          Tous les statuts
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          active={statusFilter === '1'}
                          onClick={() => onStatusFilterChange('1')}
                        >
                          <Badge bg="success" className="me-2">•</Badge>
                          Actif
                        </Dropdown.Item>
                        <Dropdown.Item 
                          active={statusFilter === '0'}
                          onClick={() => onStatusFilterChange('0')}
                        >
                          <Badge bg="secondary" className="me-2">•</Badge>
                          Inactif
                        </Dropdown.Item>
                        <Dropdown.Item 
                          active={statusFilter === '2'}
                          onClick={() => onStatusFilterChange('2')}
                        >
                          <Badge bg="warning" className="me-2">•</Badge>
                          En attente
                        </Dropdown.Item>
                        <Dropdown.Item 
                          active={statusFilter === '3'}
                          onClick={() => onStatusFilterChange('3')}
                        >
                          <Badge bg="danger" className="me-2">•</Badge>
                          Bloqué
                        </Dropdown.Item>
                        <Dropdown.Item 
                          active={statusFilter === '4'}
                          onClick={() => onStatusFilterChange('4')}
                        >
                          <Badge bg="danger" className="me-2">•</Badge>
                          Bloqué Entrant/Sortant
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                ) : (
                  col
                )}
              </th>
            ))}
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
          {users.map((user, index) => (
            <tr
              key={index}
              className="border-top"
              style={{
                transition: "all 0.2s ease",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              {selectedColumns.map((col, idx) => (
                <td key={idx} className="py-3 px-4">
                  {col === 'active' ? (
                    <Badge bg={getStatusBadgeColor(user[col])} className="text-capitalize">
                      {getStatusDisplay(user[col])}
                    </Badge>
                  ) : (
                    user[col]
                  )}
                </td>
              ))}
              <td className="py-3 px-4 text-center">
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="outline-primary"
                    onClick={() => onEdit(user.id)}
                    size="sm"
                    className="p-1"
                    title="Modifier"
                  >
                    <FaEdit className="fs-5" />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => onDelete(user.id)}
                    size="sm"
                    className="p-1"
                    title="Supprimer"
                  >
                    <FaTrash className="fs-5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </div>
)

const PaginationSection = ({ currentPage, totalPages, onPageChange }) => (
  <div className="d-flex justify-content-center">
    <nav>
      <ul className="pagination pagination-md">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
            &laquo;
          </button>
        </li>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  </div>
)

function Users() {
  // États principaux
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingCredit, setEditingCredit] = useState(null)
  const [creditValue, setCreditValue] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: 'credit', direction: 'asc' })

  // États pour la recherche et les colonnes
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedColumns, setSelectedColumns] = useState(["username", "credit", "active", "sip_count", "creationdate"])
  const [dropdownVisibility, setDropdownVisibility] = useState({})
  const [statusFilter, setStatusFilter] = useState("all") // 'all', '1' (Active), '0' (Inactive), '2' (Pending), '3' (Blocked), '4' (Blocked In Out)

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // États pour les formulaires
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [showEditUserForm, setShowEditUserForm] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // States for toasts
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success") // success, danger, warning

  // States for New User
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    group: "",
    plan: "",
    language: "en",
    status: "Active",
    country: "United States/Canada",
    description: "",
    company: "",
    companyn: "",
    commercialco: "",
    state: "",
    firstname: "",
    city: "",
    adresse: "",
    Neighborhood: "",
    Zipcode: "",
    Phone: "",
    Mobile: "",
    Email: "",
    Email2: "",
    DOC: "",
    VAT: "",
    Contractvalue: "",
    DIST: "",
    numberOfSipUsers: 1,
    numberOfIax: 1,
    expirationDate: "",
    call: "",
    DIsk: "",
    sip: "",
    pin: "",
    restriction: "No",
  })

  // States for Edit User
  const [editUser, setEditUser] = useState({
    username: "",
    password: "",
    group: "",
    plan: "",
    language: "en",
    status: "Active",
    country: "United States/Canada",
    description: "",
    company: "",
    companyn: "",
    commercialco: "",
    state: "",
    firstname: "",
    city: "",
    adresse: "",
    Neighborhood: "",
    Zipcode: "",
    Phone: "",
    Mobile: "",
    Email: "",
    Email2: "",
    DOC: "",
    VAT: "",
    Contractvalue: "",
    DIST: "",
    numberOfSipUsers: 1,
    numberOfIax: 1,
    expirationDate: "",
    call: "",
    DIsk: "",
    sip: "",
    pin: "",
    restriction: "No",
  })

  // States for additional data
  const [groups, setGroups] = useState([])
  const [plans, setPlans] = useState([])

  // States for deletion
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState(null)

  // Error states
  const [errors, setErrors] = useState("")

  // Notification handling
  const showNotification = (message, type = "success") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 5000)
  }

  // Available columns
  const availableColumns = [
    "username",
    "credit",
    "plan_name",
    "group_name",
    "agent",
    "status",
    "creationdate",
    "sip_count",
    "email",
    "phone",
    "address",
    "city",
    "lastname",
    "firstname",
    "mobile",
    "email2",
    "vat",
    "company_name",
    "company_website",
    "lastusedate",
    "expirationdate",
    "contract_value",
    "last_login",
    "googleAuthenticator_enable",
    "callingcard_pin",
    "description",
    "last_notification",
  ]

  // Fetch groups
  const fetchGroup = () => {
    axios
      .get("http://localhost:5000/api/admin/users/groups")
      .then((response) => {
        setGroups(response.data.groups)
      })
      .catch((err) => {
        console.error("Error fetching groups:", err)
        setError("Error fetching groups")
      })
  }

  const [showPassword, setShowPassword] = useState(false)

  // Generate secure password
  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (password.length === 0) return 0
    let strength = 0

    // Length check
    if (password.length >= 8) strength += 1
    if (password.length >= 10) strength += 1

    // Character diversity checks
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    return strength
  }

  // Get password strength color
  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return "danger"
    if (strength <= 4) return "warning"
    return "success"
  }

  // Get password strength text
  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return "Weak"
    if (strength <= 4) return "Medium"
    return "Strong"
  }

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  // Fonction pour rendre le champ de crédit éditable
  const renderCreditCell = (user) => {
    if (editingCredit === user.id) {
      return (
        <div className="d-flex align-items-center">
          <input
            type="text"
            className="form-control form-control-sm me-2"
            style={{ width: '80px' }}
            value={creditValue}
            onChange={handleCreditChange}
            onKeyDown={(e) => handleKeyDown(e, user.id)}
            autoFocus
          />
          <button 
            className="btn btn-sm btn-success me-1"
            onClick={() => saveCredit(user.id)}
          >
            <FaCheckCircle />
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={cancelEditing}
          >
            <FaTimesCircle />
          </button>
        </div>
      );
    }
    
    return (
      <div 
        className="d-flex align-items-center justify-content-between"
        onClick={() => startEditingCredit(user)}
        style={{ cursor: 'pointer', minHeight: '38px' }}
      >
        <span>{user.credit || '0.00'}</span>
        <FaEdit className="text-muted ms-2" />
      </div>
    );
  };

  // Fetch plans
  const fetchPlan = () => {
    axios
      .get("http://localhost:5000/api/admin/users/plans")
      .then((response) => {
        setPlans(response.data.plans)
      })
      .catch((err) => {
        console.error("Error fetching plans:", err)
        setError("Error fetching plans")
      })
  }

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/admin/users/affiche")
      .then((response) => {
        setUsers(response.data.users)
        setFilteredUsers(response.data.users)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching users:", err)
        setError("Error fetching users")
        setLoading(false)
      })
  }

  // Initial effect
  useEffect(() => {
    fetchUsers()
    fetchGroup()
    fetchPlan()
  }, [])

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  // Apply all filters (search and status)
  const applyFilters = (usersList, searchTerm, status) => {
    let filtered = [...usersList]

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter(user => String(user.active) === status)
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => {
        return Object.entries(user).some(([key, value]) => {
          // Skip filtering on certain fields like 'id' or other non-searchable fields
          if (['id', 'active'].includes(key)) return false
          // Convert value to string safely
          const stringValue = value !== null && value !== undefined ? String(value) : ''
          return stringValue.toLowerCase().includes(term)
        })
      })
    }

    return filtered
  }

  // Update filtered users when search term or status filter changes
  useEffect(() => {
    const filtered = applyFilters(users, searchTerm, statusFilter)
    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter])

  // Search handling
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase())
  }

  // Fonction pour trier les utilisateurs
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Trier les utilisateurs
  const sortedUsers = useMemo(() => {
    let sortableItems = [...filteredUsers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUsers, sortConfig]);

  // Fonction pour démarrer l'édition du crédit
  const startEditingCredit = (user) => {
    setEditingCredit(user.id);
    setCreditValue(user.credit || '');
  };

  // Fonction pour sauvegarder le crédit modifié
  const saveCredit = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/users/update-credit/${userId}`, {
        credit: parseFloat(creditValue) || 0
      });
      
      if (response.data.success) {
        // Mettre à jour l'utilisateur dans la liste
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, credit: parseFloat(creditValue) || 0 } : user
        );
        
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setEditingCredit(null);
        showNotification('Crédit mis à jour avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du crédit:', error);
      showNotification('Erreur lors de la mise à jour du crédit', 'danger');
    }
  };

  // Fonction pour annuler l'édition
  const cancelEditing = () => {
    setEditingCredit(null);
    setCreditValue('');
  };

  // Fonction pour gérer les changements dans le champ de crédit
  const handleCreditChange = (e) => {
    const value = e.target.value;
    // Valider que la valeur est un nombre ou vide
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCreditValue(value);
    }
  };

  // Fonction pour gérer la touche Entrée
  const handleKeyDown = (e, userId) => {
    if (e.key === 'Enter') {
      saveCredit(userId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  // This will be defined after handleNewUserSubmit is initialized
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Column handling
  const handleColumnChange = (column) => {
    if (!selectedColumns.includes(column)) {
      setSelectedColumns((prevColumns) => [...prevColumns, column])
    }
  }

  const toggleDropdown = (column) => {
    setDropdownVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }))
  }

  // CSV export
  const exportToCSV = () => {
    const csvContent = [
      selectedColumns.join(","),
      ...users.map((user) => selectedColumns.map((col) => user[col] || "").join(",")),
    ].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Delete handling
  const handleDelete = (id) => {
    setUserIdToDelete(id)
    setShowConfirmModal(true)
  }

  const confirmDelete = () => {
    axios
      .delete(`http://localhost:5000/api/admin/users/supprimer/${userIdToDelete}`)
      .then(() => {
        fetchUsers();
        setShowConfirmModal(false);
        showNotification("User deleted successfully", "success");
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.data) {
          // Translate the error message if it's in French
          let errorMessage = err.response.data.error;
          if (errorMessage.includes("lié à des enregistrements DID")) {
            errorMessage = "This user is linked to DID records. Please delete or reassign these records before deleting the user.";
          }
          showNotification(errorMessage, "danger");
        } else {
          showNotification("Error deleting user", "danger");
        }
      });
  };

  // Form change handling
  const handleNewUserChange = (e) => {
    const { name, value } = e.target
    // Ensure numberOfSipUsers is an integer
    if (name === "numberOfSipUsers") {
      setNewUser((prevState) => ({ ...prevState, [name]: Number.parseInt(value, 10) || 0 }))
    } else {
      setNewUser((prevState) => ({ ...prevState, [name]: value }))
    }
  }

  const handleEditUserChange = (e) => {
    const { name, value } = e.target
    setEditUser((prevState) => ({ ...prevState, [name]: value }))
  }

  // Check if username already exists
  const checkUsernameExists = async (username) => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users/users")
      const existingUsers = response.data.users
      return existingUsers.some((user) => user.username === username)
    } catch (error) {
      console.error("Error checking username:", error)
      return false
    }
  }

  // New User form submission
  const handleNewUserSubmit = async (e) => {
    e.preventDefault()

    // Check if username already exists
    const usernameExists = await checkUsernameExists(newUser.username)
    if (usernameExists) {
      showNotification("This username already exists", "danger")
      return
    }

    const statusMapping = {
      Active: 1,
      Inactive: 0,
      Pending: 2,
      Blocked: 3,
      "Blocked In Out": 4,
    }

    const activeStatus = statusMapping[newUser.status] !== undefined ? statusMapping[newUser.status] : 0

    const userData = {
      username: newUser.username,
      password: newUser.password || generateSecurePassword(),
      id_group: newUser.group,
      id_plan: newUser.plan,
      language: newUser.language,
      active: activeStatus, // Use the mapped numeric value
      email: newUser.Email,
      numberOfSipUsers: newUser.numberOfSipUsers, // Ensure this is correct
      numberOfIax: newUser.numberOfIax,
      company: newUser.company,
      company_name: newUser.companyn,
      commercial_name: newUser.commercialco,
      state_number: newUser.state,
      firstname: newUser.firstname,
      city: newUser.city,
      address: newUser.adresse,
      neighborhood: newUser.Neighborhood,
      zipcode: newUser.Zipcode,
      phone: newUser.Phone,
      mobile: newUser.Mobile,
      email2: newUser.Email2,
      doc: newUser.DOC,
      vat: newUser.VAT,
      contract_value: newUser.Contractvalue || 0,
      dist: newUser.DIST,
      expiration_date: newUser.expirationDate,
      call_limit: newUser.call,
      disk_space: newUser.DIsk,
      sip_account_limit: newUser.sip,
      callingcard_pin: newUser.pin,
      restriction: newUser.restriction,
      description: newUser.description,
    }

    console.log("User Data to send:", userData) // Debugging log

    try {
      const response = await fetch("http://localhost:5000/api/admin/users/ajouter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()
      console.log("User added:", result)
      fetchUsers()
      setShowNewUserForm(false)
      setShowAddModal(false)
      setNewUser({
        username: "",
        password: "",
        group: "",
        plan: "",
        language: "en",
        status: "Active",
        country: "United States/Canada",
        description: "",
        numberOfSipUsers: 1,
        numberOfIax: 1,
      })
      showNotification("User added successfully", "success")
    } catch (error) {
      console.error("Error adding user:", error)
      showNotification("Error adding user", "danger")
    }
  }

  // Alias for handleNewUserSubmit to use with the add modal
  const handleAddUserSubmit = handleNewUserSubmit;
  
  // Edit User form submission
  const handleEditUserSubmit = async (e) => {
    e.preventDefault()

    // Map status to the correct value
    const statusMapping = {
      'Active': 1,
      'Inactive': 0,
      'Pending': 2,
      'Blocked': 3,
      'Blocked In Out': 4
    };
    
    // Get the numeric status value from the mapping
    const activeStatus = statusMapping[editUser.status] !== undefined 
      ? statusMapping[editUser.status] 
      : 1; // Default to Active if status not recognized

    // Create a more complete userData object with all fields
    const userData = {
      username: editUser.username,
      id_group: editUser.group,
      id_plan: editUser.plan,
      language: editUser.language,
      active: activeStatus, // Use the mapped numeric value
      email: editUser.Email,
      firstname: editUser.firstname,
      city: editUser.city,
      address: editUser.adresse,
      neighborhood: editUser.Neighborhood,
      zip_code: editUser.Zipcode,
      phone: editUser.Phone,
      mobile: editUser.Mobile,
      email2: editUser.Email2,
      doc: editUser.DOC,
      vat: editUser.VAT,
      contract_value: editUser.Contractvalue,
      description: editUser.description,
    }

    // Only include password if it's not empty
    if (editUser.password) {
      userData.password = editUser.password
    }

    console.log("Sending update data:", userData)

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/modifier/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()
      console.log("User updated:", result)

      // Refresh the user list to show the updated data
      fetchUsers()
      setShowEditUserForm(false)
      resetEditUserForm()
      showNotification("User updated successfully", "success")
    } catch (error) {
      console.error("Error updating user:", error)
      showNotification("Error updating user", "danger")
    }
  }

  // Reset the form after submission
  const resetEditUserForm = () => {
    setEditUser({
      id: "",
      username: "",
      password: "",
      group: "",
      plan: "",
      language: "en",
      status: "Active",
      country: "United States/Canada",
      description: "",
      // Reset other fields...
    })
  }

  // Edit a user
  const handleEdit = (id) => {
    // First, fetch the complete user data from the backend
    axios
      .get(`http://localhost:5000/api/admin/users/user/${id}`)
      .then((response) => {
        const userToEdit = response.data.user

        // If the API endpoint isn't available yet, fall back to the existing method
        if (!userToEdit) {
          const userToEdit = users.find((user) => user.id === id)
          populateEditForm(userToEdit)
          return
        }

        populateEditForm(userToEdit)
      })
      .catch((err) => {
        console.error("Error fetching user details:", err)
        // Fall back to the existing method if the API call fails
        const userToEdit = users.find((user) => user.id === id)
        populateEditForm(userToEdit)
      })
  }

  // Helper function to populate the edit form with all user data
  const populateEditForm = (userToEdit) => {
    if (!userToEdit) return

    // Map active status to the correct value
    let statusValue
    if (userToEdit.active === 1) statusValue = "Active"
    else if (userToEdit.active === 0) statusValue = "Inactive"
    else if (userToEdit.active === 2) statusValue = "Pending"
    else if (userToEdit.active === 3) statusValue = "Blocked"
    else if (userToEdit.active === 4) statusValue = "Blocked In Out"
    else statusValue = "Active" // Default to active if unknown

    setEditUser({
      id: userToEdit.id,
      username: userToEdit.username || "",
      password: userToEdit.password || "", // Use existing password if available
      group: userToEdit.id_group || "",
      plan: userToEdit.id_plan || "",
      language: userToEdit.language || "en",
      status: statusValue,
      country: userToEdit.country || "United States/Canada",
      description: userToEdit.description || "",
      company: userToEdit.company || "",
      company_name: userToEdit.company_name || "",
      commercial_name: userToEdit.commercial_name || "",
      state_number: userToEdit.state_number || "",
      firstname: userToEdit.firstname || "",
      city: userToEdit.city || "",
      adresse: userToEdit.address || "",
      neighborhood: userToEdit.neighborhood || "",
      zipcode: userToEdit.zip_code || "",
      phone: userToEdit.phone || "",
      mobile: userToEdit.mobile || "",
      email: userToEdit.email || "",
      email2: userToEdit.email2 || "",
      doc: userToEdit.doc || "",
      vat: userToEdit.vat || "",
      contract_value: userToEdit.contract_value || "",
      dist: userToEdit.dist || "",
      numberOfSipUsers: userToEdit.sip_count || 0,
      numberOfIax: userToEdit.iax_count || 0,
      expirationDate: userToEdit.expiration_date || "",
      call: userToEdit.call_limit || "",
      disk_space: userToEdit.disk_space || "",
      sip_account_limit: userToEdit.sip_account_limit || "",
      callingcard_pin: userToEdit.callingcard_pin || "",
      restriction: userToEdit.restriction || "No",
    })

    setShowEditUserForm(true)
  }

  // Render the main content
  return (
    <div
      className="min-vh-100 users-page"
      style={{
        background: "linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .users-page:before {
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
        .users-page:after {
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

      {/* Enhanced Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          className="notification-toast border-0 shadow-lg" 
          style={{ 
            minWidth: "300px", 
            borderRadius: "8px",
            borderLeft: toastType === "success" ? "4px solid #198754" : 
                      toastType === "danger" ? "4px solid #dc3545" : 
                      "4px solid #ffc107",
            transition: "transform 0.3s ease",
            boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)"
          }}
        >
          <Toast.Header className="bg-white border-0 d-flex align-items-center">
            <div className="me-2">
              {toastType === "success" && <FaCheckCircle className="text-success" size={18} />}
              {toastType === "danger" && <FaTimesCircle className="text-danger" size={18} />}
              {toastType === "warning" && <FaExclamationCircle className="text-warning" size={18} />}
            </div>
            <strong className="me-auto fw-semibold">
              {toastType === "success" && "Success"}
              {toastType === "danger" && "Error"}
              {toastType === "warning" && "Warning"}
            </strong>
            <small className="text-muted">just now</small>
          </Toast.Header>
          <Toast.Body className="bg-white text-dark py-3">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      {/* Add CSS for toast animations */}
      <style>
        {`
          .notification-toast:hover {
            transform: translateY(-3px);
          }
        `}
      </style>
      
      <Container fluid className="px-4 py-4">  
        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="shadow-lg border-0 mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
                <div className="bg-primary p-3 w-100 position-relative">
                  <div className="position-absolute top-50 start-0 translate-middle-y ps-3 search-icon">
                    <FaSearch className="text-white" />
                  </div>
                  <div className="d-flex align-items-center position-relative z-2">
                    <div className="bg-white rounded-circle p-3 me-3 shadow" style={{ animation: "pulse 2s infinite" }}>
                      <FaUsers className="text-primary fs-3" />
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0 text-white">User Management</h2>
                      <p className="text-white-50 mb-0 d-none d-md-block">Manage your users easily</p>
                    </div>
                  </div>
                </div>
                <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
                      <span className="me-2 fw-normal">Total: <span className="fw-bold">{users.length}</span></span>
                      <span className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: "24px", height: "24px"}}>
                        <FaUsers size={12} />
                      </span>
                    </Badge>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => setShowAddModal(true)} 
                      className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                    >
                      <div className="icon-container">
                        <FaUserPlus />
                      </div>
                      <span>Add</span>
                    </Button>
                    <Button
                      variant="success"
                      onClick={exportToCSV}
                      className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                    >
                      <div className="icon-container">
                        <FaDownload />
                      </div>
                      <span>Export</span>
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaTimesCircle className="me-2" />
                    {error}
                  </Alert>
                )}
                
                <Row className="mb-4">
                  <Col md={6} lg={4}>
                    <div className="search-container position-relative mb-4">
                      <div className="position-absolute top-50 start-0 translate-middle-y ps-3 search-icon">
                        <FaSearch className="text-primary" />
                      </div>
                      <Form.Control
                        type="text"
                        placeholder="Search for a user..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="py-2 ps-5 shadow-sm border-0 search-input"
                        style={{
                          borderRadius: "50rem",
                          background: "#f8f9fa",
                          transition: "all 0.3s ease",
                          borderLeft: "4px solid transparent",
                        }}
                      />
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="ms-auto d-flex justify-content-end align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted">Columns:</span>
                      <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-columns" className="p-0 px-1 border-0">
                          <FaFilter size={14} /> Filter
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {availableColumns.map((col) => (
                            <Dropdown.Item 
                              key={col} 
                              active={selectedColumns.includes(col)}
                              onClick={() => handleColumnChange(col)}
                            >
                              {col}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </Col>
                </Row>

      {/* Modal New User */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered dialogClassName="modal-90w">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaUserPlus className="me-2" /> Add a new user
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAddUserSubmit}>
          <Tabs 
            defaultActiveKey="basicInfo" 
            id="add-user-tabs" 
            className="mb-4 nav-tabs-custom"
            variant="pills"
            fill
          >
            <Tab eventKey="basicInfo" title={<span><FaUser className="me-2" /> Basic Information</span>}>
                <Form.Group controlId="formUsername" className="mb-3">
                  {errors && <div className="alert alert-danger">{errors}</div>}
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={newUser.username}
                    onChange={handleNewUserChange}
                    required
                  />
                  {newUser.username.trim().length < 6 && (
                    <Form.Text className="text-danger">Username must be at least 6 characters long.</Form.Text>
                  )}
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup className="mb-2">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={newUser.password}
                      onChange={handleNewUserChange}
                      required
                    />
                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setNewUser({ ...newUser, password: generateSecurePassword() })}
                    >
                      Generate
                    </Button>
                  </InputGroup>
                  <div className="password-strength mb-2">
                    <div className="progress">
                      <div
                        className={`progress-bar bg-${getPasswordStrengthColor(checkPasswordStrength(newUser.password))}`}
                        role="progressbar"
                        style={{ width: `${(checkPasswordStrength(newUser.password) / 6) * 100}%` }}
                      >
                        {getPasswordStrengthText(checkPasswordStrength(newUser.password))}
                      </div>
                    </div>
                  </div>
                </Form.Group>

                <Form.Group controlId="formGroup" className="mb-3">
                  <Form.Label>Group</Form.Label>
                  <Form.Select name="group" value={newUser.group} onChange={handleNewUserChange} required>
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="formPlan" className="mb-3">
                  <Form.Label>Plan</Form.Label>
                  <Form.Select name="plan" value={newUser.plan} onChange={handleNewUserChange} required>
                    <option value="">Select a plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="formLanguage" className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Control
                    as="select"
                    name="language"
                    value={newUser.language}
                    onChange={handleNewUserChange}
                    required
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="sp">Spanish</option>
                    <option value="it">Portuguese</option>
                    <option value="rs">Russian</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formStatus" className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={newUser.status}
                    onChange={handleNewUserChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Blocked In Out">Blocked In Out</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCountry" className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control as="select" name="country" value={newUser.country} onChange={handleNewUserChange}>
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

                <Form.Group controlId="formDescription" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={newUser.description}
                    onChange={handleNewUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formNumberOfSipUsers" className="mb-3">
                  <Form.Label>Number of SIP Users</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfSipUsers"
                    value={newUser.numberOfSipUsers}
                    onChange={(e) => setNewUser({ ...newUser, numberOfSipUsers: Number.parseInt(e.target.value, 10) })}
                    min="0"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formNumberOfIax" className="mb-3">
                  <Form.Label>Number of IAX</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfIax"
                    value={newUser.numberOfIax}
                    onChange={handleNewUserChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="personalData" title="Personal Data">
                <Form.Group controlId="formCompany" className="mb-3">
                  <Form.Label>Company website</Form.Label>
                  <Form.Control type="text" name="company" value={newUser.company} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formCompanyName" className="mb-3">
                  <Form.Label>Company name</Form.Label>
                  <Form.Control type="text" name="companyn" value={newUser.companyn} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formCommercialName" className="mb-3">
                  <Form.Label>Commercial name</Form.Label>
                  <Form.Control
                    type="text"
                    name="commercialco"
                    value={newUser.commercialco}
                    onChange={handleNewUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formStateNumber" className="mb-3">
                  <Form.Label>State number</Form.Label>
                  <Form.Control type="text" name="state" value={newUser.state} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formFirstName" className="mb-3">
                  <Form.Label>First name</Form.Label>
                  <Form.Control type="text" name="firstname" value={newUser.firstname} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formCity" className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" name="city" value={newUser.city} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formAddress" className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control type="text" name="adresse" value={newUser.adresse} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formNeighborhood" className="mb-3">
                  <Form.Label>Neighborhood</Form.Label>
                  <Form.Control
                    type="text"
                    name="Neighborhood"
                    value={newUser.Neighborhood}
                    onChange={handleNewUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formZipcode" className="mb-3">
                  <Form.Label>Zip code</Form.Label>
                  <Form.Control type="text" name="Zipcode" value={newUser.Zipcode} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formPhone" className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" name="Phone" value={newUser.Phone} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formMobile" className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control type="text" name="Mobile" value={newUser.Mobile} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="Email" value={newUser.Email} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formEmail2" className="mb-3">
                  <Form.Label>Email 2</Form.Label>
                  <Form.Control type="email" name="Email2" value={newUser.Email2} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formDOC" className="mb-3">
                  <Form.Label>DOC</Form.Label>
                  <Form.Control type="text" name="DOC" value={newUser.DOC} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formVAT" className="mb-3">
                  <Form.Label>VAT</Form.Label>
                  <Form.Control type="text" name="VAT" value={newUser.VAT} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formContractValue" className="mb-3">
                  <Form.Label>Contract value</Form.Label>
                  <Form.Control
                    type="text"
                    name="Contractvalue"
                    value={newUser.Contractvalue}
                    onChange={handleNewUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formDIST" className="mb-3">
                  <Form.Label>DIST</Form.Label>
                  <Form.Control type="text" name="DIST" value={newUser.DIST} onChange={handleNewUserChange} />
                </Form.Group>
              </Tab>

              <Tab eventKey="supplementaryInfo" title="Supplementary Info">
                <Form.Group controlId="formTypePaid" className="mb-3">
                  <Form.Label>Type paid</Form.Label>
                  <Form.Control as="select" name="typePaid" onChange={handleNewUserChange}>
                    <option value="Prepaid">Prepaid</option>
                    <option value="Postpaid">Postpaid</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCreditNotificationDaily" className="mb-3">
                  <Form.Label>Credit notification daily</Form.Label>
                  <Form.Control as="select" name="creditNotificationDaily" onChange={handleNewUserChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCreditLimit" className="mb-3">
                  <Form.Label>Credit limit</Form.Label>
                  <Form.Control type="text" name="creditLimit" onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formCreditNotification" className="mb-3">
                  <Form.Label>Credit notification</Form.Label>
                  <Form.Control
                    type="text"
                    name="creditNotification"
                    value={newUser.creditNotification}
                    onChange={handleNewUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formServicesEmailNotification" className="mb-3">
                  <Form.Label>Services email notification</Form.Label>
                  <Form.Control as="select" name="servicesEmailNotification" onChange={handleNewUserChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formDIDEmailNotification" className="mb-3">
                  <Form.Label>DID email notification</Form.Label>
                  <Form.Control as="select" name="DIDEmailNotification" onChange={handleNewUserChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formEnableExpire" className="mb-3">
                  <Form.Label>Enable expire</Form.Label>
                  <Form.Control as="select" name="enableExpire" onChange={handleNewUserChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formExpirationDate" className="mb-3">
                  <Form.Label>Expiration Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expirationDate"
                    value={newUser.expirationDate}
                    onChange={handleNewUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formCallLimit" className="mb-3">
                  <Form.Label>Call limit</Form.Label>
                  <Form.Control type="text" name="call" value={newUser.call} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formRecordCallFormat" className="mb-3">
                  <Form.Label>Record call format</Form.Label>
                  <Form.Control as="select" name="recordCallFormat" onChange={handleNewUserChange}>
                    <option value="gsm">gsm</option>
                    <option value="wav">wav</option>
                    <option value="wav49">wav49</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formCallRecording" className="mb-3">
                  <Form.Label>Call recording</Form.Label>
                  <Form.Control as="select" name="callRecording" onChange={handleNewUserChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formDiskSpace" className="mb-3">
                  <Form.Label>Disk space</Form.Label>
                  <Form.Control type="text" name="DIsk" value={newUser.DIsk} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formSIPAccountLimit" className="mb-3">
                  <Form.Label>SIP account limit</Form.Label>
                  <Form.Control type="text" name="sip" value={newUser.sip} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formCallingCardPIN" className="mb-3">
                  <Form.Label>CallingCard PIN</Form.Label>
                  <Form.Control type="text" name="pin" value={newUser.pin} onChange={handleNewUserChange} />
                </Form.Group>

                <Form.Group controlId="formRestriction" className="mb-3">
                  <Form.Label>Restriction</Form.Label>
                  <Form.Control
                    as="select"
                    name="restriction"
                    value={newUser.restriction}
                    onChange={handleNewUserChange}
                  >
                    <option value="No">Inactive</option>
                    <option value="Yes">Cannot call to restricted numbers</option>
                  </Form.Control>
                </Form.Group>
              </Tab>
            </Tabs>
            <Button variant="primary" type="submit">
              Add User
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Edit User */}
      <Modal show={showEditUserForm} onHide={() => setShowEditUserForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditUserSubmit}>
            <Tabs defaultActiveKey="General" className="mb-3">
              <Tab eventKey="General" title="General">
                <Form.Group controlId="formEditUsername" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={editUser.username}
                    onChange={handleEditUserChange}
                    required
                    disabled
                  />
                </Form.Group>

                <Form.Group controlId="formEditPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={editUser.password}
                      onChange={handleEditUserChange}
                      placeholder="Enter new password if you want to change it"
                    />
                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setEditUser({ ...editUser, password: generateSecurePassword() })}
                    >
                      Generate
                    </Button>
                  </InputGroup>
                  <small className="text-muted">
                    Current password is shown. You can keep it or enter a new one.
                  </small>
                  {editUser.password && (
                    <div className="password-strength mb-2">
                      <div className="progress">
                        <div
                          className={`progress-bar bg-${getPasswordStrengthColor(checkPasswordStrength(editUser.password))}`}
                          role="progressbar"
                          style={{ width: `${(checkPasswordStrength(editUser.password) / 6) * 100}%` }}
                        >
                          {getPasswordStrengthText(checkPasswordStrength(editUser.password))}
                        </div>
                      </div>
                    </div>
                  )}
                </Form.Group>

                <Form.Group controlId="formEditGroup" className="mb-3">
                  <Form.Label>Group</Form.Label>
                  <Form.Select name="group" value={editUser.group} onChange={handleEditUserChange} required>
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="formEditPlan" className="mb-3">
                  <Form.Label>Plan</Form.Label>
                  <Form.Select name="plan" value={editUser.plan} onChange={handleEditUserChange} required>
                    <option value="">Select a plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="formEditLanguage" className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Control
                    as="select"
                    name="language"
                    value={editUser.language}
                    onChange={handleEditUserChange}
                    required
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="sp">Spanish</option>
                    <option value="it">Portuguese</option>
                    <option value="rs">Russian</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formEditStatus" className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={editUser.status}
                    onChange={handleEditUserChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Blocked In Out">Blocked In Out</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formEditCountry" className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control as="select" name="country" value={editUser.country} onChange={handleEditUserChange}>
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

                <Form.Group controlId="formEditDescription" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={editUser.description}
                    onChange={handleEditUserChange}
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="personalData" title="Personal Data">
                <Form.Group controlId="formEditCompany" className="mb-3">
                  <Form.Label>Company website</Form.Label>
                  <Form.Control type="text" name="company" value={editUser.company} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditCompanyName" className="mb-3">
                  <Form.Label>Company name</Form.Label>
                  <Form.Control type="text" name="companyn" value={editUser.companyn} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditCommercialName" className="mb-3">
                  <Form.Label>Commercial name</Form.Label>
                  <Form.Control
                    type="text"
                    name="commercialco"
                    value={editUser.commercialco}
                    onChange={handleEditUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formEditStateNumber" className="mb-3">
                  <Form.Label>State number</Form.Label>
                  <Form.Control type="text" name="state" value={editUser.state} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditFirstName" className="mb-3">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstname"
                    value={editUser.firstname}
                    onChange={handleEditUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formEditCity" className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" name="city" value={editUser.city} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditAddress" className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control type="text" name="adresse" value={editUser.adresse} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditNeighborhood" className="mb-3">
                  <Form.Label>Neighborhood</Form.Label>
                  <Form.Control
                    type="text"
                    name="Neighborhood"
                    value={editUser.Neighborhood}
                    onChange={handleEditUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formEditZipcode" className="mb-3">
                  <Form.Label>Zip code</Form.Label>
                  <Form.Control type="text" name="Zipcode" value={editUser.Zipcode} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditPhone" className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" name="Phone" value={editUser.Phone} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditMobile" className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control type="text" name="Mobile" value={editUser.Mobile} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="Email" value={editUser.Email} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditEmail2" className="mb-3">
                  <Form.Label>Email 2</Form.Label>
                  <Form.Control type="email" name="Email2" value={editUser.Email2} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditDOC" className="mb-3">
                  <Form.Label>DOC</Form.Label>
                  <Form.Control type="text" name="DOC" value={editUser.DOC} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditVAT" className="mb-3">
                  <Form.Label>VAT</Form.Label>
                  <Form.Control type="text" name="VAT" value={editUser.VAT} onChange={handleEditUserChange} />
                </Form.Group>

                <Form.Group controlId="formEditContractValue" className="mb-3">
                  <Form.Label>Contract value</Form.Label>
                  <Form.Control
                    type="text"
                    name="Contractvalue"
                    value={editUser.Contractvalue}
                    onChange={handleEditUserChange}
                  />
                </Form.Group>

                <Form.Group controlId="formEditDIST" className="mb-3">
                  <Form.Label>DIST</Form.Label>
                  <Form.Control type="text" name="DIST" value={editUser.DIST} onChange={handleEditUserChange} />
                </Form.Group>
              </Tab>
            </Tabs>
            <Button variant="primary" type="submit">
              Update User
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

                <div
                  className="table-responsive shadow-sm table-container"
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #e9ecef",
                  }}
                >
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading data...</p>
                    </div>
                  ) : currentUsers.length === 0 ? (
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
                          <FaUsers className="text-primary" />
                        </div>
                      </div>
                      <h4 className="text-dark mb-3">No users found</h4>
                      <p className="text-muted mb-4">Add a new user or modify your search</p>
                      <Button variant="primary" onClick={() => window.location.reload()} className="btn-hover-effect">
                        <div className="icon-container me-2">
                          <FaSyncAlt />
                        </div>
                        Refresh page
                      </Button>
                    </div>
                  ) : (
                    <Table hover className="align-middle mb-0 elegant-table">
                      <thead
                        style={{
                          backgroundColor: "#f8f9fa",
                          color: "#495057",
                          borderBottom: "2px solid #dee2e6",
                        }}
                      >
                        <tr>
                          {selectedColumns.map((col, index) => (
                            <th
                              key={index}
                              className="py-3 px-4"
                              style={{
                                position: "relative",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                border: "none",
                                paddingTop: "15px",
                                paddingBottom: "15px",
                              }}
                              onClick={() => (['credit', 'sip_count', 'username', 'creationdate'].includes(col)) ? requestSort(col) : null}
                            >
                              {col === 'active' ? (
                                <div className="d-flex align-items-center gap-2">
                                  <span>Status</span>
                                  <Dropdown>
                                    <Dropdown.Toggle 
                                      variant="outline-secondary" 
                                      size="sm" 
                                      className="p-0 px-1 border-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleDropdown('statusFilter')
                                      }}
                                    >
                                      <FaFilter className="text-muted" />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu show={dropdownVisibility['statusFilter']} onClick={(e) => e.stopPropagation()}>
                                      <Dropdown.Header>Filter by status</Dropdown.Header>
                                      <Dropdown.Item 
                                        active={statusFilter === 'all'}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusFilterChange('all')
                                        }}
                                      >
                                        All statuses
                                      </Dropdown.Item>
                                      <Dropdown.Divider />
                                      <Dropdown.Item 
                                        active={statusFilter === '1'}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusFilterChange('1')
                                        }}
                                      >
                                        <Badge bg="success" className="me-2">•</Badge>
                                        Active
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        active={statusFilter === '0'}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusFilterChange('0')
                                        }}
                                      >
                                        <Badge bg="secondary" className="me-2">•</Badge>
                                        Inactive
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        active={statusFilter === '2'}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusFilterChange('2')
                                        }}
                                      >
                                        <Badge bg="warning" className="me-2">•</Badge>
                                        Pending
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        active={statusFilter === '3'}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusFilterChange('3')
                                        }}
                                      >
                                        <Badge bg="danger" className="me-2">•</Badge>
                                        Bloqué
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        active={statusFilter === '4'}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusFilterChange('4')
                                        }}
                                      >
                                        <Badge bg="danger" className="me-2">•</Badge>
                                        Blocked In/Out
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                  <FaChevronDown className="ms-1" />
                                </div>
                              ) : ['credit', 'sip_count', 'username', 'creationdate'].includes(col) ? (
                                <div className="d-flex align-items-center">
                                  <span>
                                    {col === 'credit' ? 'Crédit' : 
                                     col === 'sip_count' ? 'SIP Count' : 
                                     col === 'creationdate' ? 'Date de création' :
                                     'Nom d\'utilisateur'}
                                  </span>
                                  <span className="ms-1">
                                    {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  {col}
                                  <FaChevronDown className="ms-1" onClick={() => toggleDropdown(col)} />
                                </div>
                              )}
                              {dropdownVisibility[col] && (
                                <Dropdown.Menu show style={{ position: "absolute" }}>
                                  {availableColumns.map(
                                    (item) =>
                                      !selectedColumns.includes(item) && (
                                        <Dropdown.Item 
                                          key={item} 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleColumnChange(item)
                                          }}
                                        >
                                          {item}
                                        </Dropdown.Item>
                                      ),
                                  )}
                                </Dropdown.Menu>
                              )}
                            </th>
                          ))}
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
                        {currentUsers.map((user, index) => (
                          <tr
                            key={index}
                            className="border-top"
                            style={{
                              transition: "all 0.2s ease",
                              borderBottom: "1px solid #e9ecef",
                            }}
                          >
                            {selectedColumns.map((col, idx) => (
                              <td key={idx} className="py-3 px-4">
                                {col === "credit" ? (
                                  <div 
                                    className="d-flex align-items-center justify-content-between"
                                    style={{ minWidth: '100px' }}
                                  >
                                    {editingCredit === user.id ? (
                                      <div className="d-flex align-items-center">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm me-2"
                                          style={{ width: '80px' }}
                                          value={creditValue}
                                          onChange={handleCreditChange}
                                          onKeyDown={(e) => handleKeyDown(e, user.id)}
                                          autoFocus
                                        />
                                        <button 
                                          className="btn btn-sm btn-success me-1"
                                          onClick={() => saveCredit(user.id)}
                                        >
                                          <FaCheckCircle />
                                        </button>
                                        <button 
                                          className="btn btn-sm btn-danger"
                                          onClick={cancelEditing}
                                        >
                                          <FaTimesCircle />
                                        </button>
                                      </div>
                                    ) : (
                                      <div 
                                        className="d-flex align-items-center justify-content-between w-100"
                                        onClick={() => startEditingCredit(user)}
                                        style={{ cursor: 'pointer', minHeight: '38px' }}
                                      >
                                        <span>{user.credit || '0.00'}</span>
                                        <FaEdit className="text-muted ms-2" />
                                      </div>
                                    )}
                                  </div>
                                ) : col === "creationdate" && user[col] ? (
                                  new Date(user[col]).toLocaleString()
                                ) : col === "active" ? (
                                  <Badge
                                    bg={user[col] === 1 ? "success" : user[col] === 0 ? "danger" : user[col] === 2 ? "warning" : user[col] === 3 ? "info" : "secondary"}
                                    pill
                                    className="d-flex align-items-center gap-1 py-2 px-3 position-relative status-badge"
                                    style={{
                                      background: user[col] === 1 ? "linear-gradient(45deg, #28a745, #20c997)" :
                                                user[col] === 0 ? "linear-gradient(45deg, #dc3545, #ff6b6b)" :
                                                user[col] === 2 ? "linear-gradient(45deg, #ffc107, #ffdb58)" :
                                                user[col] === 3 ? "linear-gradient(45deg, #17a2b8, #5bc0de)" :
                                                "linear-gradient(45deg, #6c757d, #adb5bd)",
                                      overflow: "hidden",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    <span className="status-icon">
                                      {user[col] === 1 ? <FaCheckCircle /> :
                                       user[col] === 0 ? <FaTimesCircle /> :
                                       user[col] === 2 ? <FaExclamationCircle /> :
                                       user[col] === 3 ? <FaLock /> :
                                       <FaUnlock />}
                                    </span>{" "}
                                    {user[col] === 1 ? "Active" :
                                     user[col] === 0 ? "Inactive" :
                                     user[col] === 2 ? "Pending" :
                                     user[col] === 3 ? "Blocked" :
                                     "Other"}
                                  </Badge>
                                ) : user[col] !== null && user[col] !== undefined ? (
                                  user[col].toString()
                                ) : (
                                  "0.0000"
                                )}
                              </td>
                            ))}
                            <td className="py-3 px-4 text-center">
                              <div className="d-flex gap-2 justify-content-center action-buttons">
                                <Button
                                  variant="outline-primary"
                                  onClick={() => handleEdit(user.id)}
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
                                  onClick={() => handleDelete(user.id)}
                                  className="d-flex align-items-center gap-1 action-btn delete-btn"
                                  size="sm"
                                >
                                  <span className="btn-icon">
                                    <FaTrash />
                                  </span>{" "}
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!loading && (
                      <>
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{currentUsers.length}</span> of {filteredUsers.length} Users
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtered from {users.length} total
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className="d-flex justify-content-center">
                    <nav>
                      <ul className="pagination pagination-md">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                            &laquo;
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                          <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(page)}>
                              {page}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === Math.ceil(filteredUsers.length / itemsPerPage) ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                            &raquo;
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
</Container>
</div>
)
}

export default Users
