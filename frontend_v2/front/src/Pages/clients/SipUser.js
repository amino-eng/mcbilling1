import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Tabs, Tab } from "react-bootstrap";
import axios from "axios";

const SIPUsers = () => {
  const [sipUsers, setSipUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedUser, setSelectedUser] = useState(""); // État pour l'utilisateur sélectionné
  const [user,setUsers]=useState([])
const fetchUser =()=>{
  axios.get('http://localhost:5000/api/admin/SIPUsers/nom').then(res => {
    setUsers(res.data.users);
  }).catch(err => console.log(err));

}


  useEffect(() => {
    fetchSIPUsers();
    fetchUser(); // Récupérer les utilisateurs pour le dropdown
  }, []);

  const fetchSIPUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/SIPUsers/affiche");
      setSipUsers(response.data.sipUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/SIPUsers/delete/${id}`);
        fetchSIPUsers();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/SIPUsers/ajouter", { ...formData, selectedUser });
      setShow(false);
      fetchSIPUsers();
    } catch (error) {
      console.error("Error adding data:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>SIP Users Management</h2>
      <Button variant="primary" onClick={() => setShow(true)} className="mb-3">
        Add SIP User
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Account Code</th>
            <th>Host</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sipUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.accountcode}</td>
              <td>{user.host}</td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(user.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
       {/* Add SIP User Modal */}
       <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add SIP User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Tabs defaultActiveKey="general" className="mb-3">
              <Tab eventKey="general" title="General">
                {/* User Dropdown */}
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <select
                    className="form-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Select User</option>
                    {user.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>SIP Password</Form.Label>
                  <Form.Control type="text" name="sipPassword" onChange={handleChange} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Caller ID</Form.Label>
                  <Form.Control type="text" name="callerId" onChange={handleChange} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Alias</Form.Label>
                  <Form.Control type="text" name="alias" onChange={handleChange} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Disable</Form.Label>
                  <Form.Control as="select" name="disable" onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Codecs</Form.Label>
                  <div className="row">
                    <div className="col-4">
                      <Form.Check type="checkbox" label="g729" name="codecs" value="g729" onChange={handleChange} checked />
                      <Form.Check type="checkbox" label="g726" name="codecs" value="g726" onChange={handleChange} />
                      <Form.Check type="checkbox" label="ulaw" name="codecs" value="ulaw" onChange={handleChange} checked />
                    </div>
                    <div className="col-4">
                      <Form.Check type="checkbox" label="speex" name="codecs" value="speex" onChange={handleChange} />
                      <Form.Check type="checkbox" label="h264" name="codecs" value="h264" onChange={handleChange} />
                      <Form.Check type="checkbox" label="g723" name="codecs" value="g723" onChange={handleChange} />
                    </div>
                    <div className="col-4">
                      <Form.Check type="checkbox" label="opus" name="codecs" value="opus" onChange={handleChange} checked />
                      <Form.Check type="checkbox" label="g722" name="codecs" value="g722" onChange={handleChange} />
                      <Form.Check type="checkbox" label="h263p" name="codecs" value="h263p" onChange={handleChange} />
                    </div>
                    <div className="col-4">
                      <Form.Check type="checkbox" label="vp8" name="codecs" value="vp8" onChange={handleChange} />
                      <Form.Check type="checkbox" label="gsm" name="codecs" value="gsm" onChange={handleChange} checked />
                      <Form.Check type="checkbox" label="alaw" name="codecs" value="alaw" onChange={handleChange} checked />
                    </div>
                    <div className="col-4">
                      <Form.Check type="checkbox" label="ilbc" name="codecs" value="ilbc" onChange={handleChange} />
                      <Form.Check type="checkbox" label="h263" name="codecs" value="h263" onChange={handleChange} />
                    </div>
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Host</Form.Label>
                  <Form.Control type="text" name="host" onChange={handleChange} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Group</Form.Label>
                  <Form.Control type="text" name="group" onChange={handleChange} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Block Call Reap</Form.Label>
                  <Form.Control as="select" name="blockCallReap" onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Record Call</Form.Label>
                  <Form.Control as="select" name="recordCall" onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Tech Prefix</Form.Label>
                  <Form.Control type="text" name="techPrefix" onChange={handleChange} required />
                </Form.Group>
              </Tab>
              <Tab eventKey="nat" title="NAT">
                <Form.Group>
                  <Form.Label>NAT</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nat" 
                    onChange={handleChange} 
                    placeholder="force_rport,comedia" 
                    required 
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Directmedia</Form.Label>
                  <Form.Control as="select" name="directmedia" onChange={handleChange} required>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Qualify</Form.Label>
                  <Form.Control as="select" name="qualify" onChange={handleChange} required>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
              </Tab>
              <Tab eventKey="additional" title="Additional">
                <Form.Group>
                  <Form.Label>Port</Form.Label>
                  <Form.Control type="text" name="port" onChange={handleChange} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Context</Form.Label>
                  <Form.Control type="text" name="context" onChange={handleChange} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Dtmfmode</Form.Label>
                  <Form.Control as="select" name="dtmfmode" onChange={handleChange} required>
                    <option value="RFC2833">RFC2833</option>
                    <option value="info">INFO</option>
                    <option value="auto">AUTO</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Insecure</Form.Label>
                  <Form.Control as="select" name="insecure" onChange={handleChange} required>
                    <option value="no">No</option>
                    <option value="invite">Invite</option>
                    <option value="port">Port</option>
                    <option value="both">Both</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Deny</Form.Label>
                  <Form.Control type="text" name="deny" onChange={handleChange} placeholder="e.g., 0.0.0.0/0" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Permit</Form.Label>
                  <Form.Control type="text" name="permit" onChange={handleChange} placeholder="e.g., 192.168.1.0/24" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Control as="select" name="type" onChange={handleChange} required>
                    <option value="friend">Friend</option>
                    <option value="peer">Peer</option>
                    <option value="user">User</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Allowtransfer</Form.Label>
                  <Form.Control as="select" name="allowtransfer" onChange={handleChange} required>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Fake Ring</Form.Label>
                  <Form.Control as="select" name="fakeRing" onChange={handleChange} required>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Call Limit</Form.Label>
                  <Form.Control type="number" name="callLimit" onChange={handleChange} defaultValue={0} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>MOH</Form.Label>
                  <Form.Control type="text" name="moh" onChange={handleChange} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Addparameter</Form.Label>
                  <Form.Control type="text" name="addparameter" onChange={handleChange} />
                </Form.Group>
              </Tab>
              <Tab eventKey="forward" title="Forward">
                <Form.Group>
                  <Form.Label>Forward Type</Form.Label>
                  <Form.Control as="select" name="forwardType" onChange={handleChange} required>
                    <option value="undefined">undefined</option>
                    <option value="SIP">SIP</option>
                    <option value="IVR">IVR</option>
                    <option value="Queue">Queue</option>
                    <option value="Group">Group</option>
                    <option value="Number">Number</option>
                    <option value="Hangup">Hangup</option>
                    <option value="Custom">Custom</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Dial Timeout</Form.Label>
                  <Form.Control type="number" name="dialTimeout" onChange={handleChange} defaultValue={60} required />
                </Form.Group>
              </Tab>
              <Tab eventKey="voicemail" title="VoiceMail">
                <Form.Group>
                  <Form.Label>Enable Voicemail</Form.Label>
                  <Form.Control as="select" name="enableVoicemail" onChange={handleChange} required>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" onChange={handleChange} required placeholder="e.g., example@example.com" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="text" name="password" onChange={handleChange} required />
                </Form.Group>
              </Tab>
              <Tab eventKey="asterisk" title="Asterisk Extra Config">
                <Form.Group>
                  <Form.Label>Parameters</Form.Label>
                  <Form.Control as="textarea" name="Parameters" onChange={handleChange} required />
                </Form.Group>
              </Tab>
              <Tab eventKey="sipshowpeer" title="SipShowPeer">
                <Form.Group>
                  <Form.Control as="textarea" name="sipshowpeer" onChange={handleChange} required />
                </Form.Group>
              </Tab>
            </Tabs>
            <Button variant="primary" type="submit" className="mt-3">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SIPUsers;