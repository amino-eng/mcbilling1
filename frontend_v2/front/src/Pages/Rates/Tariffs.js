"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import "bootstrap/dist/css/bootstrap.min.css"
import { 
  Table, Spinner, Alert, Form, Button, InputGroup, Modal, 
  Card, Container, Row, Col, Badge 
} from "react-bootstrap"
import { 
  FaCheckCircle, FaTimesCircle, FaEdit, FaSearch, 
  FaPlusCircle, FaTrashAlt, FaFileAlt 
} from "react-icons/fa"

// Constants
const ITEMS_PER_PAGE = 10

// Header Component
function TariffsHeader({ onAddClick, tariffs, isExporting = false }) {
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
              <FaFileAlt className="text-white opacity-25" />
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaFileAlt className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Tarifs</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos tarifs et destinations</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{tariffs.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaFileAlt size={12} />
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
            <span>Ajouter</span>
          </Button>
        </div>
      </div>
    </Card.Header>
  )
}

// Search Bar Component
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <InputGroup className="shadow-sm">
      <InputGroup.Text className="bg-white">
        <FaSearch className="text-muted" />
      </InputGroup.Text>
      <Form.Control
        placeholder="Rechercher par préfixe, destination ou plan..."
        value={searchTerm}
        onChange={onSearchChange}
        className="border-start-0"
      />
    </InputGroup>
  )
}

// Action Buttons Component
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="d-flex gap-2 action-btn">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onEdit}
        className="px-2 py-1"
      >
        <FaEdit className="btn-icon" />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onDelete}
        className="px-2 py-1"
      >
        <FaTrashAlt className="btn-icon" />
      </Button>
    </div>
  )
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-5">
      <FaFileAlt className="text-muted mb-3" size={48} />
      <h5 className="text-muted">Aucun tarif trouvé</h5>
      <p className="text-muted small">
        Commencez par ajouter un nouveau tarif
      </p>
    </div>
  )
}

// Tariffs Table Component
function TariffsTableComponent({ tariffs, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Chargement des tarifs...</p>
      </div>
    )
  }

  if (tariffs.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="border rounded overflow-hidden">
      <Table hover className="mb-0">
        <thead className="bg-light">
          <tr>
            <th>Préfixe</th>
            <th>Destination</th>
            <th>Plan</th>
            <th>Tarif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tariffs.map((tariff) => (
            <tr key={tariff.id} className="plan-row">
              <td>{tariff.prefix}</td>
              <td>{tariff.destination}</td>
              <td>{tariff.plan}</td>
              <td>{tariff.sellrate}</td>
              <td>
                <ActionButtons
                  onEdit={() => onEdit(tariff)}
                  onDelete={() => onDelete(tariff.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// Main Tariffs Component
const TariffsTable = () => {
  const [tariffs, setTariffs] = useState([])
  const [filteredTariffs, setFilteredTariffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentTariff, setCurrentTariff] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")

  // Search modals state
  const [showPlanSearch, setShowPlanSearch] = useState(false)
  const [showDestinationSearch, setShowDestinationSearch] = useState(false)
  const [showTrunkGroupSearch, setShowTrunkGroupSearch] = useState(false)

  // Search results
  const [planResults, setPlanResults] = useState([])
  const [destinationResults, setDestinationResults] = useState([])
  const [trunkGroupResults, setTrunkGroupResults] = useState([])

  // Search terms
  const [planSearchTerm, setPlanSearchTerm] = useState("")
  const [destinationSearchTerm, setDestinationSearchTerm] = useState("")
  const [trunkGroupSearchTerm, setTrunkGroupSearchTerm] = useState("")

  // Loading states for searches
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [loadingDestinations, setLoadingDestinations] = useState(false)
  const [loadingTrunkGroups, setLoadingTrunkGroups] = useState(false)

  const [formData, setFormData] = useState({
    id_plan: "",
    id_prefix: "",
    id_trunk_group: "",
    prefix: "",
    destination: "",
    sellrate: "",
    initblock: "",
    billingblock: "",
    trunk_group_name: "",
    plan: "",
    minimal_time_buy: "",
    additional_time: "",
    connection_charge: "",
    include_in_offer: "No",
    status: "Active",
  })

  // Calculate pagination
  const pageCount = Math.ceil(filteredTariffs.length / ITEMS_PER_PAGE)
  const pagedTariffs = filteredTariffs.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  useEffect(() => {
    fetchTariffs()
  }, [])

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase()
    setFilteredTariffs(
      tariffs.filter(
        (t) =>
          (t.prefix && t.prefix.includes(searchTerm)) ||
          (t.destination && t.destination.toLowerCase().includes(lowerSearch)) ||
          (t.plan && t.plan.toLowerCase().includes(lowerSearch))
      )
    )
    setCurrentPage(0)
  }, [searchTerm, tariffs])

  const fetchTariffs = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/admin/Tariffs/afficher")
      setTariffs(res.data.tarifs)
      setFilteredTariffs(res.data.tarifs)
      setLoading(false)
    } catch (err) {
      setError("Erreur lors du chargement des tarifs")
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setCurrentTariff(null)
    setFormData({
      id_plan: "",
      id_prefix: "",
      id_trunk_group: "",
      prefix: "",
      destination: "",
      sellrate: "",
      initblock: "",
      billingblock: "",
      trunk_group_name: "",
      plan: "",
      minimal_time_buy: "",
      additional_time: "",
      connection_charge: "",
      include_in_offer: "No",
      status: "Active",
    })
    setShowModal(true)
  }

  const handleEdit = (tariff) => {
    setCurrentTariff(tariff)
    setFormData({
      id_plan: tariff.id_plan,
      id_prefix: tariff.id_prefix,
      id_trunk_group: tariff.id_trunk_group,
      prefix: tariff.prefix,
      destination: tariff.destination,
      sellrate: tariff.sellrate,
      initblock: tariff.initblock,
      billingblock: tariff.billingblock,
      trunk_group_name: tariff.trunk_group_name,
      plan: tariff.plan,
      minimal_time_buy: tariff.minimal_time_buy,
      additional_time: tariff.additional_time,
      connection_charge: tariff.connection_charge,
      include_in_offer: tariff.include_in_offer || "No",
      status: tariff.status || "Active",
    })
    setShowModal(true)
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce tarif ?")) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/Tariffs/supprimer/${id}`)
      fetchTariffs()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la suppression.")
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prepare data for submission
    const submitData = {
      id_plan: formData.id_plan,
      id_prefix: formData.id_prefix,
      id_trunk_group: formData.id_trunk_group,
      rateinitial: formData.sellrate, // Utiliser le nom de champ correct pour la base de données
      initblock: formData.initblock,
      billingblock: formData.billingblock,
      minimal_time_charge: formData.minimal_time_buy, // Changé de minimal_time_buy à minimal_time_charge
      additional_grace: formData.additional_time, // Changé de additional_time à additional_grace
      connectcharge: formData.connection_charge, // Changé de connection_charge à connectcharge
      package_offer: formData.include_in_offer === "Yes" ? 1 : 0, // Changé de include_in_offer à package_offer
      status: formData.status === "Active" ? 1 : 0,
    }

    if (currentTariff) {
      // Update existing tariff
      try {
        await axios.put(`http://localhost:5000/api/admin/Tariffs/modifier/${currentTariff.id}`, submitData)
        fetchTariffs()
        setShowModal(false)
      } catch (err) {
        console.error(err)
        alert("Erreur lors de la mise à jour.")
      }
    } else {
      // Add new tariff
      try {
        await axios.post("http://localhost:5000/api/admin/Tariffs/ajouter", submitData)
        fetchTariffs()
        setShowModal(false)
      } catch (err) {
        console.error(err)
        alert("Erreur lors de l'ajout.")
      }
    }
  }

  // Search functions
  const fetchPlans = async () => {
    setLoadingPlans(true)
    try {
      const res = await axios.get("http://localhost:5000/api/admin/Plans/afficher")
      console.log("Plans API Response:", res.data)
      setPlanResults(res.data.plans || [])
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la récupération des plans")
    } finally {
      setLoadingPlans(false)
    }
  }

  const fetchDestinations = async () => {
    setLoadingDestinations(true)
    try {
      const res = await axios.get("http://localhost:5000/api/admin/Prefixes/afficher")
      console.log("Destinations API Response:", res.data)
      setDestinationResults(res.data.prefixes || [])
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la récupération des destinations")
    } finally {
      setLoadingDestinations(false)
    }
  }

  const fetchTrunkGroups = async () => {
    setLoadingTrunkGroups(true)
    try {
      // Utiliser les données des tarifs existants comme solution de secours
      // si l'API ne renvoie pas de données
      const res = await axios.get("http://localhost:5000/api/admin/TrunkGroup/afficher")
      console.log("Trunk Groups API Response:", res.data)

      // Si l'API renvoie des données, les utiliser
      if (res.data && (res.data.trunkGroups || []).length > 0) {
        setTrunkGroupResults(res.data.trunkGroups || [])
      } else {
        // Sinon, extraire les groupes de trunk uniques des tarifs existants
        console.log("Aucun résultat de l'API, utilisation des données des tarifs existants")
        const uniqueTrunkGroups = []
        const trunkGroupIds = new Set()

        tariffs.forEach((tariff) => {
          if (tariff.id_trunk_group && !trunkGroupIds.has(tariff.id_trunk_group)) {
            trunkGroupIds.add(tariff.id_trunk_group)
            uniqueTrunkGroups.push({
              id: tariff.id_trunk_group,
              name: tariff.trunk_group_name,
              description: tariff.trunk_group_description || "",
            })
          }
        })

        console.log("Trunk Groups extraits des tarifs:", uniqueTrunkGroups)
        setTrunkGroupResults(uniqueTrunkGroups)
      }
    } catch (err) {
      console.error("Erreur API Trunk Groups:", err)

      // En cas d'erreur, extraire les groupes de trunk des tarifs existants
      console.log("Erreur API, utilisation des données des tarifs existants")
      const uniqueTrunkGroups = []
      const trunkGroupIds = new Set()

      tariffs.forEach((tariff) => {
        if (tariff.id_trunk_group && !trunkGroupIds.has(tariff.id_trunk_group)) {
          trunkGroupIds.add(tariff.id_trunk_group)
          uniqueTrunkGroups.push({
            id: tariff.id_trunk_group,
            name: tariff.trunk_group_name,
            description: tariff.trunk_group_description || "",
          })
        }
      })

      console.log("Trunk Groups extraits des tarifs (après erreur):", uniqueTrunkGroups)
      setTrunkGroupResults(uniqueTrunkGroups)
    } finally {
      setLoadingTrunkGroups(false)
    }
  }

  const selectPlan = (plan) => {
    setFormData((prev) => ({
      ...prev,
      id_plan: plan.id,
      plan: plan.name,
    }))
    setShowPlanSearch(false)
  }

  const selectDestination = (prefix) => {
    setFormData((prev) => ({
      ...prev,
      id_prefix: prefix.id,
      prefix: prefix.prefix,
      destination: prefix.destination,
    }))
    setShowDestinationSearch(false)
  }

  const selectTrunkGroup = (trunkGroup) => {
    setFormData((prev) => ({
      ...prev,
      id_trunk_group: trunkGroup.id,
      // Utiliser le bon nom de propriété selon ce qui est disponible
      trunk_group_name: trunkGroup.name || trunkGroup.trunk_group_name || "",
    }))
    setShowTrunkGroupSearch(false)
  }

  // Open plan search modal and fetch data
  const openPlanSearch = () => {
    setPlanSearchTerm("")
    fetchPlans()
    setShowPlanSearch(true)
  }

  // Open destination search modal and fetch data
  const openDestinationSearch = () => {
    setDestinationSearchTerm("")
    fetchDestinations()
    setShowDestinationSearch(true)
  }

  // Open trunk group search modal and fetch data
  const openTrunkGroupSearch = () => {
    setTrunkGroupSearchTerm("")
    fetchTrunkGroups()
    setShowTrunkGroupSearch(true)
  }

  const customStyles = `
    .floating-icon {
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    .pulse-effect {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
    }
    .btn-hover-effect .icon-container {
      transition: all 0.3s ease;
    }
    .btn-hover-effect:hover .icon-container {
      transform: translateY(-2px);
    }
    .action-btn .btn-icon {
      transition: transform 0.2s ease;
    }
    .action-btn:hover .btn-icon {
      transform: scale(1.2);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .plan-row {
      transition: all 0.2s ease;
    }
    .plan-row:hover {
      background-color: rgba(13, 110, 253, 0.05);
    }
    .main-card {
      border-radius: 0.5rem;
      overflow: hidden;
    }
  `

  return (
    <div>
      <style>{customStyles}</style>

      <div className="dashboard-main">
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow border-0 overflow-hidden main-card">
                <TariffsHeader 
                  onAddClick={handleAdd} 
                  tariffs={tariffs} 
                />
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaCheckCircle className="me-2" />
                      {successMessage}
                    </Alert>
                  )}

                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <SearchBar 
                        searchTerm={searchTerm} 
                        onSearchChange={(e) => setSearchTerm(e.target.value)} 
                      />
                    </Col>
                  </Row>

                  <TariffsTableComponent
                    tariffs={pagedTariffs}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={loading}
                  />

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!loading && (
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{pagedTariffs.length}</span> sur {filteredTariffs.length} tarifs
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Modal for Add and Update Tariffs */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{currentTariff ? "Modifier Tarif" : "Ajouter Tarif"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Plan */}
            <Form.Group className="mb-2" controlId="formPlan">
              <Form.Label>Plan</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  name="plan"
                  value={formData.plan}
                  onChange={handleFormChange}
                  readOnly
                  required
                />
                <Button variant="outline-secondary" onClick={openPlanSearch}>
                  Search
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Destination */}
            <Form.Group className="mb-2" controlId="formDestination">
              <Form.Label>Destination</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  name="destination"
                  value={`${formData.prefix ? formData.prefix + " - " : ""}${formData.destination}`}
                  onChange={handleFormChange}
                  readOnly
                  required
                />
                <Button variant="outline-secondary" onClick={openDestinationSearch}>
                  Search
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Trunk groups */}
            <Form.Group className="mb-2" controlId="formTrunkGroup">
              <Form.Label>Trunk groups</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  name="trunk_group_name"
                  value={formData.trunk_group_name}
                  onChange={handleFormChange}
                  readOnly
                  required
                />
                <Button variant="outline-secondary" onClick={openTrunkGroupSearch}>
                  Search
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Sell price */}
            <Form.Group className="mb-2" controlId="formSellrate">
              <Form.Label>Sell price</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                name="sellrate"
                value={formData.sellrate}
                onChange={handleFormChange}
                required
              />
              <Form.Text className="text-muted">Stocké comme 'rateinitial' dans la base de données</Form.Text>
            </Form.Group>

            {/* Initial / Billing blocks */}
            <Form.Group className="mb-2" controlId="formInitblock">
              <Form.Label>Initial block</Form.Label>
              <Form.Control
                type="number"
                name="initblock"
                value={formData.initblock}
                onChange={handleFormChange}
                min={1}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="formBillingblock">
              <Form.Label>Billing block</Form.Label>
              <Form.Control
                type="number"
                name="billingblock"
                value={formData.billingblock}
                onChange={handleFormChange}
                min={1}
                required
              />
            </Form.Group>

            {/* Minimum time to charge */}
            <Form.Group className="mb-2" controlId="formMinTime">
              <Form.Label>Minimum time to charge</Form.Label>
              <Form.Control
                type="number"
                name="minimal_time_buy"
                value={formData.minimal_time_buy}
                onChange={handleFormChange}
                min={0}
                required
              />
            </Form.Group>

            {/* Additional time */}
            <Form.Group className="mb-2" controlId="formAdditionalTime">
              <Form.Label>Additional time</Form.Label>
              <Form.Control
                type="number"
                name="additional_time"
                value={formData.additional_time}
                onChange={handleFormChange}
                min={0}
              />
            </Form.Group>

            {/* Connection charge */}
            <Form.Group className="mb-2" controlId="formConnectionCharge">
              <Form.Label>Connection charge</Form.Label>
              <Form.Control
                type="text"
                name="connection_charge"
                value={formData.connection_charge}
                onChange={handleFormChange}
              />
            </Form.Group>

            {/* Include in offer */}
            <Form.Group className="mb-2" controlId="formIncludeOffer">
              <Form.Label>Include in offer</Form.Label>
              <Form.Select name="include_in_offer" value={formData.include_in_offer} onChange={handleFormChange}>
                <option>No</option>
                <option>Yes</option>
              </Form.Select>
            </Form.Group>

            {/* Status */}
            <Form.Group className="mb-2" controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleFormChange}>
                <option>Active</option>
                <option>Inactive</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                {currentTariff ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Plan Search Modal */}
      <Modal show={showPlanSearch} onHide={() => setShowPlanSearch(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Rechercher un Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Filtrer..."
              value={planSearchTerm}
              onChange={(e) => setPlanSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loadingPlans ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="border rounded">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {planResults.length > 0 ? (
                    planResults.map((plan) => (
                      <tr key={plan.id} onClick={() => selectPlan(plan)} style={{ cursor: "pointer" }}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={formData.id_plan === plan.id}
                            onChange={() => selectPlan(plan)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>{plan.name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center py-3">
                        {loadingPlans ? "Chargement..." : "Aucun résultat trouvé"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlanSearch(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Destination Search Modal */}
      <Modal show={showDestinationSearch} onHide={() => setShowDestinationSearch(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Rechercher une Destination</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Filtrer..."
              value={destinationSearchTerm}
              onChange={(e) => setDestinationSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loadingDestinations ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="border rounded">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>Prefix</th>
                    <th>Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {destinationResults.length > 0 ? (
                    destinationResults.map((prefix) => (
                      <tr key={prefix.id} onClick={() => selectDestination(prefix)} style={{ cursor: "pointer" }}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={formData.id_prefix === prefix.id}
                            onChange={() => selectDestination(prefix)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>{prefix.prefix}</td>
                        <td>{prefix.destination}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-3">
                        {loadingDestinations ? "Chargement..." : "Aucun résultat trouvé"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDestinationSearch(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Trunk Group Search Modal */}
      <Modal show={showTrunkGroupSearch} onHide={() => setShowTrunkGroupSearch(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Rechercher un Groupe de Trunk</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Filtrer..."
              value={trunkGroupSearchTerm}
              onChange={(e) => setTrunkGroupSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loadingTrunkGroups ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="border rounded">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {trunkGroupResults.length > 0 ? (
                    trunkGroupResults.map((trunkGroup) => (
                      <tr
                        key={trunkGroup.id}
                        onClick={() => selectTrunkGroup(trunkGroup)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={formData.id_trunk_group === trunkGroup.id}
                            onChange={() => selectTrunkGroup(trunkGroup)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>{trunkGroup.name || trunkGroup.trunk_group_name}</td>
                        <td>{trunkGroup.description || trunkGroup.trunk_group_description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-3">
                        {loadingTrunkGroups ? "Chargement..." : "Aucun résultat trouvé"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTrunkGroupSearch(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default TariffsTable
