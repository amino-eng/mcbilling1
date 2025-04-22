"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Table, Dropdown, Modal, Button, Form, Tabs, Tab, InputGroup, Toast, ToastContainer } from "react-bootstrap"
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
} from "react-icons/fa"

function Users() {
  // États principaux
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // États pour la recherche et les colonnes
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedColumns, setSelectedColumns] = useState(["username", "credit", "active", "creationdate"])
  const [dropdownVisibility, setDropdownVisibility] = useState({})

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // États pour les formulaires
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [showEditUserForm, setShowEditUserForm] = useState(false)

  // États pour les toasts
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success") // success, danger, warning

  // États pour New User
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    group: "",
    plan: "",
    language: "fr",
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

  // États pour Edit User
  const [editUser, setEditUser] = useState({
    username: "",
    password: "",
    group: "",
    plan: "",
    language: "fr",
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

  // États pour les données supplémentaires
  const [groups, setGroups] = useState([])
  const [plans, setPlans] = useState([])

  // États pour la suppression
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState(null)

  // États pour les erreurs
  const [errors, setErrors] = useState("")

  // Fonction pour afficher un toast
  const showNotification = (message, type = "success") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  // Colonnes disponibles
  const availableColumns = [
    "username",
    "credit",
    "plan_name",
    "group_name",
    "agent",
    "active",
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

  // Fonctions pour récupérer les données
  const fetchGroup = () => {
    axios
      .get("http://localhost:5000/api/admin/users/groups")
      .then((response) => {
        setGroups(response.data.groups)
      })
      .catch((err) => {
        console.error("Error fetching groups:", err)
        setError("Erreur lors de la récupération des groupes")
      })
  }

  const [showPassword, setShowPassword] = useState(false)

  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

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

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return "danger"
    if (strength <= 4) return "warning"
    return "success"
  }

  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return "Weak"
    if (strength <= 4) return "Medium"
    return "Strong"
  }

  const fetchPlan = () => {
    axios
      .get("http://localhost:5000/api/admin/users/plans")
      .then((response) => {
        setPlans(response.data.plans)
      })
      .catch((err) => {
        console.error("Error fetching plans:", err)
        setError("Erreur lors de la récupération des plans")
      })
  }

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/admin/users/users")
      .then((response) => {
        setUsers(response.data.users)
        setFilteredUsers(response.data.users)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching users:", err)
        setError("Erreur lors de la récupération des utilisateurs")
        setLoading(false)
      })
  }

  // Effet initial
  useEffect(() => {
    fetchUsers()
    fetchGroup()
    fetchPlan()
  }, [])

  // Gestion de la recherche
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    const filtered = users.filter((user) => {
      return Object.values(user).some((value) => {
        return String(value).toLowerCase().includes(term)
      })
    })
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  // Pagination
  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Gestion des colonnes
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

  // Export CSV
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

  // Gestion de la suppression
  const handleDelete = (id) => {
    setUserIdToDelete(id)
    setShowConfirmModal(true)
  }

  const confirmDelete = () => {
    axios
      .delete(`http://localhost:5000/api/admin/users/supprimer/${userIdToDelete}`)
      .then(() => {
        fetchUsers()
        setShowConfirmModal(false)
        showNotification("Utilisateur supprimé avec succès", "success")
      })
      .catch((err) => {
        console.log(err)
        showNotification("Erreur lors de la suppression de l'utilisateur", "danger")
      })
  }

  // Gestion des changements de formulaire
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

  // Vérifier si le nom d'utilisateur existe déjà
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

  // Soumission du formulaire New User
  const handleNewUserSubmit = async (e) => {
    e.preventDefault()

    // Vérifier si le nom d'utilisateur existe déjà
    const usernameExists = await checkUsernameExists(newUser.username)
    if (usernameExists) {
      showNotification("Ce nom d'utilisateur existe déjà", "danger")
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
      active: activeStatus,
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
      zip_code: newUser.Zipcode,
      phone: newUser.Phone,
      mobile: newUser.Mobile,
      email2: newUser.Email2,
      doc: newUser.DOC,
      vat: newUser.VAT,
      contract_value: newUser.Contractvalue,
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
      setNewUser({
        username: "",
        password: "",
        group: "",
        plan: "",
        language: "fr",
        status: "Active",
        country: "United States/Canada",
        description: "",
        numberOfSipUsers: 1,
        numberOfIax: 1,
      })
      showNotification("Utilisateur ajouté avec succès", "success")
    } catch (error) {
      console.error("Error adding user:", error)
      showNotification("Erreur lors de l'ajout de l'utilisateur", "danger")
    }
  }
  // Soumission du formulaire Edit User
  const handleEditUserSubmit = async (e) => {
    e.preventDefault()

    // Create a more complete userData object with all fields
    const userData = {
      username: editUser.username,
      id_group: editUser.group,
      id_plan: editUser.plan,
      language: editUser.language,
      active: editUser.status,
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
      showNotification("Utilisateur modifié avec succès", "success")
    } catch (error) {
      console.error("Error updating user:", error)
      showNotification("Erreur lors de la modification de l'utilisateur", "danger")
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
      language: "fr",
      status: "Active",
      country: "United States/Canada",
      description: "",
      // Reset other fields...
    })
  }

  // Édition d'un utilisateur
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
    if (userToEdit.active === 1) statusValue = "1"
    else if (userToEdit.active === 0) statusValue = "0"
    else if (userToEdit.active === 2) statusValue = "2"
    else if (userToEdit.active === 3) statusValue = "3"
    else if (userToEdit.active === 4) statusValue = "4"
    else statusValue = "1" // Default to active if unknown

    setEditUser({
      id: userToEdit.id,
      username: userToEdit.username || "",
      password: "", // Always blank for security
      group: userToEdit.id_group || "",
      plan: userToEdit.id_plan || "",
      language: userToEdit.language || "fr",
      status: statusValue,
      country: userToEdit.country || "United States/Canada",
      description: userToEdit.description || "",
      company: userToEdit.company || "",
      companyn: userToEdit.company_name || "",
      commercialco: userToEdit.commercial_name || "",
      state: userToEdit.state_number || "",
      firstname: userToEdit.firstname || "",
      city: userToEdit.city || "",
      adresse: userToEdit.address || "",
      Neighborhood: userToEdit.neighborhood || "",
      Zipcode: userToEdit.zip_code || "",
      Phone: userToEdit.phone || "",
      Mobile: userToEdit.mobile || "",
      Email: userToEdit.email || "",
      Email2: userToEdit.email2 || "",
      DOC: userToEdit.doc || "",
      VAT: userToEdit.vat || "",
      Contractvalue: userToEdit.contract_value || "",
      DIST: userToEdit.dist || "",
      numberOfSipUsers: userToEdit.sip_count || 0,
      numberOfIax: userToEdit.iax_count || 0,
      expirationDate: userToEdit.expiration_date || "",
      call: userToEdit.call_limit || "",
      DIsk: userToEdit.disk_space || "",
      sip: userToEdit.sip_account_limit || "",
      pin: userToEdit.callingcard_pin || "",
      restriction: userToEdit.restriction || "No",
    })

    setShowEditUserForm(true)
  }

  // Affichage pendant le chargement
  if (loading) {
    return <div className="alert alert-info text-center">Chargement des utilisateurs...</div>
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>
  }

  // Affichage si aucun utilisateur
  if (users.length === 0) {
    return <div className="alert alert-warning text-center">Aucun utilisateur trouvé</div>
  }

  // Rendu principal
  return (
    <div className="container mt-4">
      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastType}>
          <Toast.Header>
            <strong className="me-auto">
              {toastType === "success" && "Succès"}
              {toastType === "danger" && "Erreur"}
              {toastType === "warning" && "Attention"}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastType === "danger" ? "text-white" : ""}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h1>Liste des utilisateurs</h1>
      <div className="mb-3 text-end">
        <Button variant="primary" onClick={() => setShowNewUserForm(true)}>
          New User
        </Button>
        <Button className="ms-2" variant="success" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>

      {/* Barre de recherche */}
      <Form.Group controlId="formSearch" className="mb-3">
        <Form.Label>Rechercher un utilisateur</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrez un nom, email, ou autre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Form.Group>

      {/* Modal New User */}
      <Modal show={showNewUserForm} onHide={() => setShowNewUserForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleNewUserSubmit}>
            <Tabs defaultActiveKey="General" className="mb-3">
              <Tab eventKey="General" title="General">
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
                    <option value="fr">Français</option>
                    <option value="en">English</option>
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
                  <InputGroup className="mb-2">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={editUser.password}
                      onChange={handleEditUserChange}
                      placeholder="Leave blank to keep current password"
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
                    <option value="fr">Français</option>
                    <option value="en">English</option>
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
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                    <option value="2">Pending</option>
                    <option value="3">Blocked</option>
                    <option value="4">Blocked In Out</option>
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
        <Modal.Body>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tableau des utilisateurs */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {selectedColumns.map((col, index) => (
              <th key={index} onClick={() => toggleDropdown(col)} style={{ position: "relative", cursor: "pointer" }}>
                {col} <FaChevronDown style={{ marginLeft: "5px" }} />
                {dropdownVisibility[col] && (
                  <Dropdown.Menu show style={{ position: "absolute" }}>
                    {availableColumns.map(
                      (item) =>
                        !selectedColumns.includes(item) && (
                          <Dropdown.Item key={item} onClick={() => handleColumnChange(item)}>
                            {item}
                          </Dropdown.Item>
                        ),
                    )}
                  </Dropdown.Menu>
                )}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={index}>
              {selectedColumns.map((col, idx) => (
                <td key={idx}>
                  {col === "creationdate" && user[col] ? (
                    new Date(user[col]).toLocaleString()
                  ) : col === "active" ? (
                    user[col] === 1 ? (
                      <FaCheckCircle color="green" title="Active" />
                    ) : user[col] === 0 ? (
                      <FaTimesCircle color="red" title="Inactive" />
                    ) : user[col] === 2 ? (
                      <FaExclamationCircle color="orange" title="Pending" />
                    ) : user[col] === 3 ? (
                      <FaLock color="blue" title="Blocked" />
                    ) : user[col] === 4 ? (
                      <FaUnlock color="purple" title="Blocked In Out" />
                    ) : (
                      "Unknown Status"
                    )
                  ) : user[col] !== null && user[col] !== undefined ? (
                    user[col].toString()
                  ) : (
                    "0.0000"
                  )}
                </td>
              ))}
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(user.id)}>
                  <FaEdit />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <Button variant="secondary" onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span className="mx-3">Page {currentPage}</span>
        <Button
          variant="secondary"
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Users
