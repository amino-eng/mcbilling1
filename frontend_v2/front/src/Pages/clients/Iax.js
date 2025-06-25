"use client"

import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { 
    Table, 
    Dropdown, 
    Pagination, 
    Container, 
    Row, 
    Col, 
    Form, 
    Button, 
    Modal, 
    Tabs, 
    Tab, 
    InputGroup,
    Card,
    Badge,
    Spinner,
    Alert,
    ToastContainer,
    Toast
} from 'react-bootstrap';
import axios from 'axios';
import {
    FaChevronDown,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationCircle,
    FaLock,
    FaUnlock,
    FaEdit,
    FaTrash,
    FaEye,
    FaEyeSlash,
    FaSearch,
    FaDownload,
    FaPlusCircle,
    FaUserPlus,
    FaUsers,
    FaFilter,
    FaSyncAlt,
    FaPhone,
    FaPhoneAlt,
    FaPhoneVolume,
    FaKey
} from 'react-icons/fa';

const IaxHeader = ({ onAddClick, data, onExportClick }) => (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
        <div className="bg-primary p-3 w-100 position-relative">
            <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
                {Array(5).fill().map((_, i) => (
                    <div key={i} className="floating-icon position-absolute" style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.5}s`,
                    }}>
                        <FaPhoneVolume className="text-white opacity-25" style={{
                            fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                        }} />
                    </div>
                ))}
            </div>
            <div className="d-flex align-items-center position-relative z-2">
                <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
                    <FaPhoneAlt className="text-primary fs-3" />
                </div>
                <div>
                    <h2 className="fw-bold mb-0 text-white">IAX Management</h2>
                    <p className="text-white-50 mb-0 d-none d-md-block">Easily manage your IAX accounts</p>
                </div>
            </div>
        </div>
        <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
            <div className="d-flex align-items-center gap-3">
                <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
                    <span className="me-2 fw-normal">Total: <span className="fw-bold">{data.length}</span></span>
                    <span className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: "24px", height: "24px"}}>
                        <FaPhoneAlt size={12} />
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
                    <span>Add</span>
                </Button>
                <CSVLink 
                    data={data} 
                    filename={"iax-data.csv"}
                    className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                >
                    <div className="icon-container">
                        <FaDownload />
                    </div>
                    <span>Exporter</span>
                </CSVLink>
            </div>
        </div>
    </Card.Header>
)

const SearchBar = ({ searchTerm, onSearchChange, searchField, onSearchFieldChange }) => (
    <div className="search-container position-relative mb-4">
        <div className="position-absolute top-50 start-0 translate-middle-y ps-3 search-icon">
            <FaSearch className="text-primary" />
        </div>
        <Form.Control
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={onSearchChange}
            className="py-2 ps-5 shadow-sm border-0 search-input"
            style={{
                borderRadius: "50rem",
                background: "#f8f9fa",
                transition: "all 0.3s ease",
                borderLeft: "4px solid transparent",
            }}
        />
        <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
            <Dropdown>
                <Dropdown.Toggle variant="link" id="dropdown-search-field" className="text-muted p-0 shadow-none">
                    <FaFilter size={14} />
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                    <Dropdown.Item active={searchField === 'all'} onClick={() => onSearchFieldChange('all')}>Tous les champs</Dropdown.Item>
                    <Dropdown.Item active={searchField === 'name'} onClick={() => onSearchFieldChange('name')}>Nom</Dropdown.Item>
                    <Dropdown.Item active={searchField === 'user_name'} onClick={() => onSearchFieldChange('user_name')}>Utilisateur</Dropdown.Item>
                    <Dropdown.Item active={searchField === 'host'} onClick={() => onSearchFieldChange('host')}>Host</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    </div>
)

const StatusBadge = ({ status }) => {
    let variant, icon, text;
    
    if (status === 'dynamic') {
        variant = "success";
        icon = <FaCheckCircle />;
        text = "Dynamic";
    } else if (status === 'static') {
        variant = "info";
        icon = <FaLock />;
        text = "Static";
    } else {
        variant = "secondary";
        icon = <FaTimesCircle />;
        text = status || "Unknown";
    }
    
    return (
        <Badge
            bg={variant}
            pill
            className="d-flex align-items-center gap-1 py-2 px-3 position-relative status-badge"
            style={{
                background: variant === "success" ? "linear-gradient(45deg, #28a745, #20c997)" :
                          variant === "info" ? "linear-gradient(45deg, #17a2b8, #5bc0de)" :
                          "linear-gradient(45deg, #6c757d, #adb5bd)",
                overflow: "hidden",
                transition: "all 0.3s ease",
            }}
        >
            <span className="status-icon">{icon}</span>{" "}
            {text}
        </Badge>
    );
};

const PaginationSection = ({ currentPage, totalPages, onPageChange }) => (
    <div className="d-flex justify-content-center">
        <nav>
            <ul className="pagination pagination-md">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                        &laquo;
                    </button>
                </li>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(page)}>
                            {page}
                        </button>
                    </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    </div>
)

const IaxTable = () => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [hiddenColumns, setHiddenColumns] = useState([
        'IAX Password', 'Context', 'CallerID', 'Codec', 'NAT', 'Qualify', 'Dtmfmode', 'Insecure', 'Type', 'IP',
    ]);
    const [sortConfig, setSortConfig] = useState({ key: 'user_name', direction: 'asc' });
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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [idFieldName, setIdFieldName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    // Fonction pour trier les données
    const sortData = (data, { key, direction }) => {
        if (!key) return data;
        
        return [...data].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'asc' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    // Gérer le clic sur l'en-tête de colonne pour le tri
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filtrer les données selon le terme de recherche et le champ sélectionné
    useEffect(() => {
        const performSearch = (term, field) => {
            if (!term) {
                return data;
            }
            
            const lowerTerm = term.toLowerCase();
            return data.filter(item => {
                if (field === 'all') {
                    return Object.values(item).some(value => 
                        typeof value === 'string' && value.toLowerCase().includes(lowerTerm)
                    );
                } else {
                    return typeof item[field] === 'string' && 
                           item[field].toLowerCase().includes(lowerTerm);
                }
            });
        };

        let filtered = performSearch(searchTerm, searchField);
        
        // Appliquer le tri
        filtered = sortData(filtered, sortConfig);
        
        setFilteredData(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }, [searchTerm, searchField, data, itemsPerPage, sortConfig]);

    const fetchIax = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/Iax/nom');
            if (res.data && res.data.users && Array.isArray(res.data.users)) {
                setUsers(res.data.users);
                console.log('Users fetched successfully:', res.data.users);
                // Log each user for debugging
                res.data.users.forEach(user => {
                    console.log(`User ID: ${user.id}, Username: ${user.username}`);
                });
                return res.data.users; // Return the users for immediate use if needed
            } else {
                console.error('Invalid user data format:', res.data);
                setError('Invalid user data format');
                return [];
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
            return [];
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Make sure we have users data first
            if (users.length === 0) {
                await fetchIax();
            }
            
            const response = await axios.get('http://localhost:5000/api/admin/Iax/affiche');
            console.log('IAX data:', response.data.iax);
            console.log('Users data:', users);
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
            
            // Process the IAX data for display
            const processedData = response.data.iax.map(item => {
                // Log the current item for debugging
                console.log('Processing IAX item:', item);
                
                // Based on the console logs, we can see that IAX entries don't have id_user
                // Instead, we'll use the name field as the username for display
                return {
                    ...item,
                    // Use name as the display username
                    display_username: item.name || 'Unknown',
                    // Use user_name as the IAX username
                    iax_username: item.user_name || ''
                };
            });
            
            console.log('Processed IAX data:', processedData);
            console.log('Processed data with usernames:', processedData);
            setData(processedData);
            return processedData;
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData().then(data => {
            setData(data);
            setFilteredData(data);
            setTotalPages(Math.ceil(data.length / itemsPerPage));
        });
    }, [itemsPerPage]); // Empty dependency array means this runs once on mount

    const filterData = (data, searchTerm, searchField) => {
        try {
            if (!searchTerm) return data;
            
            return data.filter(item => {
                if (searchField === 'all') {
                    return Object.values(item).some(val => 
                        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
                    );
                } else {
                    return item[searchField] && 
                        item[searchField].toString().toLowerCase().includes(searchTerm.toLowerCase());
                }
            });
        } catch (err) {
            console.error("Error filtering data:", err);
            return data;
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    
    // Calculate total pages
    useEffect(() => {
        const calculatedTotalPages = Math.ceil(filteredData.length / itemsPerPage);
        setTotalPages(calculatedTotalPages);
    }, [filteredData, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, searchField]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleColumnVisibility = (column) => {
        setHiddenColumns((prev) => 
            prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
        );
    };

    // Define column names and their corresponding data fields
    const columns = [
        'Username', 'IAX User', 'IAX Password', 'Host', 'IP', 'Context',
        'CallerID', 'Codec', 'NAT', 'Dtmfmode', 'Insecure', 'Type'
    ];
    
    // Map column names to data fields
    const columnToField = {
        'Username': 'display_username', // Use the display_username field we created
        'IAX User': 'user_name',  // IAX User is the user_name field in the data
        'Host': 'host',
        'Type': 'type',
        'Context': 'context'
    };

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
            setSuccessMessage("Enregistrement supprimé avec succès");
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
        setSuccessMessage(null);
        
        try {
            const entryToAdd = { 
                ...newEntry,
                allow: formData.codecs.join(','),
                secret: newEntry.secret || generatePassword(),
                id_user: parseInt(newEntry.id_user) || 0
            };
    
            // Log the data to be sent
            console.log('Data to be sent:', entryToAdd);
    
            // Attempt to add the new entry
            const response = await axios.post('http://localhost:5000/api/admin/Iax/ajouter', entryToAdd);
            
            // Handle successful response
            setSuccessMessage("IAX entry added successfully.");
            fetchData();
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error adding new entry:', error);
            console.error('Error details:', error.response.data);
    
            // Handle specific error for duplicate entry
            if (error.response && error.response.data && error.response.data.error === "Duplicate entry for user_name") {
                setError("This username already exists. Please choose a different username.");
            } else {
                setError('Failed to add new entry: ' + (error.response?.data?.error || error.message));
            }
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

    // Function to get username by user ID
    const getUsernameById = (userId) => {
        if (!userId) return 'N/A';
        
        // Convert userId to string for comparison
        const userIdStr = String(userId);
        
        // Find the user with the matching ID
        const user = users.find(user => String(user.id) === userIdStr);
        
        // Debug info
        console.log(`Looking for user with ID: ${userIdStr}`);
        console.log(`Found user:`, user);
        
        // Return username if found, otherwise return the ID
        return user ? user.username : userIdStr;
    };
    
    const handleUserSelect = (e) => {
        const selectedUserId = e.target.value;
        // Convert user IDs to strings for comparison to handle potential type mismatches
        const selectedUser = users.find(user => String(user.id) === selectedUserId);
        
        setNewEntry(prev => ({
            ...prev,
            id_user: selectedUserId,
            user_name: selectedUser ? selectedUser.username : '',
            secret: selectedUser ? selectedUser.password : '' // Auto-fill the password field
        }));
    };

    const handleEdit = (item) => {
        // Find the user by username, not by id_user
        const username = item.user_name;
        const matchingUser = users.find(user => user.username === username);
        const id_user = matchingUser ? String(matchingUser.id) : "";
        
        setNewEntry({
            user_name: item.user_name,
            id_user: id_user, // Use the ID from the matching user
            secret: matchingUser ? matchingUser.password : item.secret, // Use the user's password if available
            host: item.host,
            port: item.port,
            context: item.context,
            callerid: item.callerid,
            allow: item.allow ? item.allow.split(',') : [],
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

    // Add CSS for animations and effects
    const styles = {
        floatingIcon: {
            animation: 'float 3s ease-in-out infinite',
        },
        pulseEffect: {
            animation: 'pulse 2s infinite',
        },
        tableContainer: {
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e9ecef',
            transition: 'all 0.3s ease',
        },
        emptyState: {
            animation: 'fadeIn 0.5s ease-in-out',
        }
    };

    // Handle search term change
    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search field change
    const handleSearchFieldChange = (field) => {
        setSearchField(field);
    };

    return (
        <div className="py-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            {/* Toast notifications */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
                {successMessage && (
                    <Toast 
                        onClose={() => setSuccessMessage(null)} 
                        show={successMessage !== null} 
                        delay={3000} 
                        autohide 
                        bg="success"
                    >
                        <Toast.Header closeButton>
                            <strong className="me-auto">Confirm Deletion</strong>
                        </Toast.Header>
                        <Toast.Body className="text-white">{successMessage}</Toast.Body>
                    </Toast>
                )}
                {error && (
                    <Toast 
                        onClose={() => setError(null)} 
                        show={error !== null} 
                        delay={3000} 
                        autohide 
                        bg="danger"
                    >
                        <Toast.Header closeButton>
                            <strong className="me-auto">Error</strong>
                        </Toast.Header>
                        <Toast.Body className="text-white">{error}</Toast.Body>
                    </Toast>
                )}
            </ToastContainer>

            <Container fluid className="px-4 py-4">
                <Row className="justify-content-center">
                    <Col xs={12} lg={11}>
                        <Card className="shadow border-0 overflow-hidden main-card">
                            <IaxHeader 
                                onAddClick={() => { setIsEditMode(false); setShowAddModal(true); }} 
                                data={data} 
                            />
                            <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                                {error && (
                                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                                        <FaTimesCircle className="me-2" />
                                        {error}
                                    </Alert>
                                )}
                                
                                <Row className="mb-4">
                                    <Col md={6} lg={4}>
                                        <SearchBar 
                                            searchTerm={searchTerm} 
                                            onSearchChange={handleSearchTermChange} 
                                            searchField={searchField} 
                                            onSearchFieldChange={handleSearchFieldChange} 
                                        />
                                    </Col>
                                    <Col md={6} lg={4} className="ms-auto d-flex justify-content-end align-items-center">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-muted">Columns:</span>
                                            <Dropdown>
                                                <Dropdown.Toggle variant="light" id="dropdown-columns" className="d-flex align-items-center gap-2">
                                                    <FaFilter size={14} /> Filter
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    {columns.map((column) => (
                                                        <Dropdown.Item 
                                                            key={column} 
                                                            onClick={() => toggleColumnVisibility(column)}
                                                            active={!hiddenColumns.includes(column)}
                                                        >
                                                            {column === 'Nom d\'utilisateur' ? 'Username' :
                                                            column === 'IAX User' ? 'IAX User' :
                                                            column === 'IAX Pass' ? 'IAX Password' :
                                                            column === 'Host' ? 'Host' :
                                                            column === 'Type' ? 'Type' :
                                                            column === 'Context' ? 'Context' : column
                                                        }
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </Col>
                                </Row>
                                
                                {/* Table container with modern styling */}
                                <div className="table-responsive" style={styles.tableContainer}>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-3 text-muted">Loading data...</p>
                                        </div>
                                    ) : filteredData.length === 0 ? (
                                        <div className="text-center py-5" style={styles.emptyState}>
                                            <div className="mb-3 position-relative d-inline-block">
                                                <div className="position-relative">
                                                    <div className="rounded-circle bg-light p-4 d-inline-block">
                                                        <FaPhone className="text-primary" size={40} style={styles.floatingIcon} />
                                                    </div>
                                                    <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle border border-3 border-primary" style={{ borderStyle: 'dashed', animation: 'spin 10s linear infinite' }}></div>
                                                </div>
                                            </div>
                                            <h5 className="mb-2">No IAX account found</h5>
                                            <p className="text-muted mb-4">No data matching your search criteria</p>
                                            <Button variant="primary" onClick={() => { setIsEditMode(false); setShowAddModal(true); }}>
                                                <FaPlusCircle className="me-2" /> Add an IAX account
                                            </Button>
                                        </div>
                                    ) : (
                                        <Table hover responsive className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    {columns.map(column => !hiddenColumns.includes(column) && (
                                                        <th 
                                                        key={column} 
                                                        className="py-3"
                                                        style={column === 'IAX User' ? { 
                                                            cursor: 'pointer',
                                                            userSelect: 'none',
                                                            position: 'relative',
                                                            paddingRight: '20px'
                                                        } : {}}
                                                        onClick={column === 'IAX User' ? () => requestSort('user_name') : undefined}
                                                    >
                                                        {column === 'Nom d\'utilisateur' ? 'Username' :
                                                         column === 'IAX User' ? (
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <span>IAX User</span>
                                                                {sortConfig.key === 'user_name' && (
                                                                    <span className="ms-2" style={{
                                                                        display: 'inline-block',
                                                                        transition: 'transform 0.2s',
                                                                        transform: sortConfig.direction === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)'
                                                                    }}>
                                                                        ▲
                                                                    </span>
                                                                )}
                                                            </div>
                                                         ) :
                                                         column === 'IAX Pass' ? 'IAX Password' :
                                                         column === 'Host' ? 'Host' :
                                                         column === 'Type' ? 'Type' :
                                                         column === 'Context' ? 'Context' : column
                                                        }
                                                    </th>
                                                    ))}
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((item, index) => (
                                                    <tr key={index} className="align-middle">
                                                        {!hiddenColumns.includes('Username') && <td>{item.display_username || '-'}</td>}
                                                        {!hiddenColumns.includes('IAX User') && <td>{item.user_name || '-'}</td>}
                                                        {!hiddenColumns.includes('IAX Password') && <td>••••••••</td>}
                                                        {!hiddenColumns.includes('Host') && <td>{item.host || '-'}</td>}
                                                        {!hiddenColumns.includes('Type') && <td>{item.type || '-'}</td>}
                                                        {!hiddenColumns.includes('Context') && <td>{item.context || '-'}</td>}
                                                        
                                                        <td className="text-end">
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm" 
                                                                className="me-2" 
                                                                onClick={() => handleEdit(item)}
                                                                style={styles.actionBtn}
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm" 
                                                                onClick={() => handleDelete(item)}
                                                                style={styles.actionBtn}
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </div>
                                
                                {/* Pagination section */}
                                {filteredData.length > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mt-4">
                                        <div className="text-muted small">
                                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                                            {searchTerm && ` (filtered from ${data.length} total entries)`}
                                        </div>
                                        <PaginationSection 
                                            currentPage={currentPage} 
                                            totalPages={totalPages} 
                                            onPageChange={paginate} 
                                        />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modals */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? "Edit IAX User" : "Add New IAX User"}</Modal.Title>
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
                                            <option key={user.id} value={String(user.id)}>
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
                                    <InputGroup>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            name="secret"
                                            value={newEntry.secret}
                                            onChange={handleInputChange}
                                            placeholder=""
                                        />
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </Button>
                                    </InputGroup>
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
                                        onChange={handleInputChange}/>
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
                                    <Tab eventKey="NAT details" title="NAT Details">
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
                                    <Tab eventKey="Supplementary info" title="Additional Info">
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
                                Close
                            </Button>
                            <Button variant="primary" onClick={isEditMode ? handleAddNew : handleAddNew} disabled={isLoading}>
                                {isLoading ? 'Processing...' : (isEditMode ? 'Update' : 'Add')}
                            </Button>
                        </Modal.Footer>
                    </Modal>
        
                    <Modal show={deleteItemId !== null} onHide={() => setDeleteItemId(null)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirmer la suppression</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete this item?</p>
                            {idFieldName && (
                                <p><strong>ID ({idFieldName}):</strong> {deleteItemId}</p>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setDeleteItemId(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={confirmDelete} disabled={isLoading}>
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                {/* Add CSS for animations */}
                <style jsx>{`
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0px); }
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .floating-icon {
                        animation: float 3s ease-in-out infinite;
                    }
                    .pulse-effect {
                        animation: pulse 2s infinite;
                    }
                    .btn-hover-effect:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    }
                    .main-card {
                        transition: all 0.3s ease;
                    }
                    .main-card:hover {
                        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    }
                    tr {
                        transition: all 0.2s;
                    }
                    tr:hover {
                        background-color: rgba(0,123,255,0.03);
                    }
                `}</style>
            </div>
        );
    };
    
    export default IaxTable;