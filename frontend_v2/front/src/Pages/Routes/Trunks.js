"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Button,
  Table,
  Form,
  Modal,
  Tabs,
  Tab,
  Row,
  Col,
  InputGroup,
  Alert,
  Card,
  Badge,
  Spinner,
} from "react-bootstrap"
import { CSVLink } from "react-csv"
import { BiSearch, BiEdit, BiTrash, BiPlusCircle, BiDownload, BiCheckCircle, BiXCircle } from "react-icons/bi"
import { FaNetworkWired } from "react-icons/fa"

// Constants
const ITEMS_PER_PAGE = 10

// ------------------ TrunkHeader Component ------------------
const TrunkHeader = ({ onAddClick, trunks, isExporting }) => {
  const csvData = [
    ["Name", "Add Prefix", "Remove Prefix", "Host", "Provider", "Status", "Creation Date"],
    ...trunks.map((trunk) => [
      trunk.trunkcode,
      trunk.trunkprefix,
      trunk.removeprefix,
      trunk.host,
      trunk.provider_name,
      trunk.status,
      new Date(trunk.creationdate).toLocaleDateString(),
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
                <FaNetworkWired
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
            <FaNetworkWired className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Trunks Management</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Manage your SIP connections</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{trunks.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaNetworkWired size={12} />
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
              <BiPlusCircle />
            </div>
            <span>Add</span>
          </Button>
          <CSVLink
            data={csvData}
            filename="trunks.csv"
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <BiDownload />}
            </div>
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  )
}

// ------------------ StatusBadge Component ------------------
const StatusBadge = ({ status }) => {
  const statusLabels = {
    0: { label: "Inactive", variant: "secondary" },
    1: { label: "Active", variant: "success" },
    2: { label: "Pending", variant: "warning" },
    3: { label: "Sent", variant: "info" },
    4: { label: "Blocked", variant: "danger" },
    5: { label: "AMD", variant: "primary" },
  }

  const statusInfo = statusLabels[status] || { label: "Unknown", variant: "dark" }

  return (
    <Badge bg={statusInfo.variant} className="text-capitalize">
      {statusInfo.label}
    </Badge>
  )
}

// ------------------ SearchBar Component ------------------
const SearchBar = ({ searchTerm, onSearchChange }) => (
  <InputGroup className="search-bar">
    <Form.Control placeholder="Search trunks..." value={searchTerm} onChange={onSearchChange} />
    <InputGroup.Text>
      <BiSearch />
    </InputGroup.Text>
  </InputGroup>
)

// ------------------ ActionButtons Component ------------------
const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="d-flex gap-2">
    <Button variant="primary" size="sm" onClick={onEdit} className="btn-hover-effect" title="Edit">
      <BiEdit />
    </Button>
    <Button variant="danger" size="sm" onClick={onDelete} className="btn-hover-effect" title="Delete">
      <BiTrash />
    </Button>
  </div>
)

// ------------------ TrunkTable Component ------------------
const TrunkTable = ({ trunks, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (trunks.length === 0) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">No trunks found</h5>
      </div>
    )
  }

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead>
        <tr>
          <th>Name</th>
          <th>Added Prefix</th>
          <th>Removed Prefix</th>
          <th>Host</th>
          <th>Provider</th>
          <th>Status</th>
          <th>Creation Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {trunks.map((trunk) => (
          <tr key={trunk.id}>
            <td>{trunk.trunkcode}</td>
            <td>{trunk.trunkprefix || "-"}</td>
            <td>{trunk.removeprefix || "-"}</td>
            <td>{trunk.host}</td>
            <td>{trunk.provider_name || "-"}</td>
            <td>
              <StatusBadge status={trunk.status} />
            </td>
            <td>{new Date(trunk.creationdate).toLocaleDateString()}</td>
            <td>
              <ActionButtons onEdit={() => onEdit(trunk)} onDelete={() => onDelete(trunk.id)} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

// ------------------ AddTrunkModal Component ------------------
const AddTrunkModal = ({ show, onHide, onTrunkAdded, trunkToEdit, setTrunkToEdit }) => {
  const [key, setKey] = useState("general")
  const [formData, setFormData] = useState({
    provider: "",
    name: "",
    username: "",
    password: "",
    host: "",
    addprefix: "",
    removeprefix: "",
    fromuser: "",
    fromdomain: "",
    cidadd: "",
    cidremove: "",
    context: "billing",
    dtmfmode: "RFC2833",
    insecure: "port,invite",
    maxuse: -1,
    nat: "force_rport,comedia",
    directmedia: "no",
    qualify: "yes",
    type: "peer",
    sendrpid: "no",
    addparameter: "",
    port: 5060,
    asteriskParams: "",
    status: 1,
  })

  const [providers, setProviders] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const fetchProviders = () => {
    axios
      .get("http://localhost:5000/api/admin/Providers/afficher")
      .then((res) => setProviders(res.data.providers))
      .catch((err) => console.error("Error fetching providers:", err))
  }

  useEffect(() => {
    fetchProviders()
    if (trunkToEdit) {
      // Populate form with trunk data when editing
      setFormData({
        provider: trunkToEdit.id_provider,
        name: trunkToEdit.trunkcode,
        username: trunkToEdit.user,
        password: trunkToEdit.secret,
        host: trunkToEdit.host,
        addprefix: trunkToEdit.trunkprefix,
        removeprefix: trunkToEdit.removeprefix,
        fromuser: trunkToEdit.fromuser,
        fromdomain: trunkToEdit.fromdomain,
        context: trunkToEdit.context,
        dtmfmode: trunkToEdit.dtmfmode,
        insecure: trunkToEdit.insecure,
        nat: trunkToEdit.nat,
        qualify: trunkToEdit.qualify,
        type: trunkToEdit.type,
        port: trunkToEdit.port,
        sendrpid: trunkToEdit.sendrpid,
        directmedia: trunkToEdit.directmedia,
        status: trunkToEdit.status,
        // Add other fields as needed
      })
    } else {
      // Reset form when adding new trunk
      setFormData({
        provider: "",
        name: "",
        username: "",
        password: "",
        host: "",
        addprefix: "",
        removeprefix: "",
        fromuser: "",
        fromdomain: "",
        cidadd: "",
        cidremove: "",
        context: "billing",
        dtmfmode: "RFC2833",
        insecure: "port,invite",
        maxuse: -1,
        nat: "force_rport,comedia",
        directmedia: "no",
        qualify: "yes",
        type: "peer",
        sendrpid: "no",
        addparameter: "",
        port: 5060,
        asteriskParams: "",
        status: 1,
      })
    }
    // Reset validation errors when form changes
    setValidationErrors({})
  }, [trunkToEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear validation error for this field when it's changed
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      })
    }
  }

  const validateForm = () => {
    const errors = {}

    // Required fields
    if (!formData.name) errors.name = "Name is required"
    if (!formData.host) errors.host = "Host is required"

    // Set validation errors
    setValidationErrors(errors)

    // Return true if no errors
    return Object.keys(errors).length === 0
  }

  const handleSubmit = () => {
    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Common fields for both add and update
    const payload = {
      id_provider: formData.provider || null,
      trunkcode: formData.name,
      host: formData.host,
      user: formData.username,
      secret: formData.password,
      trunkprefix: formData.addprefix || "",
      removeprefix: formData.removeprefix || "",
      fromuser: formData.fromuser || "",
      fromdomain: formData.fromdomain || "",
      context: formData.context || "billing",
      dtmfmode: formData.dtmfmode || "RFC2833",
      insecure: formData.insecure || "port,invite",
      nat: formData.nat || "force_rport,comedia",
      qualify: formData.qualify || "yes",
      type: formData.type || "peer",
      disallow: "",
      allow: "ulaw,alaw",
      port: formData.port || 5060,
      sendrpid: formData.sendrpid || "no",
      directmedia: formData.directmedia || "no",
      status: formData.status !== undefined ? formData.status : 1,
    }

    if (trunkToEdit) {
      // Update existing trunk using direct update instead of batch update
      console.log("Updating trunk with ID:", trunkToEdit.id)
      console.log("Sending update data:", payload)

      // IMPORTANT: Use the modifier endpoint instead of batchUpdate
      axios
        .put(`http://localhost:5000/api/admin/Trunks/modifier/${trunkToEdit.id}`, payload)
        .then((res) => {
          console.log("Trunk updated:", res.data)
          onTrunkAdded?.()
          onHide()
          setTrunkToEdit(null)
        })
        .catch((err) => {
          console.error("Error updating trunk:", err)
          alert(`Failed to update trunk: ${err.response?.data?.error || err.message}`)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    } else {
      // Add new trunk
      payload.creationdate = new Date().toISOString().slice(0, 19).replace("T", " ")
      payload.providerip = ""

      console.log("Adding new trunk with data:", payload)

      axios
        .post("http://localhost:5000/api/admin/Trunks/ajouter", payload)
        .then((res) => {
          console.log("Trunk added:", res.data)
          onTrunkAdded?.()
          onHide()
        })
        .catch((err) => {
          console.error("Error adding trunk:", err)
          alert(`Failed to add trunk: ${err.response?.data?.error || err.message}`)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    }
  }

  return (
    <Modal
      show={show}
      onHide={() => {
        onHide()
        setTrunkToEdit(null)
      }}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{trunkToEdit ? "Edit Trunk" : "Add New Trunk"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab eventKey="general" title="General">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="provider">
                    <Form.Label>Provider</Form.Label>
                    <Form.Control as="select" name="provider" value={formData.provider} onChange={handleChange}>
                      <option value="">Select a provider</option>
                      {providers?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.provider_name} - {p.description}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  {["name", "username", "password", "host", "addprefix", "removeprefix"].map((field) => (
                    <Form.Group key={field} controlId={field}>
                      <Form.Label>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                        {(field === "name" || field === "host") && <span className="text-danger">*</span>}
                      </Form.Label>
                      <Form.Control
                        name={field}
                        type={field === "password" ? "password" : "text"}
                        value={formData[field]}
                        onChange={(e) => {
                          const value = e.target.value

                          // Champs qui doivent contenir uniquement des chiffres
                          const numericOnly = ["addprefix", "removeprefix"]

                          if (numericOnly.includes(field)) {
                            // N'autoriser que les chiffres
                            if (/^\d*$/.test(value)) {
                              handleChange(e)
                            }
                          } else {
                            // Pour les autres champs, autoriser tout
                            handleChange(e)
                          }
                        }}
                        isInvalid={!!validationErrors[field]}
                      />
                      <Form.Control.Feedback type="invalid">{validationErrors[field]}</Form.Control.Feedback>
                    </Form.Group>
                  ))}
                </Col>

                <Col md={6}>
                  <Form.Label>Codec</Form.Label>
                  <div>
                    {[
                      "g729",
                      "g723",
                      "gsm",
                      "g726",
                      "opus",
                      "alaw",
                      "ulaw",
                      "g722",
                      "ilbc",
                      "speex",
                      "h261",
                      "h263",
                    ].map((codec) => (
                      <Form.Check
                        inline
                        key={codec}
                        type="checkbox"
                        label={codec}
                        name="codec"
                        value={codec}
                        defaultChecked={["g729", "gsm", "opus", "alaw", "ulaw"].includes(codec)}
                      />
                    ))}
                  </div>

                  {[
                    { name: "providertech", options: ["sip", "iax", "dahdi", "dgf", "extra", "local"] },
                    {
                      name: "status",
                      options: [
                        { value: 1, label: "Active" },
                        { value: 0, label: "Inactive" },
                      ],
                    },
                    { name: "registertrunk", options: ["No", "Yes"] },
                  ].map(({ name, options }) => (
                    <Form.Group key={name} controlId={name}>
                      <Form.Label>{name.charAt(0).toUpperCase() + name.slice(1)}</Form.Label>
                      <Form.Control as="select" name={name} value={formData[name]} onChange={handleChange}>
                        {options.map((opt, idx) =>
                          typeof opt === "string" ? (
                            <option key={idx}>{opt}</option>
                          ) : (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ),
                        )}
                      </Form.Control>
                    </Form.Group>
                  ))}
                </Col>
              </Row>
            </Form>
          </Tab>

          <Tab eventKey="supplementary" title="Supplementary Info">
            <Form>
              <Row>
                <Col md={6}>
                  {["fromuser", "fromdomain", "cidadd", "cidremove", "context", "dtmfmode", "insecure"].map((field) => (
                    <Form.Group key={field} controlId={field}>
                      <Form.Label>{field}</Form.Label>
                      <Form.Control name={field} value={formData[field]} onChange={handleChange} />
                    </Form.Group>
                  ))}
                </Col>
                <Col md={6}>
                  {["maxuse", "nat", "directmedia", "qualify", "type", "sendrpid", "addparameter", "port"].map(
                    (field) => (
                      <Form.Group key={field} controlId={field}>
                        <Form.Label>{field}</Form.Label>
                        <Form.Control
                          name={field}
                          type={field === "maxuse" || field === "port" ? "number" : "text"}
                          value={formData[field]}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    ),
                  )}
                </Col>
              </Row>
            </Form>
          </Tab>

          <Tab eventKey="asterisk" title="Asterisk Extra Config">
            <Form.Group controlId="asteriskParams">
              <Form.Label>Parameters</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                name="asteriskParams"
                value={formData.asteriskParams}
                onChange={handleChange}
              />
            </Form.Group>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            onHide()
            setTrunkToEdit(null)
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              {trunkToEdit ? "Updating..." : "Saving..."}
            </>
          ) : trunkToEdit ? (
            "Update"
          ) : (
            "Save"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ------------------ Main Trunks Component ------------------
const Trunks = () => {
  const [trunks, setTrunks] = useState([])
  const [filteredTrunks, setFilteredTrunks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [trunkToEdit, setTrunkToEdit] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  const fetchTrunks = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get("http://localhost:5000/api/admin/Trunks/afficher")
      setTrunks(res.data.trunks)
      setFilteredTrunks(res.data.trunks)
    } catch (err) {
      setError("Erreur lors du chargement des trunks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrunks()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = trunks.filter(
        (trunk) =>
          trunk.trunkcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trunk.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredTrunks(filtered)
    } else {
      setFilteredTrunks(trunks)
    }
  }, [searchTerm, trunks])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleEdit = (trunk) => {
    setTrunkToEdit(trunk)
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce trunk?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/Trunks/supprimer/${id}`)
        setSuccessMessage("Trunk supprimé avec succès")
        fetchTrunks()
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (err) {
        setError("Erreur lors de la suppression du trunk")
      }
    }
  }

  const pageCount = Math.ceil(filteredTrunks.length / ITEMS_PER_PAGE)
  const paginatedTrunks = filteredTrunks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="container py-4">
      <style>
        {`
          .btn-hover-effect:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .btn-hover-effect {
            transition: all 0.2s ease;
          }
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
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} lg={11}>
          <Card style={{ border: "none", boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)" }}>
            <TrunkHeader
              onAddClick={() => {
                setTrunkToEdit(null)
                setShowAddModal(true)
              }}
              trunks={trunks}
              isExporting={isExporting}
            />

            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                  <BiXCircle className="me-2" />
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                  <BiCheckCircle className="me-2" />
                  {successMessage}
                </Alert>
              )}

              <Row className="mb-4">
                <Col md={6} lg={4}>
                  <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                </Col>
              </Row>

              <TrunkTable trunks={paginatedTrunks} onEdit={handleEdit} onDelete={handleDelete} isLoading={isLoading} />

              {pageCount > 0 && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!isLoading && (
                      <>
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{paginatedTrunks.length}</span> sur {filteredTrunks.length}{" "}
                          Trunks
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtrés de {trunks.length} total
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
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === pageCount}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
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

      <AddTrunkModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onTrunkAdded={fetchTrunks}
        trunkToEdit={trunkToEdit}
        setTrunkToEdit={setTrunkToEdit}
      />
    </div>
  )
}

export default Trunks
