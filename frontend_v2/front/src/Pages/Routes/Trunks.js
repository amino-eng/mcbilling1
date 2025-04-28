import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Modal, Tabs, Tab, Row, Col, InputGroup } from "react-bootstrap";
import { CSVLink } from "react-csv";
import { BiSearch, BiEdit, BiTrash } from "react-icons/bi";

// ------------------ AddTrunkModal Component ------------------
const AddTrunkModal = ({ show, onHide, onTrunkAdded, trunkToEdit, setTrunkToEdit }) => {
  const [key, setKey] = useState("general");
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
    asteriskParams: ""
  });

  const [providers, setProviders] = useState([]);

  const fetchProviders = () => {
    axios.get("http://localhost:5000/api/admin/Providers/afficher")
      .then((res) => setProviders(res.data.providers))
      .catch(err => console.error("Error fetching providers:", err));
  };

  useEffect(() => {
    fetchProviders();
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
        // Add other fields as needed
      });
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
        asteriskParams: ""
      });
    }
  }, [trunkToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const payload = {
      id_provider: formData.provider,
      trunkcode: formData.name,
      user: formData.username,
      secret: formData.password,
      host: formData.host,
      trunkprefix: formData.addprefix,
      removeprefix: formData.removeprefix,
      fromuser: formData.fromuser,
      fromdomain: formData.fromdomain,
      context: formData.context,
      dtmfmode: formData.dtmfmode,
      insecure: formData.insecure,
      nat: formData.nat,
      qualify: formData.qualify,
      type: formData.type,
      disallow: "",
      allow: "ulaw,alaw",
      port: formData.port,
      sendrpid: formData.sendrpid,
      directmedia: formData.directmedia,
      providertech: formData.providertech,
    };

    if (trunkToEdit) {
      // Update existing trunk - THIS IS THE FIXED PART
      const updateData = {
        trunkIds: [trunkToEdit.id], // Send as array since batchUpdate expects an array
        ...payload // Include all the updated fields
      };
      
      axios
        .put(`http://localhost:5000/api/admin/Trunks/batchUpdate`, updateData)
        .then((res) => {
          console.log("Trunk updated:", res.data);
          onTrunkAdded?.();
          onHide();
          setTrunkToEdit(null);
        })
        .catch((err) => {
          console.error("Error updating trunk:", err);
          alert("Failed to update trunk. Please check required fields.");
        });
    } else {
      // Add new trunk
      payload.creationdate = new Date().toISOString().slice(0, 19).replace("T", " ");
      payload.providerip = "";

      axios
        .post("http://localhost:5000/api/admin/Trunks/ajouter", payload)
        .then((res) => {
          console.log("Trunk added:", res.data);
          onTrunkAdded?.();
          onHide();
        })
        .catch((err) => {
          console.error("Error adding trunk:", err);
          alert("Failed to add trunk. Please check required fields.");
        });
    }
  };

  return (
    <Modal show={show} onHide={() => {
      onHide();
      setTrunkToEdit(null);
    }} size="lg">
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
    <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
    <Form.Control
      name={field}
      type={field === "password" ? "password" : "text"}
      value={formData[field]}
      onChange={(e) => {
        const value = e.target.value;

        // Champs qui doivent contenir uniquement des chiffres
        const numericOnly = ["host", "addprefix", "removeprefix"];

        if (numericOnly.includes(field)) {
          // N'autoriser que les chiffres
          if (/^\d*$/.test(value)) {
            handleChange(e);
          }
        } else {
          // Pour les autres champs, autoriser tout
          handleChange(e);
        }
      }}
    />
  </Form.Group>
))}

                </Col>

                <Col md={6}>
                <Form.Label>Codec</Form.Label>
<div>
  {["g729", "g723", "gsm", "g726", "opus", "alaw", "ulaw", "g722", "ilbc", "speex", "h261", "h263"].map(codec => (
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
                        { value: 0, label: "Inactive" }
                      ]
                    },
                    { name: "registertrunk", options: ["No", "Yes"] }
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
                          )
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
                  {["fromuser", "fromdomain", "cidadd", "cidremove", "context", "dtmfmode", "insecure"].map(field => (
                    <Form.Group key={field} controlId={field}>
                      <Form.Label>{field}</Form.Label>
                      <Form.Control 
                        name={field} 
                        value={formData[field]} 
                        onChange={handleChange} 
                      />
                    </Form.Group>
                  ))}
                </Col>
                <Col md={6}>
                  {["maxuse", "nat", "directmedia", "qualify", "type", "sendrpid", "addparameter", "port"].map(field => (
                    <Form.Group key={field} controlId={field}>
                      <Form.Label>{field}</Form.Label>
                      <Form.Control
                        name={field}
                        type={field === "maxuse" || field === "port" ? "number" : "text"}
                        value={formData[field]}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  ))}
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
        <Button variant="secondary" onClick={() => {
          onHide();
          setTrunkToEdit(null);
        }}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {trunkToEdit ? "Update" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ------------------ Main Trunks Component ------------------
const Trunks = () => {
  const [trunks, setTrunks] = useState([]);
  const [filteredTrunks, setFilteredTrunks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trunkToDelete, setTrunkToDelete] = useState(null);
  const [trunkToEdit, setTrunkToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTrunks = () => {
    axios.get("http://localhost:5000/api/admin/Trunks/afficher")
      .then((response) => {
        setTrunks(response.data.trunks);
        setFilteredTrunks(response.data.trunks);
      })
      .catch(err => console.error("Error fetching trunks:", err));
  };

  useEffect(() => {
    fetchTrunks();
  }, []);

  useEffect(() => {
    const filtered = trunks.filter(trunk =>
      Object.values(trunk).some(
        value =>
          value &&
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredTrunks(filtered);
  }, [searchQuery, trunks]);

  const handleDelete = (id) => {
    setTrunkToDelete(id);
    setShowDeleteModal(true);
  };

  const handleEdit = (trunk) => {
    setTrunkToEdit(trunk);
    setShowAddModal(true);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:5000/api/admin/Trunks/supprimer/${trunkToDelete}`)
      .then(() => {
        fetchTrunks();
        setShowDeleteModal(false);
      })
      .catch(err => {
        console.error("Error deleting trunk:", err);
        alert("Failed to delete trunk");
      });
  };

  const formatDate = (dateString) => {
    const options = {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const statusLabels = {
    0: "inactive",
    1: "active",
    2: "pending",
    3: "sent",
    4: "blocked",
    5: "AMD"
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Trunks</h2>
      
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div className="d-flex gap-2">
          <CSVLink data={filteredTrunks} filename="trunks.csv" className="btn btn-primary">
            Export CSV
          </CSVLink>
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            Add New Trunk
          </Button>
        </div>
        
        <InputGroup style={{ width: '300px' }}>
          <Form.Control
            placeholder="Search trunks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroup.Text>
            <BiSearch />
          </InputGroup.Text>
        </InputGroup>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Add Prefix</th>
            <th>Remove Prefix</th>
            <th>Host</th>
            <th>Provider</th>
            <th>Time Used</th>
            <th>Status</th>
            <th>Creation Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTrunks.map((trunk) => (
            <tr key={trunk.id}>
              <td>{trunk.trunkcode}</td>
              <td>{trunk.trunkprefix}</td>
              <td>{trunk.removeprefix}</td>
              <td>{trunk.host}</td>
              <td>{trunk.provider_name}</td>
              <td>{trunk.secondusedreal}</td>
              <td>{statusLabels[trunk.status] || "pending"}</td>
              <td>{formatDate(trunk.creationdate)}</td>
              <td>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(trunk)}
                >
                  <BiEdit /> Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(trunk.id)}
                >
                  <BiTrash /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <AddTrunkModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onTrunkAdded={fetchTrunks}
        trunkToEdit={trunkToEdit}
        setTrunkToEdit={setTrunkToEdit}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this trunk? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Trunks;