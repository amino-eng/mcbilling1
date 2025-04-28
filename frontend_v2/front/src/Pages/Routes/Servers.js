"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Button, Table, Form, Row, Col, Modal, Spinner, Toast, ToastContainer
} from "react-bootstrap"

const API_BASE = "http://localhost:5000/api/admin/Servers"

export default function ServersTable() {
  const [servers, setServers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentServer, setCurrentServer] = useState(null)
  const [form, setForm] = useState({
    name: "",
    host: "",
    public_ip: "",
    username: "",
    password: "",
    port: "",
    sip_port: 5060,
    status: 1,
    type: "asterisk",
    description: ""
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" })

  const fetchServers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/afficher`)
      setServers(data.servers || [])
    } catch (err) {
      console.error(err)
      showToast("Échec du chargement", "danger")
    }
  }

  useEffect(() => { fetchServers() }, [])

  const showToast = (message, variant="success") => {
    setToast({ show: true, message, variant })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  const handleShow = (srv=null) => {
    setCurrentServer(srv)
    setForm(srv ? { ...srv } : {
      name: "", host: "", public_ip: "", username: "",
      password: "", port: "", sip_port: 5060,
      status: 1, type: "asterisk", description: ""
    })
    setShowModal(true)
  }
  const handleClose = () => setShowModal(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSave = async () => {
    // Build payload with correct types
    const payload = {
      name: form.name,
      host: form.host,
      public_ip: form.public_ip || null,
      username: form.username,
      password: form.password || null,
      port: form.port ? Number(form.port) : null,
      sip_port: form.sip_port ? Number(form.sip_port) : null,
      status: Number(form.status),
      type: form.type,
      description: form.description || null
    }

    // Required fields
    if (!payload.name || !payload.host || !payload.username) {
      showToast("Name, host et username sont requis", "danger")
      return
    }

    try {
      setLoading(true)
      if (currentServer) {
        await axios.put(`${API_BASE}/modifier/${currentServer.id}`, payload)
        showToast("Serveur mis à jour")
      } else {
        await axios.post(`${API_BASE}/ajouter`, payload)
        showToast("Serveur ajouté")
      }
      fetchServers()
      handleClose()
    } catch (err) {
      console.error(err.response || err)
      const msg = err.response?.data?.error || "Erreur réseau"
      showToast(msg, "danger")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm("Confirmer la suppression ?")) return
    try {
      await axios.delete(`${API_BASE}/supprimer/${id}`)
      showToast("Serveur supprimé")
      fetchServers()
    } catch {
      showToast("Erreur de suppression", "danger")
    }
  }

  // filter + pagination omitted for brevity…
  const filtered = servers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-4">
      <h4>Liste des serveurs</h4>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Rechercher…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col className="text-end">
          <Button onClick={() => handleShow()} className="me-2">+ Ajouter</Button>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nom</th><th>Hôte</th><th>Utilisateur</th>
            <th>Statut</th><th>Type</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.host}</td>
              <td>{s.username}</td>
              <td>{s.status === 1 ? "Actif" : "Inactif"}</td>
              <td>{s.type}</td>
              <td>
                <Button size="sm" onClick={() => handleShow(s)} className="me-2">✏️</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>🗑️</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentServer ? "Modifier Serveur" : "Ajouter Serveur"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {[
              ["name", "Name"],
              ["host", "Host"],
              ["public_ip", "Public IP"],
              ["username", "Username"],
              ["password", "Password", "password"],
              ["port", "Port"],
              ["sip_port", "SIP Port"]
            ].map(([k, label, type="text"]) => (
              <Form.Group className="mb-2" key={k}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type={type}
                  name={k}
                  value={form[k] || ""}
                  onChange={handleChange} required
                />
              </Form.Group>
            ))}

            <Form.Group className="mb-2">
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={form.type} onChange={handleChange}>
                <option value="asterisk">Asterisk</option>
                <option value="magnus">MagnusBilling</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Statut</Form.Label>
              <Form.Select name="status" value={form.status} onChange={handleChange}>
                <option value={1}>Actif</option>
                <option value={0}>Inactif</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={form.description || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} variant="secondary">Annuler</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg={toast.variant} show={toast.show}>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  )
}
