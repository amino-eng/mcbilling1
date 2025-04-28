"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Table, Spinner, Alert, Form, Button, InputGroup, Modal } from "react-bootstrap"

const TariffTable = () => {
  const [tariffs, setTariffs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentTariff, setCurrentTariff] = useState(null)

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

  useEffect(() => {
    fetchTariffs()
  }, [])

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase()
    setFiltered(
      tariffs.filter(
        (t) =>
          (t.prefix && t.prefix.includes(searchTerm)) ||
          (t.destination && t.destination.toLowerCase().includes(lowerSearch)) ||
          (t.plan && t.plan.toLowerCase().includes(lowerSearch)),
      ),
    )
  }, [searchTerm, tariffs])

  // Filter search results based on search terms
  useEffect(() => {
    if (planSearchTerm && planResults.length > 0) {
      const lowerSearch = planSearchTerm.toLowerCase()
      const filtered = planResults.filter((plan) => plan.name && plan.name.toLowerCase().includes(lowerSearch))
      setPlanResults(filtered)
    }
  }, [planSearchTerm])

  useEffect(() => {
    if (destinationSearchTerm && destinationResults.length > 0) {
      const lowerSearch = destinationSearchTerm.toLowerCase()
      const filtered = destinationResults.filter(
        (prefix) =>
          (prefix.prefix && prefix.prefix.includes(destinationSearchTerm)) ||
          (prefix.destination && prefix.destination.toLowerCase().includes(lowerSearch)),
      )
      setDestinationResults(filtered)
    }
  }, [destinationSearchTerm])

  useEffect(() => {
    if (trunkGroupSearchTerm && trunkGroupResults.length > 0) {
      const lowerSearch = trunkGroupSearchTerm.toLowerCase()
      const filtered = trunkGroupResults.filter(
        (trunkGroup) =>
          (trunkGroup.name && trunkGroup.name.toLowerCase().includes(lowerSearch)) ||
          (trunkGroup.trunk_group_name && trunkGroup.trunk_group_name.toLowerCase().includes(lowerSearch)) ||
          (trunkGroup.description && trunkGroup.description.toLowerCase().includes(lowerSearch)) ||
          (trunkGroup.trunk_group_description &&
            trunkGroup.trunk_group_description.toLowerCase().includes(lowerSearch)),
      )
      setTrunkGroupResults(filtered)
    }
  }, [trunkGroupSearchTerm])

  const fetchTariffs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/Tariffs/afficher")
      setTariffs(res.data.tarifs)
      setFiltered(res.data.tarifs)
    } catch (err) {
      console.error(err)
      setError("Erreur lors de la récupération des tarifs.")
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value)

  const handleAddNew = () => {
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
    setCurrentTariff(null)
    setShowModal(true)
  }

  const handleUpdate = (tariff) => {
    setFormData({
      id_plan: tariff.id_plan || "",
      id_prefix: tariff.id_prefix || "",
      id_trunk_group: tariff.id_trunk_group || "",
      prefix: tariff.prefix || "",
      destination: tariff.destination || "",
      sellrate: tariff.rateinitial || "", // Changé de sellrate à rateinitial
      initblock: tariff.initblock || "",
      billingblock: tariff.billingblock || "",
      trunk_group_name: tariff.trunk_group_name || "",
      plan: tariff.plan || "",
      minimal_time_buy: tariff.minimal_time_charge || "", // Changé de minimal_time_buy à minimal_time_charge
      additional_time: tariff.additional_grace || "", // Changé de additional_time à additional_grace
      connection_charge: tariff.connectcharge || "", // Changé de connection_charge à connectcharge
      include_in_offer: tariff.package_offer ? "Yes" : "No", // Changé de include_in_offer à package_offer
      status: tariff.status ? "Active" : "Inactive",
    })
    setCurrentTariff(tariff)
    setShowModal(true)
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

  if (loading) return <Spinner animation="border" />
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between mb-3">
        <InputGroup style={{ maxWidth: "300px" }}>
          <Form.Control placeholder="Recherche..." value={searchTerm} onChange={handleSearchChange} />
        </InputGroup>
        <Button variant="primary" onClick={handleAddNew}>
          + Ajouter
        </Button>
      </div>

      <div className="table-responsive">
        <Table striped hover>
          <thead>
            <tr>
              <th>
                <Form.Check disabled />
              </th>
              <th>Prefix</th>
              <th>Destination</th>
              <th>Sell price</th>
              <th>Initial block</th>
              <th>Billing block</th>
              <th>Trunk groups</th>
              <th>Plan</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className={selected.includes(t.id) ? "table-active" : ""}>
                <td>
                  <Form.Check checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} />
                </td>
                <td>{t.prefix}</td>
                <td>{t.destination}</td>
                <td>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(t.rateinitial)}</td>
                <td>{t.initblock}</td>
                <td>{t.billingblock}</td>
                <td>{t.trunk_group_name}</td>
                <td>{t.plan}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleUpdate(t)}>
                    Modifier
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(t.id)}>
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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

export default TariffTable
