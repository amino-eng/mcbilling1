import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { Table, Dropdown, Pagination, Container, Row, Col, Form, Button, Modal, Tabs, Tab, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { Search, X } from 'lucide-react';

const IaxTable = () => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [hiddenColumns, setHiddenColumns] = useState([
        'Context', 'CallerID', 'Codec', 'NAT', 'Qualify', 'Dtmfmode', 'Insecure', 'Type', 'IP',
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newEntry, setNewEntry] = useState({
        user_name: '',
        id_user: '',
        secret: '',
        host: 'dynamic',
        port: '4569',
        context: 'billing',
        callerid: '',
        allow: '',
        disallow: 'all',
        nat: 'force,report,comedia',
        qualify: 'no',
        dtmfmode: 'RFC2833',
        insecure: 'no',
        type: 'friend'
    });
    const [formData, setFormData] = useState({
        codecs: ['g729', 'alaw', 'gsm', 'ulaw']
    });
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [idFieldName, setIdFieldName] = useState(null);

    const fetchIax = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/Iax/nom');
            setUsers(res.data.users);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/admin/Iax/affiche');
            
            if (response.data.iax && response.data.iax.length > 0) {
                const firstItem = response.data.iax[0];
                const keys = Object.keys(firstItem);
                const possibleIdFields = ['id', 'ID', 'pk', 'iax_id', 'iaxId', 'Id'];
                let foundIdField = null;
                
                for (const field of possibleIdFields) {
                    if (keys.includes(field)) {
                        foundIdField = field;
                        break;
                    }
                }
                
                if (!foundIdField) {
                    for (const key of keys) {
                        const value = firstItem[key];
                        if ((typeof value === 'number' || !isNaN(parseInt(value))) && key.toLowerCase().includes('id')) {
                            foundIdField = key;
                            break;
                        }
                    }
                }
                
                if (!foundIdField) {
                    for (const key of keys) {
                        const value = firstItem[key];
                        if (typeof value === 'number' || !isNaN(parseInt(value))) {
                            foundIdField = key;
                            break;
                        }
                    }
                }
                
                if (foundIdField) {
                    setIdFieldName(foundIdField);
                }
            }
            
            setData(response.data.iax);
            setError(null);
        } catch (error) {
            console.error('Error fetching IAX data:', error);
            setError('Failed to fetch IAX data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIax(); 
        fetchData(); 
    }, []);

    const filterData = (data, searchTerm, searchField) => {
        if (!searchTerm) return data;
        
        return data.filter(item => {
            if (searchField === 'all') {
                return Object.keys(item).some(key => {
                    const value = item[key];
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                });
            }
            
            const value = item[searchField];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    const filteredData = filterData(data, searchTerm, searchField);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, searchField]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleColumnVisibility = (column) => {
        setHiddenColumns((prev) => 
            prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
        );
    };

    const columns = [
        'Username', 'IAX User', 'IAX Pass', 'Host', 'IP', 'Context',
        'CallerID', 'Codec', 'NAT', 'Dtmfmode', 'Insecure', 'Type', 'Actions'
    ];

    const renderPagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
            pageNumbers.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
                    {i}
                </Pagination.Item>
            );
        }
        return <Pagination>{pageNumbers}</Pagination>;
    };

    const handleDelete = (item) => {
        if (!idFieldName) {
            console.error("No ID field identified. Cannot delete.");
            alert("Error: Cannot identify ID field for deletion. Please check console for details.");
            return;
        }
        
        const itemId = item[idFieldName];
        if (itemId === undefined || itemId === null) {
            console.error(`Item does not have a value for ${idFieldName}`);
            alert(`Error: This item does not have an ID (${idFieldName}). Cannot delete.`);
            return;
        }
        
        setDeleteItemId(itemId);
    };

    const confirmDelete = async () => {
        if (!deleteItemId) {
            return;
        }
        
        setIsLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/admin/Iax/delete/${deleteItemId}`);
            setData(prevData => prevData.filter(item => item[idFieldName] !== deleteItemId));
            setDeleteItemId(null);
            alert("Enregistrement supprimé avec succès");
            fetchData();
        } catch (error) {
            console.error('Error during deletion:', error);
            const errorMessage = error.response?.data?.error || error.message;
            setError(`Failed to delete item: ${errorMessage}`);
            alert(`Erreur lors de la suppression: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const generatePassword = () => {
        const length = 10;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    const handleAddNew = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const entryToAdd = { 
                ...newEntry,
                allow: formData.codecs.join(','),
                secret: newEntry.secret || generatePassword(),
                id_user: parseInt(newEntry.id_user) || 0
            };

            await axios.post('http://localhost:5000/api/admin/Iax/ajouter', entryToAdd);
            fetchData();
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error adding new entry:', error);
            setError('Failed to add new entry: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setNewEntry({
            user_name: '',
            id_user: '',
            secret: '',
            host: 'dynamic',
            port: '4569',
            context: 'billing',
            callerid: '',
            allow: '',
            disallow: 'all',
            nat: 'force,report,comedia',
            qualify: 'no',
            dtmfmode: 'RFC2833',
            insecure: 'no',
            type: 'friend'
        });
        setFormData({
            codecs: ['g729', 'alaw', 'gsm', 'ulaw']
        });
    };

    const handleChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => {
            const codecs = prev.codecs.includes(value)
                ? prev.codecs.filter((codec) => codec !== value)
                : [...prev.codecs, value];
            return { ...prev, codecs };
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUserSelect = (e) => {
        const selectedUserId = e.target.value;
        const selectedUser = users.find(user => user.id === selectedUserId);
        
        setNewEntry(prev => ({
            ...prev,
            id_user: selectedUserId,
            user_name: selectedUser ? selectedUser.username : ''
        }));
    };

    const handleEdit = (item) => {
        setNewEntry({
            user_name: item.user_name,
            id_user: item.id_user,
            secret: item.secret,
            host: item.host,
            port: item.port,
            context: item.context,
            callerid: item.callerid,
            allow: item.allow.split(','),
            disallow: item.disallow,
            nat: item.nat,
            qualify: item.qualify,
            dtmfmode: item.dtmfmode,
            insecure: item.insecure,
            type: item.type
        });
        setIsEditMode(true);
        setShowAddModal(true);
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">IAX Table</h2>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            
            {!idFieldName && (
                <div className="alert alert-warning" role="alert">
                    Warning: Could not identify ID field. Delete functionality may not work correctly.
                </div>
            )}
            
            <Row className="mb-3">
                <Col md={3}>
                    <CSVLink data={data} filename="iax_data.csv" className="btn btn-primary me-2">
                        Export CSV
                    </CSVLink>
                </Col>
                <Col md={3}>
                    <Dropdown>
                        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                            Toggle Columns
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {columns.map((column) => (
                                <Dropdown.Item key={column}>
                                    <Form.Check
                                        inline
                                        label={column}
                                        type="checkbox"
                                        checked={!hiddenColumns.includes(column)}
                                        onChange={() => toggleColumnVisibility(column)}
                                    />
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col md={3}>
                    <Button variant="success" onClick={() => {
                        setIsEditMode(false);
                        setShowAddModal(true);
                    }}>
                        Ajouter
                    </Button>
                </Col>
                <Col md={3}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search size={16} />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setSearchTerm('')}
                            >
                                <X size={16} />
                            </Button>
                        )}
                        <Form.Select 
                            value={searchField} 
                            onChange={(e) => setSearchField(e.target.value)}
                        >
                            <option value="all">All Fields</option>
                            {Object.keys(data[0] || {}).map(field => (
                                <option key={field} value={field}>
                                    {field}
                                </option>
                            ))}
                        </Form.Select>
                    </InputGroup>
                </Col>
            </Row>

            {isLoading && !currentItems.length ? (
                <div className="text-center my-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                {columns.map(
                                    (column) => !hiddenColumns.includes(column) && <th key={column}>{column}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={index}>
                                        {!hiddenColumns.includes('Username') && <td>{item.name || item.user_name}</td>}
                                        {!hiddenColumns.includes('IAX User') && <td>{item.user_name}</td>}
                                        {!hiddenColumns.includes('IAX Pass') && <td>{item.secret}</td>}
                                        {!hiddenColumns.includes('Host') && <td>{item.host}</td>}
                                        {!hiddenColumns.includes('IP') && <td>{item.ip || 'N/A'}</td>}
                                        {!hiddenColumns.includes('Context') && <td>{item.context}</td>}
                                        {!hiddenColumns.includes('CallerID') && <td>{item.callerid}</td>}
                                        {!hiddenColumns.includes('Codec') && <td>{item.allow}</td>}
                                        {!hiddenColumns.includes('NAT') && <td>{item.nat}</td>}
                                        {!hiddenColumns.includes('Dtmfmode') && <td>{item.dtmfmode}</td>}
                                        {!hiddenColumns.includes('Insecure') && <td>{item.insecure}</td>}
                                        {!hiddenColumns.includes('Type') && <td>{item.type}</td>}
                                        <td>
                                            <Button 
                                                variant="warning" 
                                                onClick={() => handleEdit(item)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                onClick={() => handleDelete(item)}
                                                disabled={isLoading || !idFieldName}
                                            >
                                                Supprimer
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length - hiddenColumns.length} className="text-center">
                                        {searchTerm ? 'No matching records found' : 'No data available'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    
                    {filteredData.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                                {searchTerm && ` (filtered from ${data.length} total entries)`}
                            </div>
                            <div className="d-flex justify-content-center">
                                {renderPagination()}
                            </div>
                        </div>
                    )}
                </>
            )}

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? "Modifier l'utilisateur IAX" : "Ajouter un nouvel utilisateur IAX"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Tabs defaultActiveKey="General" className="mb-3">
                            <Tab eventKey="General" title="General">
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Select
                                        name="id_user"
                                        value={newEntry.id_user}
                                        onChange={handleUserSelect}
                                    >
                                        <option value="">Select a user</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.username}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formIAXUser">
                                    <Form.Label>IAX User</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="user_name"
                                        value={newEntry.user_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter IAX username"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formIAXPass">
                                    <Form.Label>IAX Password</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="secret"
                                        value={newEntry.secret}
                                        onChange={handleInputChange}
                                        placeholder="Leave empty to generate automatically"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formDisallow">
                                    <Form.Label>Disallow</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="disallow"
                                        value={newEntry.disallow} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formHost">
                                    <Form.Label>Host</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="host"
                                        value={newEntry.host} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
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
                            </Tab>
                            <Tab eventKey="NAT details" title="NAT details">
                                <Form.Group className="mb-3" controlId="formNAT">
                                    <Form.Label>NAT</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="nat"
                                        value={newEntry.nat} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Tab>
                            <Tab eventKey="Supplementary info" title="Supplementary info">
                                <Form.Group className="mb-3" controlId="formContext">
                                    <Form.Label>Context</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="context"
                                        value={newEntry.context} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formDtmfmode">
                                    <Form.Label>Dtmfmode</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="dtmfmode"
                                        value={newEntry.dtmfmode} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formInsecure">
                                    <Form.Label>Insecure</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="insecure"
                                        value={newEntry.insecure} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formType">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="type"
                                        value={newEntry.type} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formCallerID">
                                    <Form.Label>Caller ID</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="callerid"
                                        value={newEntry.callerid} 
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Tab>
                        </Tabs>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Fermer
                    </Button>
                    <Button variant="primary" onClick={isEditMode ? handleAddNew : handleAddNew} disabled={isLoading}>
                        {isLoading ? 'Adding...' : (isEditMode ? 'Modifier' : 'Ajouter')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={deleteItemId !== null} onHide={() => setDeleteItemId(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
                    {idFieldName && (
                        <p><strong>ID ({idFieldName}):</strong> {deleteItemId}</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeleteItemId(null)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Supprimer'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default IaxTable;