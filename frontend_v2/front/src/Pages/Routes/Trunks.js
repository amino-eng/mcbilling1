import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Modal, Tabs, Tab, Row, Col } from "react-bootstrap";
import { CSVLink } from "react-csv";

// ------------------ AddTrunkModal Component ------------------
const AddTrunkModal = ({ show, onHide, onTrunkAdded }) => {
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
  }, []);

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
      disallow: "", // if needed, you can add logic here
      allow: "ulaw,alaw", // or make this dynamic with selected codecs
      port: formData.port,
      sendrpid: formData.sendrpid,
      directmedia: formData.directmedia,
      creationdate: new Date().toISOString().slice(0, 19).replace("T", " "),
      providertech: formData.providertech,
      providerip: "", // if available, add this to formData
    };
  
    axios
      .post("http://localhost:5000/api/admin/Trunks/ajouter", payload)
      .then((res) => {
        console.log("Trunk added:", res.data);
        onTrunkAdded?.(); // Refresh list
        onHide(); // Close modal
      })
      .catch((err) => {
        console.error("Error adding trunk:", err);
        alert("Failed to add trunk. Please check required fields.");
      });
  };
  
  
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Trunk</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab eventKey="general" title="General">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="provider">
                    <Form.Label>Provider</Form.Label>
                    <Form.Control as="select" name="provider" onChange={handleChange}>
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
                        onChange={handleChange}
                      />
                    </Form.Group>
                  ))}
                </Col>

                <Col md={6}>
                  <Form.Label>Codec</Form.Label>
                  <div>
                    {["g729", "g723", "gsm", "g726", "opus", "alaw", "ulaw", "g722", "ilbc", "speex", "h261", "h263"].map(codec => (
                      <Form.Check inline key={codec} type="checkbox" label={codec} />
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
                      <Form.Control as="select" name={name} onChange={handleChange}>
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
                      <Form.Control name={field} defaultValue={formData[field]} onChange={handleChange} />
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
                        defaultValue={formData[field]}
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
              <Form.Control as="textarea" rows={10} name="asteriskParams" onChange={handleChange} />
            </Form.Group>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

// ------------------ AddNewModalManual Component ------------------
const AddNewModalManual = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    host: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Manual form submitted:", formData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add New Trunk (Manual)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {["name", "provider", "host"].map((field) => (
            <Form.Group className="mb-3" controlId={`form${field}`}>
              <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
              <Form.Control
                type="text"
                placeholder={`Enter ${field}`}
                name={field}
                onChange={handleChange}
              />
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
};

// ------------------ Main Trunks Component ------------------
const Trunks = () => {
  const [trunks, setTrunks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const fetchTrunks = () => {
    axios.get("http://localhost:5000/api/admin/Trunks/afficher")
      .then((response) => {
        setTrunks(response.data.trunks);
      });
  };

  useEffect(() => {
    fetchTrunks();
  }, []);

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

      <div className="mb-3 d-flex gap-2">
        <CSVLink data={trunks} filename="trunks.csv" className="btn btn-primary">Export CSV</CSVLink>
        <Button variant="success" onClick={() => setShowAddModal(true)}>Add New Trunk</Button>
        
      </div>

      <Table striped bordered hover>
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
          </tr>
        </thead>
        <tbody>
          {trunks.map((trunk) => (
            <tr key={trunk.id}>
              <td>{trunk.trunkcode}</td>
              <td>{trunk.trunkprefix}</td>
              <td>{trunk.removeprefix}</td>
              <td>{trunk.host}</td>
              <td>{trunk.provider_name}</td>
              <td>{trunk.secondusedreal}</td>
              <td>{statusLabels[trunk.status] || "pending"}</td>
              <td>{formatDate(trunk.creationdate)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <AddTrunkModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onTrunkAdded={fetchTrunks}
      />

      <AddNewModalManual show={showManualModal} onHide={() => setShowManualModal(false)} />

      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Batch Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>{/* batch update form fields here */}</Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Close</Button>
          <Button variant="warning">Update</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Trunks;
