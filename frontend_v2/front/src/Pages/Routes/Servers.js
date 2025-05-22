"use client"

import { useEffect, useReducer, useCallback } from "react"
import axios from "axios"
import {
  Button,
  Table,
  Form,
  Modal,
  Row,
  Col,
  InputGroup,
  Alert,
  Card,
  Badge,
  Spinner,
  Container,
} from "react-bootstrap"
import { CSVLink } from "react-csv"
import {
  BiSearch,
  BiEdit,
  BiTrash,
  BiPlusCircle,
  BiDownload,
  BiCheckCircle,
  BiXCircle,
  BiHide,
  BiShow,
  BiRefresh,
} from "react-icons/bi"
import { FaServer } from "react-icons/fa"

// API Configuration
const API_BASE = "http://localhost:5000/api/admin/Servers"
const ITEMS_PER_PAGE = 10

// Action Types
const ACTIONS = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_CURRENT_PAGE: "SET_CURRENT_PAGE",
  SHOW_ADD_MODAL: "SHOW_ADD_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  SET_SERVER_TO_EDIT: "SET_SERVER_TO_EDIT",
  SET_SUCCESS_MESSAGE: "SET_SUCCESS_MESSAGE",
  CLEAR_SUCCESS_MESSAGE: "CLEAR_SUCCESS_MESSAGE",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_EXPORTING: "SET_EXPORTING",
  SET_FORM_DATA: "SET_FORM_DATA",
  TOGGLE_PASSWORD_VISIBILITY: "TOGGLE_PASSWORD_VISIBILITY",
  UPDATE_SERVER_STATUS: "UPDATE_SERVER_STATUS",
  UPDATE_LOCAL_SERVER: "UPDATE_LOCAL_SERVER", // New action type for local updates
}

// Initial State
const initialState = {
  servers: [],
  filteredServers: [],
  paginatedServers: [],
  searchTerm: "",
  currentPage: 1,
  pageCount: 0,
  showAddModal: false,
  serverToEdit: null,
  isLoading: false,
  error: null,
  successMessage: null,
  isExporting: false,
  formData: {
    name: "",
    host: "",
    public_ip: "",
    username: "",
    password: "",
    port: "",
    sip_port: 5060,
    status: 1,
    type: "asterisk",
    description: "",
  },
  showPassword: false,
  updatingStatus: null, // Track which server's status is being updated
}

// Reducer Function
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null }

    case ACTIONS.FETCH_SUCCESS: {
      const servers = action.payload
      const filteredServers = filterServers(servers, state.searchTerm)
      const pageCount = Math.ceil(filteredServers.length / ITEMS_PER_PAGE)
      const paginatedServers = getPaginatedServers(filteredServers, state.currentPage)

      return {
        ...state,
        servers,
        filteredServers,
        paginatedServers,
        pageCount,
        isLoading: false,
        updatingStatus: null, // Reset updating status
      }
    }

    case ACTIONS.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload, updatingStatus: null }

    case ACTIONS.SET_SEARCH_TERM: {
      const searchTerm = action.payload
      const filteredServers = filterServers(state.servers, searchTerm)
      const pageCount = Math.ceil(filteredServers.length / ITEMS_PER_PAGE)
      const paginatedServers = getPaginatedServers(filteredServers, 1) // Reset to page 1

      return {
        ...state,
        searchTerm,
        filteredServers,
        paginatedServers,
        currentPage: 1,
        pageCount,
      }
    }

    case ACTIONS.SET_CURRENT_PAGE: {
      const currentPage = action.payload
      const paginatedServers = getPaginatedServers(state.filteredServers, currentPage)

      return { ...state, currentPage, paginatedServers }
    }

    case ACTIONS.SHOW_ADD_MODAL:
      return {
        ...state,
        showAddModal: true,
        // Reset form if not editing
        formData: state.serverToEdit
          ? { ...state.serverToEdit }
          : {
              name: "",
              host: "",
              public_ip: "",
              username: "",
              password: "",
              port: "",
              sip_port: 5060,
              status: 1,
              type: "asterisk",
              description: "",
            },
      }

    case ACTIONS.HIDE_MODAL:
      return {
        ...state,
        showAddModal: false,
        serverToEdit: null,
        showPassword: false,
      }

    case ACTIONS.SET_SERVER_TO_EDIT: {
      const serverToEdit = action.payload
      // Create a deep copy with explicit type conversion for status
      const formData = serverToEdit
        ? {
            ...serverToEdit,
            status: serverToEdit.status == 1 ? 1 : 0, // Use loose equality but store as number
          }
        : initialState.formData

      return {
        ...state,
        serverToEdit,
        formData,
      }
    }

    case ACTIONS.SET_SUCCESS_MESSAGE:
      return { ...state, successMessage: action.payload, error: null }

    case ACTIONS.CLEAR_SUCCESS_MESSAGE:
      return { ...state, successMessage: null }

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, successMessage: null, updatingStatus: null }

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }

    case ACTIONS.SET_EXPORTING:
      return { ...state, isExporting: action.payload }

    case ACTIONS.SET_FORM_DATA: {
      const { name, value } = action.payload
      return {
        ...state,
        formData: {
          ...state.formData,
          [name]: name === "status" ? (value == 1 ? 1 : 0) : value, // Use loose equality but store as number
        },
      }
    }

    case ACTIONS.TOGGLE_PASSWORD_VISIBILITY:
      return { ...state, showPassword: !state.showPassword }

    case ACTIONS.UPDATE_SERVER_STATUS:
      return { ...state, updatingStatus: action.payload }

    case ACTIONS.UPDATE_LOCAL_SERVER: {
      // Update a specific server in all server lists
      const { serverId, newStatus } = action.payload
      
      // Create new arrays with the updated server
      const updatedServers = state.servers.map(server => 
        server.id === serverId ? { ...server, status: newStatus } : server
      )
      
      const updatedFilteredServers = state.filteredServers.map(server => 
        server.id === serverId ? { ...server, status: newStatus } : server
      )
      
      const updatedPaginatedServers = state.paginatedServers.map(server => 
        server.id === serverId ? { ...server, status: newStatus } : server
      )
      
      return {
        ...state,
        servers: updatedServers,
        filteredServers: updatedFilteredServers,
        paginatedServers: updatedPaginatedServers
      }
    }

    default:
      return state
  }
}

// Helper Functions
function filterServers(servers, searchTerm) {
  if (!searchTerm) return servers

  const term = searchTerm.toLowerCase()
  return servers.filter(
    (server) => server.name.toLowerCase().includes(term) || server.host.toLowerCase().includes(term),
  )
}

function getPaginatedServers(servers, page) {
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  return servers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
}

// Main Component
export default function ServersRefactored() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const {
    servers,
    filteredServers,
    paginatedServers,
    searchTerm,
    currentPage,
    pageCount,
    showAddModal,
    serverToEdit,
    isLoading,
    error,
    successMessage,
    isExporting,
    formData,
    showPassword,
    updatingStatus,
  } = state

  // Fetch servers data
  const fetchServers = useCallback(async () => {
    dispatch({ type: ACTIONS.FETCH_START })

    try {
      const { data } = await axios.get(`${API_BASE}/afficher`)
      console.log("Raw server data:", data.servers)

      // Create completely new objects for each server with properly formatted fields
      const formattedServers = (data.servers || []).map((server) => ({
        id: server.id,
        name: server.name || "",
        host: server.host || "",
        public_ip: server.public_ip || "",
        username: server.username || "",
        password: server.password || "",
        port: server.port || "",
        sip_port: server.sip_port || 5060,
        status: server.status, // Keep original status value
        type: server.type || "asterisk",
        description: server.description || "",
      }))

      dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: formattedServers })
    } catch (err) {
      console.error(err)
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: "Échec du chargement des serveurs" })
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.CLEAR_SUCCESS_MESSAGE })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    dispatch({
      type: ACTIONS.SET_FORM_DATA,
      payload: { name, value },
    })
  }

  // Handle server submission (add/edit)
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.host || !formData.username) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: "Name, host et username sont requis" })
      return
    }

    // Create a payload with properly formatted values
    const payload = {
      name: formData.name,
      host: formData.host,
      public_ip: formData.public_ip || null,
      username: formData.username,
      password: formData.password || null,
      port: formData.port ? Number(formData.port) : null,
      sip_port: formData.sip_port ? Number(formData.sip_port) : null,
      status: formData.status == 1 ? 1 : 0, // Ensure status is 1 or 0
      type: formData.type,
      description: formData.description || null,
    }

    console.log("Submitting server with status:", payload.status, "Type:", typeof payload.status)

    try {
      if (serverToEdit) {
        const response = await axios.put(`${API_BASE}/modifier/${serverToEdit.id}`, payload)
        console.log("Server update response:", response.data)
        dispatch({ type: ACTIONS.SET_SUCCESS_MESSAGE, payload: "Serveur modifié avec succès" })
      } else {
        await axios.post(`${API_BASE}/ajouter`, payload)
        dispatch({ type: ACTIONS.SET_SUCCESS_MESSAGE, payload: "Serveur ajouté avec succès" })
      }

      fetchServers()
      dispatch({ type: ACTIONS.HIDE_MODAL })
    } catch (err) {
      console.error("Error submitting server:", err.response || err)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: err.response?.data?.error || "Erreur réseau",
      })
    }
  }

  // Handle server deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return

    try {
      await axios.delete(`${API_BASE}/supprimer/${id}`)
      dispatch({ type: ACTIONS.SET_SUCCESS_MESSAGE, payload: "Serveur supprimé avec succès" })
      fetchServers()
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: "Erreur lors de la suppression" })
    }
  }

  // Handle status toggle directly from the table
  const handleStatusToggle = async (server) => {
    dispatch({ type: ACTIONS.UPDATE_SERVER_STATUS, payload: server.id })

    // Create new status (opposite of current)
    const newStatus = server.status == 1 ? 0 : 1

    try {
      // Immediately update the UI with optimistic update
      dispatch({ 
        type: ACTIONS.UPDATE_LOCAL_SERVER, 
        payload: { serverId: server.id, newStatus: newStatus } 
      });

      // Create a payload with all required fields
      const payload = {
        name: server.name,
        host: server.host,
        public_ip: server.public_ip || null,
        username: server.username,
        password: null, // Don't send actual password in this update
        port: server.port || null,
        sip_port: server.sip_port || null,
        status: newStatus, // The new status value
        type: server.type || "asterisk",
        description: server.description || null,
      }

      console.log(`Updating server ${server.id} status to:`, newStatus, "Type:", typeof newStatus)

      const response = await axios.put(`${API_BASE}/modifier/${server.id}`, payload)
      console.log("Status update response:", response.data)

      dispatch({
        type: ACTIONS.SET_SUCCESS_MESSAGE,
        payload: `Statut du serveur changé à ${newStatus == 1 ? "Actif" : "Inactif"}`,
      })

      // Refresh the server list to ensure consistency with the database
      fetchServers()
    } catch (err) {
      console.error("Error updating status:", err.response || err)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: "Erreur lors de la modification du statut",
      })
      // Revert the optimistic update on error by refreshing data
      fetchServers()
    }
  }

  // Prepare CSV data for export
  const csvData = [
    ["Name", "Host", "Public IP", "Username", "Port", "SIP Port", "Status", "Type", "Description"],
    ...servers.map((server) => [
      server.name,
      server.host,
      server.public_ip || "-",
      server.username,
      server.port || "-",
      server.sip_port || "-",
      server.status == 1 ? "Actif" : "Inactif",
      server.type,
      server.description || "-",
    ]),
  ]

  return (
    <Container fluid className="py-4">
      <style>
        {`
          .pulse-effect {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
            100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
          }
          .floating-icon {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .search-bar {
            max-width: 300px;
            transition: all 0.3s;
          }
          .search-bar:focus-within {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          }
          .btn-hover-effect:hover .icon-container {
            transform: scale(1.2);
          }
          .icon-container {
            transition: transform 0.2s;
          }
          .status-badge {
            cursor: pointer;
            transition: all 0.2s;
          }
          .status-badge:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} lg={11}>
          <Card style={{ border: "none", boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)" }}>
            {/* Header */}
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
                        <FaServer
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
                    <FaServer className="text-primary fs-3" />
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0 text-white">Gestion des Serveurs</h2>
                    <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos serveurs VoIP</p>
                  </div>
                </div>
              </div>
              <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
                    <span className="me-2 fw-normal">
                      Total: <span className="fw-bold">{servers.length}</span>
                    </span>
                    <span
                      className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "24px", height: "24px" }}
                    >
                      <FaServer size={12} />
                    </span>
                  </Badge>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={fetchServers}
                    disabled={isLoading}
                    className="d-flex align-items-center gap-1"
                  >
                    <BiRefresh className={isLoading ? "spin" : ""} />
                    <span className="d-none d-md-inline">Rafraîchir</span>
                  </Button>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      dispatch({ type: ACTIONS.SET_SERVER_TO_EDIT, payload: null })
                      dispatch({ type: ACTIONS.SHOW_ADD_MODAL })
                    }}
                    className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                  >
                    <div className="icon-container">
                      <BiPlusCircle />
                    </div>
                    <span>Ajouter</span>
                  </Button>
                  <CSVLink
                    data={csvData}
                    filename="servers.csv"
                    className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                    disabled={isExporting}
                  >
                    <div className="icon-container">
                      {isExporting ? <Spinner animation="border" size="sm" /> : <BiDownload />}
                    </div>
                    <span>{isExporting ? "Exportation..." : "Exporter"}</span>
                  </CSVLink>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Alerts */}
              {error && (
                <Alert
                  variant="danger"
                  className="d-flex align-items-center mb-4 shadow-sm"
                  dismissible
                  onClose={() => dispatch({ type: ACTIONS.CLEAR_ERROR })}
                >
                  <BiXCircle className="me-2" />
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert
                  variant="success"
                  className="d-flex align-items-center mb-4 shadow-sm"
                  dismissible
                  onClose={() => dispatch({ type: ACTIONS.CLEAR_SUCCESS_MESSAGE })}
                >
                  <BiCheckCircle className="me-2" />
                  {successMessage}
                </Alert>
              )}

              {/* Search */}
              <Row className="mb-4">
                <Col md={6} lg={4}>
                  <InputGroup className="search-bar shadow-sm">
                    <InputGroup.Text className="bg-white">
                      <BiSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Rechercher par nom..."
                      value={searchTerm}
                      onChange={(e) =>
                        dispatch({
                          type: ACTIONS.SET_SEARCH_TERM,
                          payload: e.target.value,
                        })
                      }
                      className="border-start-0"
                    />
                  </InputGroup>
                </Col>
              </Row>

              {/* Server Table */}
              {isLoading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : paginatedServers.length === 0 ? (
                <Alert variant="info" className="text-center my-4">
                  Aucun serveur trouvé
                </Alert>
              ) : (
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Hôte</th>
                      <th>Utilisateur</th>
                      <th>Statut</th>
                      <th>Type</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedServers.map((server) => (
                      <tr key={server.id}>
                        <td>{server.name}</td>
                        <td>{server.host}</td>
                        <td>{server.username}</td>
                        <td>
                          <Badge
                            bg={server.status == 1 ? "success" : "danger"}
                            className="d-flex align-items-center gap-1 status-badge"
                            onClick={() => handleStatusToggle(server)}
                            style={{ width: "fit-content" }}
                          >
                            {updatingStatus === server.id ? (
                              <Spinner size="sm" animation="border" className="me-1" />
                            ) : server.status == 1 ? (
                              <BiCheckCircle size={14} />
                            ) : (
                              <BiXCircle size={14} />
                            )}
                            <span>{server.status == 1 ? "Actif" : "Inactif"}</span>
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="text-capitalize">
                            {server.type}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                // Create a deep copy to avoid reference issues
                                const serverCopy = JSON.parse(JSON.stringify(server))
                                dispatch({ type: ACTIONS.SET_SERVER_TO_EDIT, payload: serverCopy })
                                dispatch({ type: ACTIONS.SHOW_ADD_MODAL })
                              }}
                              className="d-flex align-items-center"
                            >
                              <BiEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(server.id)}
                              className="d-flex align-items-center"
                            >
                              <BiTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* Pagination */}
              {pageCount > 0 && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!isLoading && (
                      <>
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{paginatedServers.length}</span> sur {filteredServers.length}{" "}
                          Serveurs
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtrés de {servers.length} total
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() =>
                        dispatch({
                          type: ACTIONS.SET_CURRENT_PAGE,
                          payload: Math.max(currentPage - 1, 1),
                        })
                      }
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === pageCount}
                      onClick={() =>
                        dispatch({
                          type: ACTIONS.SET_CURRENT_PAGE,
                          payload: Math.min(currentPage + 1, pageCount),
                        })
                      }
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Server Modal */}
      <Modal show={showAddModal} onHide={() => dispatch({ type: ACTIONS.HIDE_MODAL })} size="lg" backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{serverToEdit ? "Modifier Serveur" : "Ajouter Serveur"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Row>
            {[
              ["name", "Nom", "text"],
              ["host", "Host", "text"],
              ["public_ip", "Public IP", "text"],
              ["username", "Username", "text"],
            ].map(([name, label, type]) => (
              <Col md={6} key={name} className="mb-3">
                <Form.Label className="fw-semibold small text-muted">{label}</Form.Label>
                <Form.Control
                  type={type}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  required={name === "name" || name === "host" || name === "username"}
                />
              </Col>
            ))}

            <Col md={6} key="password" className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => dispatch({ type: ACTIONS.TOGGLE_PASSWORD_VISIBILITY })}
                >
                  {showPassword ? <BiHide /> : <BiShow />}
                </Button>
              </InputGroup>
            </Col>

            <Col md={6} key="port" className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Port</Form.Label>
              <Form.Control type="number" name="port" value={formData.port || ""} onChange={handleChange} />
            </Col>

            <Col md={6} key="sip_port" className="mb-3">
              <Form.Label className="fw-semibold small text-muted">SIP Port</Form.Label>
              <Form.Control type="number" name="sip_port" value={formData.sip_port || ""} onChange={handleChange} />
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Type</Form.Label>
              <Form.Select name="type" value={formData.type} onChange={handleChange}>
                <option value="asterisk">Asterisk</option>
                <option value="magnus">MagnusBilling</option>
              </Form.Select>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Statut</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value={1}>Actif</option>
                <option value={0}>Inactif</option>
              </Form.Select>
            </Col>

            <Col xs={12} className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => dispatch({ type: ACTIONS.HIDE_MODAL })}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {serverToEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
