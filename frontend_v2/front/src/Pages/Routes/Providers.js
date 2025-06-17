import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Modal,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
  InputGroup,
  FormControl,
  FormCheck,
  FormSelect,
  Card,
  Badge
} from "react-bootstrap";
import { CSVLink } from "react-csv";
import { 
  BiEdit, 
  BiTrash,
  BiPlus as BiPlusCircle,
  BiSearch, 
  BiFilterAlt, 
  BiExport as BiDownload,
  BiCheckCircle,
  BiXCircle
} from "react-icons/bi";
import { FaUserTie } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants
const ITEMS_PER_PAGE = 10;

// Fonction utilitaire pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return dateString; // Retourne la chaîne originale si la conversion échoue
    }
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return dateString; // En cas d'erreur, retourne la valeur d'origine
  }
};

// ------------------ ProviderHeader Component ------------------
const ProviderHeader = ({ onAddClick, providers, isExporting }) => {
  const csvData = [
    ["Name", "Description", "Credit", "Credit Control", "Creation Date"],
    ...providers.map((provider) => [
      provider.provider_name,
      provider.description || '',
      provider.credit,
      provider.credit_control === 1 ? 'Yes' : 'No',
      new Date(provider.creation_date).toLocaleDateString(),
    ]),
  ];

  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
          {Array(5).fill().map((_, i) => (
            <div
              key={i}
              className="floating-icon position-absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <FaUserTie
                className="text-white opacity-25"
                style={{
                  fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaUserTie className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Providers Management</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Manage your VoIP providers</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
            <span className="me-2 fw-normal">
              Total: <span className="fw-bold">{providers.length}</span>
            </span>
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
            >
              <FaUserTie size={12} />
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
              <BiPlusCircle />
            </div>
            <span>Add</span>
          </Button>
          <CSVLink
            data={csvData}
            filename="providers.csv"
            className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            <div className="icon-container">
              {isExporting ? <Spinner animation="border" size="sm" /> : <BiDownload />}
            </div>
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </CSVLink>
        </div>
      </div>
    </Card.Header>
  );
};

// ------------------ StatusBadge Component ------------------
const StatusBadge = ({ status }) => {
  return (
    <Badge bg={status === 1 ? "success" : "danger"} className="d-flex align-items-center gap-1">
      {status === 1 ? (
        <>
          <BiCheckCircle /> Active
        </>
      ) : (
        <>
          <BiXCircle /> Inactive
        </>
      )}
    </Badge>
  );
};

// ------------------ SearchBar Component ------------------
const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <InputGroup className="search-bar shadow-sm">
      <InputGroup.Text className="bg-white border-end-0">
        <BiSearch />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder="Search for a provider..."
        value={searchTerm}
        onChange={onSearchChange}
        className="border-start-0"
      />
    </InputGroup>
  );
};

// ------------------ ActionButtons Component ------------------
const ActionButtons = ({ onEdit, onDelete }) => {
  return (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={onEdit}
        className="p-1"
        title="Edit"
      >
        <BiEdit size={18} />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onDelete}
        className="p-1"
        title="Delete"
      >
        <BiTrash size={18} />
      </Button>
    </div>
  );
};

// ------------------ ProviderTable Component ------------------
const ProviderTable = ({ providers, onEdit, onDelete, isLoading, onSelectionChange }) => {
  const handleSelectAll = (e) => {
    onSelectionChange(providers.map(provider => ({
      ...provider,
      selected: e.target.checked
    })));
  };

  const handleSelectOne = (id, checked) => {
    onSelectionChange(providers.map(provider => 
      provider.id === id ? { ...provider, selected: checked } : provider
    ));
  };

  return (
    <div className="table-responsive">
      <Table striped hover className="mb-0">
        <thead>
          <tr>
            <th>
              <Form.Check 
                type="checkbox"
                checked={providers.length > 0 && providers.every(p => p.selected)}
                onChange={handleSelectAll}
                disabled={isLoading || providers.length === 0}
              />
            </th>
            <th>Name</th>
            <th>Description</th>
            <th>Credit</th>
            <th>Credit Control</th>
            <th>Creation Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="7" className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : providers.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-muted">
                No providers found
              </td>
            </tr>
          ) : (
            providers.map((provider) => (
              <tr key={provider.id}>
                <td>
                  <Form.Check 
                    type="checkbox"
                    checked={!!provider.selected}
                    onChange={(e) => handleSelectOne(provider.id, e.target.checked)}
                  />
                </td>
                <td className="fw-semibold">{provider.provider_name}</td>
                <td className="text-muted">{provider.description || '-'}</td>
                <td>{provider.credit}</td>
                <td>
                  <StatusBadge status={provider.credit_control} />
                </td>
                <td>{formatDate(provider.creationdate)}</td>
                <td>
                  <ActionButtons
                    onEdit={() => onEdit(provider)}
                    onDelete={() => onDelete(provider.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

// ------------------ AddProviderModal Component ------------------
const AddProviderModal = ({ show, onHide, onProviderAdded, providerToEdit, setProviderToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credit: '',
    credit_control: 'no',
    creationdate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (providerToEdit) {
      // Formater la date pour l'input de type date (format YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Erreur de formatage de date:', e);
          return '';
        }
      };

      setFormData({
        name: providerToEdit.provider_name,
        description: providerToEdit.description || '',
        credit: providerToEdit.credit,
        credit_control: providerToEdit.credit_control === 1 ? 'yes' : 'no',
        creationdate: formatDateForInput(providerToEdit.creationdate)
      });
    } else {
      setFormData({
        name: '',
        description: '',
        credit: '',
        credit_control: 'no',
        creationdate: new Date().toISOString().split('T')[0] // Date du jour par défaut
      });
    }
  }, [providerToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const url = providerToEdit 
        ? `/api/admin/Providers/modifier/${providerToEdit.id}` 
        : '/api/admin/Providers/ajouter';
      
      const method = providerToEdit ? 'put' : 'post';
      
      const response = await axios[method](url, {
        provider_name: formData.name,
        description: formData.description,
        credit: formData.credit,
        credit_control: formData.credit_control === 'yes' ? 1 : 0
      });

      if (response.data.success) {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        onProviderAdded();
        onHide();
      }
    } catch (error) {
      console.error("Error saving provider:", error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {providerToEdit ? 'Edit Provider' : 'Add a Provider'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Provider Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Credit</Form.Label>
            <Form.Control
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              required
              step="0.01"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Credit Control</Form.Label>
            <Form.Select
              name="credit_control"
              value={formData.credit_control}
              onChange={handleChange}
              required
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button 
              variant="secondary" 
              onClick={() => {
                onHide();
                setProviderToEdit(null);
              }} 
              className="me-2"
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : providerToEdit ? (
                'Update'
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// ------------------ BatchUpdateModal Component ------------------
const BatchUpdateModal = ({ show, onHide, onBatchUpdate, providers }) => {
  const [formData, setFormData] = useState({
    creationdate: '',
    description: '',
    credit: '',
    credit_control: 'no'
  });
  const [selectedProviderIds, setSelectedProviderIds] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get selected providers when modal is shown
  useEffect(() => {
    if (show) {
      const selected = providers.filter(p => p.selected).map(p => p.id);
      setSelectedProviderIds(selected);
      
      if (selected.length === 0) {
        setError('Please select at least one provider to update');
      } else {
        setError('');
      }
    }
  }, [show, providers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProviderIds.length === 0) {
      setError('Please select at least one provider to update');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Prepare the update data
      const updateData = {};
      
      // Only include fields that have values
      if (formData.creationdate) updateData.creationdate = formData.creationdate;
      if (formData.description !== undefined) updateData.description = formData.description;
      if (formData.credit !== '') updateData.credit = formData.credit;
      if (formData.credit_control) updateData.credit_control = formData.credit_control;
      
      // Add provider IDs
      updateData.providerIds = selectedProviderIds;

      console.log('Sending batch update request:', updateData);

      const response = await axios.put(
        '/api/admin/Providers/batchUpdate', 
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        let message = `Successfully updated ${response.data.updatedCount} providers`;
        
        // Add warning if name was skipped due to duplicates
        if (response.data.skippedNameUpdate) {
          message += `\nNote: Could not update provider name to '${formData.name}' as it's already in use.`;
        }
        
        alert(message);
        onBatchUpdate();
        onHide();
      } else {
        throw new Error(response.data?.error || 'Failed to update providers');
      }
    } catch (error) {
      console.error("Error batch updating providers:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Failed to update providers';
      let errorDetails = [];
      
      if (error.response?.data) {
        // Handle different types of error responses
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
          if (error.response.data.details) {
            errorDetails.push(error.response.data.details);
          }
          if (error.response.data.field) {
            errorDetails.push(`Field: ${error.response.data.field}`);
          }
          if (error.response.data.value) {
            errorDetails.push(`Value: ${error.response.data.value}`);
          }
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Combine main error with details if any
      if (errorDetails.length > 0) {
        errorMessage += '\n' + errorDetails.join('\n');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Batch Credit Update</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <BiXCircle className="me-2" />
            {error}
          </Alert>
        )}
        <Alert variant="info" className="d-flex align-items-center">
          This action will affect {providers.filter(p => p.selected).length} selected providers
        </Alert>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Text className="text-muted">
                Note: Provider name cannot be updated in batch mode to prevent duplicates.
              </Form.Text>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Creation Date</Form.Label>
                <Form.Control
                  type="date"
                  name="creationdate"
                  value={formData.creationdate}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">Leave empty to keep current dates</Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Credit</Form.Label>
                <Form.Control
                  type="text"
                  name="credit"
                  value={formData.credit}
                  onChange={handleChange}
                  placeholder="Enter credit amount"
                />
                <Form.Text className="text-muted">
                  Enter a number (e.g., 100 or 50.50)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Credit Control</Form.Label>
                <Form.Select
                  name="credit_control"
                  value={formData.credit_control}
                  onChange={handleChange}
                >
                  <option value="">Keep current settings</option>
                  <option value="yes">Activate credit control</option>
                  <option value="no">Deactivate credit control</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Leave empty to keep current descriptions"
              rows={3}
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button 
              variant="secondary" 
              onClick={onHide} 
              className="me-2"
            >
              Close
            </Button>
            <Button variant="warning" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update all Providers'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// ------------------ Main Providers Component ------------------
const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter(provider => 
        provider.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (provider.description && provider.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        provider.credit.toString().includes(searchTerm)
      );
      setFilteredProviders(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, providers]);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/Providers/afficher');
      setProviders(response.data.providers);
      setFilteredProviders(response.data.providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setError("Error fetching providers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      try {
        setIsLoading(true);
        await axios.delete(`/api/admin/Providers/supprimer/${id}`);
        setSuccessMessage('Provider deleted successfully');
        fetchProviders();
      } catch (error) {
        console.error("Error deleting provider:", error);
        setError("Error deleting provider");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (provider) => {
    setProviderToEdit(provider);
    setShowAddModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProviderSelection = (updatedProviders) => {
    setFilteredProviders(updatedProviders);
  };

  const pageCount = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="providers-page">
      <style>
        {`
          .pulse-effect {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
            100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
          }
          .floating-icon {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .search-bar {
            max-width: 300px;
            transition: all 0.3s;
          }
          .search-bar:focus-within {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          }
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} lg={11}>
          <Card style={{ border: 'none', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)' }}>
            <ProviderHeader
              onAddClick={() => {
                setProviderToEdit(null);
                setShowAddModal(true);
              }}
              providers={providers}
              isExporting={isExporting}
            />

            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                  <BiXCircle className="me-2" />
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                  <BiCheckCircle className="me-2" />
                  {successMessage}
                </Alert>
              )}

              <Row className="mb-4">
                <Col md={6} lg={4}>
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />
                </Col>
                <Col md={6} lg={8} className="d-flex justify-content-end">
                  <Button 
                    variant="warning" 
                    onClick={() => setShowBatchModal(true)}
                    className="d-flex align-items-center gap-2"
                  >
                    Update all providers
                  </Button>
                </Col>
              </Row>

              <ProviderTable
                providers={paginatedProviders}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
                onSelectionChange={handleProviderSelection}
              />

              {pageCount > 0 && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!isLoading && (
                      <>
                        <Badge bg="light" text="dark" className="me-2 shadow-sm">
                          <span className="fw-semibold">{paginatedProviders.length}</span> of {filteredProviders.length} Providers
                        </Badge>
                        {searchTerm && (
                          <Badge bg="light" text="dark" className="shadow-sm">
                            Filtered from {providers.length} total
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === pageCount}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddProviderModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onProviderAdded={fetchProviders}
        providerToEdit={providerToEdit}
        setProviderToEdit={setProviderToEdit}
      />

      <BatchUpdateModal
        show={showBatchModal}
        onHide={() => setShowBatchModal(false)}
        onBatchUpdate={() => {
          fetchProviders();
          // Clear selections after batch update
          setFilteredProviders(prev => 
            prev.map(p => ({ ...p, selected: false }))
          );
        }}
        providers={filteredProviders}
      />
    </div>
  );
};

export default Providers;