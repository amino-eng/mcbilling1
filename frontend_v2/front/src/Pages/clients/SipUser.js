"use client"
import { useEffect, useState } from "react"
import { Table, Button, Modal, Form, Tabs, Tab } from "react-bootstrap"
import axios from "axios"

const SIPUsers = () => {
  const [sipUsers, setSipUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [formData, setFormData] = useState({
    id_user: "",
    sippasswd: "",
    callerid: "",
    alias: "",
    name: "",
    disable: "no",
    codecs: [],
    host: "",
    sip_group: "",
    block_call_reg: "no",
    record_call: "no",
    techprefix: "",
    nat: "",
    directmedia: "no",
    qualify: "no",
    context: "",
    dtmfmode: "RFC2833",
    insecure: "no",
    deny: "",
    permit: "",
    type: "friend",
    allowtransfer: "no",
    fakeRing: "no",
    callLimit: 0,
    moh: "",
    addparameter: "",
    forwardType: "undefined",
    dial_timeout: 60,
    enableVoicemail: "no",
    email: "",
    password: "",
    voicemail_email: "",
    voicemail_password: "",
    accountcode: "",
    status: "",
    allow: "",
  })
  const [selectedUser, setSelectedUser] = useState("")
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // État pour afficher/masquer le mot de passe

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/admin/SIPUsers/nom")
      .then((res) => setUsers(res.data?.users || []))
      .catch((err) => {
        console.log(err)
        setUsers([])
      })
  }

  const fetchSIPUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/SIPUsers/affiche")
      setSipUsers(response.data?.sipUsers || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setSipUsers([])
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/SIPUsers/delete/${id}`)
        fetchSIPUsers()
      } catch (error) {
        console.error("Error deleting data:", error)
      }
    }
  }

  const handleEdit = async (user) => {
    setEditingId(user.id)
    setIsLoading(true)
    try {
      // Pré-remplir les champs du formulaire avec les données de l'utilisateur sélectionné
      setFormData({
        id_user: user.id_user || "",
        name: user.name || "",
        accountcode: user.accountcode || "",
        host: user.host || "",
        status: user.status || "",
        allow: user.allow || "",
        sippasswd: user.secret || "",
        callerid: user.callerid || "",
        alias: user.alias || "",
        disable: user.disable || "no",
        codecs: user.codecs ? user.codecs.split(",") : [],
        sip_group: user.sip_group || "",
        block_call_reg: user.block_call_reg || "no",
        record_call: user.record_call || "no",
        techprefix: user.techprefix || "",
        nat: user.nat || "",
        directmedia: user.directmedia || "no",
        qualify: user.qualify || "no",
        context: user.context || "",
        dtmfmode: user.dtmfmode || "RFC2833",
        insecure: user.insecure || "no",
        deny: user.deny || "",
        permit: user.permit || "",
        type: user.type || "friend",
        allowtransfer: user.allowtransfer || "no",
        fakeRing: user.fakeRing || "no",
        callLimit: user.callLimit || 0,
        moh: user.moh || "",
        addparameter: user.addparameter || "",
        forwardType: user.forwardType || "undefined",
        dial_timeout: user.dial_timeout || 60,
        enableVoicemail: user.enableVoicemail || "no",
        email: user.email || "",
        password: user.secret || "", // Pré-remplir le champ 'password' avec 'secret'
        voicemail_email: user.voicemail_email || "",
        voicemail_password: user.voicemail_password || "",
      })
      setShowEdit(true)
    } catch (error) {
      console.error("Error preparing edit form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id_user: "",
      sippasswd: "",
      callerid: "",
      alias: "",
      name: "",
      disable: "no",
      codecs: [],
      host: "",
      sip_group: "",
      block_call_reg: "no",
      record_call: "no",
      techprefix: "",
      nat: "",
      directmedia: "no",
      qualify: "no",
      context: "",
      dtmfmode: "RFC2833",
      insecure: "no",
      deny: "",
      permit: "",
      type: "friend",
      allowtransfer: "no",
      fakeRing: "no",
      callLimit: 0,
      moh: "",
      addparameter: "",
      forwardType: "undefined",
      dial_timeout: 60,
      enableVoicemail: "no",
      email: "",
      password: "",
      voicemail_email: "",
      voicemail_password: "",
      accountcode: "",
      status: "",
      allow: "",
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      setFormData((prev) => {
        const codecs = checked ? [...prev.codecs, value] : prev.codecs.filter((codec) => codec !== value)
        return { ...prev, codecs }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const requiredFields = ["name", "host"]
    for (const field of requiredFields) {
      if (!formData[field] && formData[field] !== 0) {
        alert(`${field} is required!`)
        return
      }
    }
    const dataToSubmit = {
      id_user: selectedUser,
      name: formData.name,
      accountcode: formData.accountcode || "",
      host: formData.host,
      status: formData.status || "",
      allow: formData.allow || "",
    }
    try {
      await axios.post("http://localhost:5000/api/admin/SIPUsers/ajouter", dataToSubmit)
      setShowAdd(false)
      resetForm()
      fetchSIPUsers()
    } catch (error) {
      console.error("Error adding data:", error.response ? error.response.data : error.message)
      alert(`Error: ${error.response ? error.response.data.error : error.message}`)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:5000/api/admin/SIPUsers/modifier/${editingId}`, formData)
      setShowEdit(false)
      resetForm()
      fetchSIPUsers()
    } catch (error) {
      console.error("Error updating data:", error.response ? error.response.data : error.message)
      alert(`Error: ${error.response ? error.response.data.error : error.message}`)
    }
  }

  const exportToCSV = () => {
    const csvRows = []
    const headers = ["ID", "Name", "Account Code", "Host", "Status"]
    csvRows.push(headers.join(","))
    sipUsers.forEach((user) => {
      const row = [
        user.id_user,
        user.name,
        user.accountcode,
        user.host,
        user.status === 1 ? "unregistered" : user.status === 0 ? "unmonitored" : "unknown",
      ]
      csvRows.push(row.join(","))
    })
    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.setAttribute("download", "sip_users.csv")
    a.click()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchSIPUsers()
    fetchUsers()
  }, [])

  const filteredUsers = sipUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const renderForm = (isEdit = false) => (
    <Form onSubmit={isEdit ? handleUpdate : handleSubmit}>
      <Tabs defaultActiveKey="general" className="mb-3">
        <Tab eventKey="general" title="General">
          <Form.Group>
            <Form.Label>Username</Form.Label>
            <select
              className="form-select"
              value={isEdit ? formData.id_user : selectedUser}
              onChange={(e) =>
                isEdit ? setFormData({ ...formData, id_user: e.target.value }) : setSelectedUser(e.target.value)
              }
            >
              <option value="">Select User</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.accountcode}
                </option>
              ))}
            </select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type={showPassword ? "text" : "password"} // Change dynamiquement le type du champ
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={togglePasswordVisibility} // Bascule la visibilité du mot de passe
                className="ms-2"
              >
                {showPassword ? "Masquer Password" : "Afficher Password"}
              </Button>
            </div>
            {formData.password?.length > 0 &&
              (formData.password.length < 8 || formData.password.length > 12) && (
                <Form.Text className="text-danger">
                  Password must be between 8 and 12 characters long.
                </Form.Text>
              )}
          </Form.Group>
          <Form.Group>
            <Form.Label>SIP Password</Form.Label>
            <Form.Control type="text" name="sippasswd" value={formData.sippasswd} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Caller ID</Form.Label>
            <Form.Control type="text" name="callerid" value={formData.callerid} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Alias</Form.Label>
            <Form.Control type="text" name="alias" value={formData.alias} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Disable</Form.Label>
            <Form.Control as="select" name="disable" value={formData.disable} onChange={handleChange}>
              <option value="no">No</option>
              <option value="all">All</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Codecs</Form.Label>
            <div className="row">
              {[
                "g729",
                "g726",
                "ulaw",
                "speex",
                "h264",
                "g723",
                "opus",
                "g722",
                "h263p",
                "vp8",
                "gsm",
                "alaw",
                "ilbc",
                "h263",
              ].map((codec) => (
                <div className="col-4" key={codec}>
                  <Form.Check
                    type="checkbox"
                    label={codec}
                    name="codecs"
                    value={codec}
                    onChange={handleChange}
                    checked={formData.codecs?.includes(codec)}
                  />
                </div>
              ))}
            </div>
          </Form.Group>
          <Form.Group>
            <Form.Label>Host</Form.Label>
            <Form.Control type="text" name="host" value={formData.host} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>SIP Group</Form.Label>
            <Form.Control type="text" name="sip_group" value={formData.sip_group} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Block Call Reg</Form.Label>
            <Form.Control as="select" name="block_call_reg" value={formData.block_call_reg} onChange={handleChange}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Record Call</Form.Label>
            <Form.Control as="select" name="record_call" value={formData.record_call} onChange={handleChange}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Tech Prefix</Form.Label>
            <Form.Control type="text" name="techprefix" value={formData.techprefix} onChange={handleChange} required />
          </Form.Group>
        </Tab>
      </Tabs>
      <div className="mt-3 text-center">
        <Button variant="secondary" onClick={() => (isEdit ? setShowEdit(false) : setShowAdd(false))}>
          Close
        </Button>
        <Button variant="primary" type="submit" className="ms-2">
          {isEdit ? "Update" : "Submit"}
        </Button>
      </div>
    </Form>
  )

  return (
    <div className="container mt-4">
      <h2>SIP Users Management</h2>
      <Button
        variant="primary"
        onClick={() => {
          setShowAdd(true)
          resetForm()
        }}
        className="mb-3"
      >
        Add SIP User
      </Button>
      <Button variant="success" onClick={exportToCSV} className="mb-3 ms-2">
        Export to CSV
      </Button>
      <Form.Control
        type="text"
        placeholder="Search by Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
      />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Account Code</th>
            <th>Host</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.accountcode}</td>
              <td>{user.host}</td>
              <td>{user.status === 1 ? "unregistered" : user.status === 0 ? "unmonitored" : "unknown"}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(user)} className="me-2">
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(user.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* Pagination */}
      <div className="d-flex justify-content-between mt-3">
        <Button variant="primary" onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <div>
          {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "primary" : "outline-primary"}
              onClick={() => paginate(i + 1)}
              className="ms-1"
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
        >
          Next
        </Button>
      </div>
      {/* Add SIP User Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add SIP User</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm(false)}</Modal.Body>
      </Modal>
      {/* Edit SIP User Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit SIP User</Modal.Title>
        </Modal.Header>
        <Modal.Body>{isLoading ? <div className="text-center">Loading...</div> : renderForm(true)}</Modal.Body>
      </Modal>
    </div>
  )
}

export default SIPUsers