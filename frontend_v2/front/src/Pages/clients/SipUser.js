import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Tabs, Tab } from "react-bootstrap";
import axios from "axios";

const SIPUsers = () => {
    const [sipUsers, setSipUsers] = useState([]);
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        sippasswd: '',
        callerid: '',
        alias: '',
        name: '', // Added name field
        disable: 'no',
        codecs: [],
        host: '',
        sip_group: '',
        block_call_reg: 'no',
        record_call: 'no',
        techprefix: '',
        nat: '',
        directmedia: 'no',
        qualify: 'no',
        context: '',
        dtmfmode: 'RFC2833',
        insecure: 'no',
        deny: '',
        permit: '',
        type: 'friend',
        allowtransfer: 'no',
        fakeRing: 'no',
        callLimit: 0,
        moh: '',
        addparameter: '',
        forwardType: 'undefined',
        dial_timeout: 60,
        enableVoicemail: 'no',
        email: '',
        password: '',
        Parameters: '',
        sipshowpeer: '',
    });
    const [selectedUser, setSelectedUser] = useState("");
    const [user, setUsers] = useState([]);

    const fetchUsers = () => {
        axios.get('http://localhost:5000/api/admin/SIPUsers/nom')
            .then(res => setUsers(res.data.users))
            .catch(err => console.log(err));
    };

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
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => {
                const codecs = checked
                    ? [...prev.codecs, value]
                    : prev.codecs.filter(codec => codec !== value);
                return { ...prev, codecs };
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation for required fields
        const requiredFields = ['name', 'sippasswd', 'callerid', 'alias', 'host', 'sip_group', 'techprefix'];

        for (const field of requiredFields) {
            if (!formData[field] && formData[field] !== 0) {
                alert(`${field} is required!`);
                return;
            }
        }

        // Correcting the typo for nat if necessary
        if (formData.nat === "forcce_rport") {
            formData.nat = "force_rport"; // Fix the typo
        }

        // Prepare data with correct field names
        const dataToSubmit = {
            id_user: selectedUser, // Include the selected user ID
            name: formData.name, // Include the name field
            sippasswd: formData.sippasswd,
            callerid: formData.callerid,
            alias: formData.alias,
            host: formData.host,
            sip_group: formData.sip_group,
            techprefix: formData.techprefix,
            nat: formData.nat,
            secret: formData.password,
            context: formData.context || '',
            dtmfmode: formData.dtmfmode || 'RFC2833',
            email: formData.email || '',
            Parameters: formData.addparameter || '',
            record_call: formData.record_call || 'no',
            voicemail_email: formData.voicemail_email || '',
            voicemail_password: formData.voicemail_password || ''
            // Add other fields as necessary based on your requirements
        };

        console.log("Submitting data:", dataToSubmit);

        try {
            await axios.post("http://localhost:5000/api/admin/SIPUsers/ajouter", dataToSubmit);
            setShow(false);
            fetchSIPUsers();
        } catch (error) {
            console.error("Error adding data:", error.response ? error.response.data : error.message);
            alert(`Error: ${error.response ? error.response.data.error : error.message}`);
        }
    };

    useEffect(() => {
        fetchSIPUsers();
        fetchUsers();
    }, []);

    

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
                                                {user.accountcode}
                                            </option>
                                        ))}
                                    </select>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>

                                    <Form.Control 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        />
                                </Form.Group>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {(formData.password.length < 8 || formData.password.length > 12) && (
                                        <Form.Text className="text-danger">
                                            Password must be between 8 and 12 characters long.
                                        </Form.Text>
                                    )}
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Caller ID</Form.Label>
                                    <Form.Control type="text" name="callerid" onChange={handleChange}  />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Alias</Form.Label>
                                    <Form.Control type="text" name="alias" onChange={handleChange}  />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Disable</Form.Label>
                                    <Form.Control as="select" name="disable" onChange={handleChange}>
                                        <option value="no">all</option>
                                        
                                        <option value="all">all</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Codecs</Form.Label>
                                    <div className="row">
                                        {['g729', 'g726', 'ulaw', 'speex', 'h264', 'g723', 'opus', 'g722', 'h263p', 'vp8', 'gsm', 'alaw', 'ilbc', 'h263'].map(codec => (
                                            <div className="col-4" key={codec}>
                                                <Form.Check
                                                    type="checkbox"
                                                    label={codec}
                                                    name="codecs"
                                                    value={codec}
                                                    onChange={handleChange}
                                                    checked={formData.codecs.includes(codec)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Host</Form.Label>
                                    <Form.Control type="text" name="host" onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>SIP Group</Form.Label>
                                    <Form.Control type="text" name="sip_group" onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Block Call Reg</Form.Label>
                                    <Form.Control as="select" name="block_call_reg" onChange={handleChange}>
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Record Call</Form.Label>
                                    <Form.Control as="select" name="record_call" onChange={handleChange}>
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Tech Prefix</Form.Label>
                                    <Form.Control type="text" name="techprefix" onChange={handleChange} required />
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
                                    <Form.Label>Add Parameter</Form.Label>
                                    <Form.Control type="text" name="addparameter" onChange={handleChange} />
                                </Form.Group>
                            </Tab>
                            <Tab eventKey="forward" title="Forward">
                                <Form.Group>
                                    <Form.Label>Forward Type</Form.Label>
                                    <Form.Control as="select" name="forwardType" onChange={handleChange} required>
                                        <option value="undefined">Undefined</option>
                                        <option value="fax">Fax</option>
                                        <option value="noanswer">No Answer</option>
                                        <option value="busy">Busy</option>
                                    </Form.Control>
                                </Form.Group>
                            </Tab>
                            <Tab eventKey="voicemail" title="Voicemail">
                                <Form.Group>
                                    <Form.Label>Enable Voicemail</Form.Label>
                                    <Form.Control as="select" name="enableVoicemail" onChange={handleChange} required>
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" onChange={handleChange} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Voicemail Password</Form.Label>
                                    <Form.Control type="password" name="voicemail_password" onChange={handleChange} />
                                </Form.Group>
                            </Tab>
                        </Tabs>

                        <div className="mt-3 text-center">
                            <Button variant="secondary" onClick={() => setShow(false)}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" className="ms-2">
                                Submit
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default SIPUsers;
