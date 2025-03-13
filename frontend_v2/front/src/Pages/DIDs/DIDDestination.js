import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Table, Container, Alert, Button, Pagination, Form, Dropdown } from 'react-bootstrap';

const App = () => {
    const [dids, setDids] = useState([]);
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [user, setUser] = useState([]);
    const [sip, setSip] = useState([]);
    const apiUrl = 'http://localhost:5000/api/admin/DIDDestination/affiche';

    // New state variables to hold form data
    const [newDidData, setNewDidData] = useState({
        did: '',
        username: '',
        status: 'Active',
        priority: 1,
        destinationType: 1, // Default to SIP
        sipUser: '',
    });
    


    //fetch sip user
    const fetchSipUser = () => {
        axios.get("http://localhost:5000/api/admin/SIPUsers/nom")
            .then((response) => {
                setSip(response.data.users)
            })
            .catch((err) => {
                console.error('Error fetching sip user:', err)
            })
    }
    // fetch user
    const fetchUser = () => {
        axios.get("http://localhost:5000/api/admin/users/users")
            .then((response) => {
                setUser(response.data.users)
            })
            .catch((err) => {
                console.error('Error fetching user:', err)
            })
    }

    const fetchDIDs = async () => {
        try {
            const response = await fetch(apiUrl);
            const result = await response.json();
            if (result.dids) {
                setDids(result.dids);
            } else {
                setMessage('No DIDs found');
            }
        } catch (error) {
            console.error('Error fetching DIDs:', error);
            setMessage('Failed to fetch data');
        }
    };

    const getCallTypeLabel = (callType) => {
        const callTypeMap = {
            0: 'Call to PSTN',
            1: 'SIP',
            2: 'IVR',
            3: 'CallingCard',
            4: 'Direct Extension',
            5: 'Cid Callback',
            6: '0800 Callback',
            7: 'Queue',
            8: 'Sip Group',
            9: 'Custom',
            10: 'Context',
            11: 'Multiples IPs',
        };
        return callTypeMap[callType] || 'Unknown';
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    const handleCSVExport = () => {
        const headers = ['DID', 'Username', 'Call Type', 'Time Used', 'Priority', 'Creation Date'];
        const csvRows = [
            headers.join(','),
            ...dids.map((did) => [
                did.did,
                did.username || 'N/A',
                getCallTypeLabel(did.Calltype),
                formatTime(did.TimeUsed),
                did.Priority,
                new Date(did.CreationDate).toLocaleString(),
            ].join(',')),
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'dids.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément?")) {
            setDids((prevDids) => prevDids.filter((did) => did.id !== id));
            setMessage('DID supprimé avec succès.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDidData({
            ...newDidData,
            [name]: value,
        });
    };
    
    const handleAddUser = () => {
        console.log('Request body:', newDidData); // Log the data being sent
        
        // Basic validation
        if (!newDidData.did || !newDidData.username || newDidData.destinationType === undefined || newDidData.priority === undefined ) {
            setMessage("Please fill in all required fields.");
            return;
        }
    
        // API call to add the new DID
        axios.post('http://localhost:5000/api/admin/DIDDestination/add', newDidData)
            .then((response) => {
                setMessage(response.data.message);
                fetchDIDs(); // Refresh the list after adding
            })
            .catch((error) => {
                console.error('Error adding DID:', error.response ? error.response.data : error.message);
                setMessage('Error adding DID: ' + (error.response ? error.response.data.error : error.message));
            });
    };
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDIDs = dids.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        fetchDIDs();
        fetchSipUser();
        fetchUser()
    }, []);

    return (
        <Container>
            <h1 className="mt-5">Gestion des DIDs</h1>

            {message && <Alert variant="info">{message}</Alert>}

            <div className="mb-3 d-flex justify-content-between align-items-center">
                <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-add-user">
                        Ajouter un utilisateur
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Form className="p-3">
                            <Form.Group className="mb-3" controlId="formDID">
                                <Form.Label>DID</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="did"
                                    value={newDidData.did}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select DID</option>
                                    {dids.map((did) => (
                                        <option key={did.id} value={did.id}>
                                            {did.did}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="username"
                                    value={newDidData.username}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Username</option>
                                    {user.map((user) => (
                                        <option key={user.id} value={user.username}>
                                            {user.username}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="status"
                                    value={newDidData.status}
                                    onChange={handleInputChange}
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formPriority">
                                <Form.Label>Priority </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="priority"
                                    value={newDidData.priority}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="5"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formDestination">
    <Form.Label>Destination</Form.Label>
    <Form.Control
        as="select"
        name="destination"
        value={newDidData.destination}
        onChange={handleInputChange}
    >
        <option value="">Select Destination</option>
        <option value="PSTN">PSTN</option>
        <option value="SIP">SIP</option>
        <option value="IVR">IVR</option>
        <option value="CallingCard">Calling Card</option>
        <option value="DirectExtension">Direct Extension</option>
        <option value="CidCallback">Cid Callback</option>
        <option value="0800Callback">0800 Callback</option>
        <option value="Queue">Queue</option>
        <option value="SipGroup">Sip Group</option>
        <option value="Custom">Custom</option>
        <option value="Context">Context</option>
        <option value="MultiplesIPs">Multiples IPs</option>
    </Form.Control>
</Form.Group>

                            <Form.Group className="mb-3" controlId="formSipUser">
                                <Form.Label>SIP User</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="sipUser"
                                    value={newDidData.sipUser}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select SIP User</option>
                                    {sip.map((sipUser) => (
                                        <option key={sipUser.id} value={sipUser.id}>
                                            {sipUser.username}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Button variant="primary" onClick={handleAddUser}>
                                Ajouter
                            </Button>
                        </Form>
                    </Dropdown.Menu>
                </Dropdown>

                <Button variant="success" onClick={handleCSVExport}>
                    Exporter en CSV
                </Button>
            </div>

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>DID</th>
                        <th>Nom d'utilisateur</th>
                        <th>Type d'appel</th>
                        <th>Temps utilisé</th>
                        <th>Priorité</th>
                        <th>Date de création</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentDIDs.map((did) => (
                        <tr key={did.id}>
                            <td>{did.did}</td>
                            <td>{did.username || 'N/A'}</td>
                            <td>{getCallTypeLabel(did.Calltype)}</td>
                            <td>{formatTime(did.TimeUsed)}</td>
                            <td>{did.Priority}</td>
                            <td>{new Date(did.CreationDate).toLocaleString()}</td>
                            <td>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(did.id)}>
                                    Supprimer
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Pagination>
                {[...Array(Math.ceil(dids.length / itemsPerPage))].map((_, index) => (
                    <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </Container>
    );
};

export default App;
