import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { BiSearch, BiEdit, BiTrash } from 'react-icons/bi';

const ProviderTable = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credit: '',
    creation_date: '',
    credit_control: 'no'
  });
  const [batchData, setBatchData] = useState({
    credit_amount: '',
    credit_percentage: '',
    credit_control: '',
    description: '',
    selectedProviders: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch providers from backend
  useEffect(() => {
    fetchProviders();
  }, []);

  // Filter providers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter(provider => 
        provider.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.description && provider.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        provider.credit.toString().includes(searchQuery)
      );
      setFilteredProviders(filtered);
    }
  }, [searchQuery, providers]);

  // Update selected providers when providers list changes
  useEffect(() => {
    if (providers.length > 0) {
      setBatchData(prev => ({
        ...prev,
        selectedProviders: providers.map(provider => provider.id)
      }));
    }
  }, [providers]);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/providers/afficher');
      setProviders(response.data.providers);
      setFilteredProviders(response.data.providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setError('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (providerId) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      try {
        setLoading(true);
        // Use the correct route path for deletion
        await axios.delete(`http://localhost:5000/api/admin/providers/supprimer/${providerId}`);
        setSuccess('Provider deleted successfully');
        fetchProviders();
      } catch (error) {
        console.error("Error deleting provider:", error);
        setError('Failed to delete provider: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (provider) => {
    setCurrentProvider(provider);
    setFormData({
      name: provider.provider_name,
      description: provider.description || '',
      credit: provider.credit,
      credit_control: provider.credit_control === 1 ? 'yes' : 'no'
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleBatchInputChange = (e) => {
    const { name, value } = e.target;
    setBatchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update existing provider
        const updateData = {
          providerIds: [currentProvider.id],
          name: formData.name,
          description: formData.description,
          credit: formData.credit,
          credit_control: formData.credit_control
        };
        
        await axios.put('http://localhost:5000/api/admin/providers/batchUpdate', updateData);
        setSuccess('Provider updated successfully');
      } else {
        // Add new provider
        await axios.post('http://localhost:5000/api/admin/providers/ajouter', formData);
        setSuccess('Provider added successfully');
      }
      
      setShowModal(false);
      fetchProviders();
      resetForm();
    } catch (error) {
      console.error("Error with provider:", error);
      setError(`Failed to ${isEditing ? 'update' : 'add'} provider`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      credit: '',
      creation_date: '',
      credit_control: 'no'
    });
    setCurrentProvider(null);
    setIsEditing(false);
  };

  const handleBatchUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        providerIds: batchData.selectedProviders,
        description: batchData.description,
        credit: batchData.credit_amount,
        credit_control: batchData.credit_control
      };
  
      const response = await axios.put(
        'http://localhost:5000/api/admin/providers/batchUpdate',
        updateData
      );
      
      setSuccess(response.data.message);
      setShowBatchModal(false);
      fetchProviders();
      
      setBatchData({
        credit_amount: '',
        credit_percentage: '',
        credit_control: '',
        description: '',
        selectedProviders: providers.map(p => p.id)
      });
      
    } catch (error) {
      console.error("Update error:", error.response?.data || error);
      setError(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to update providers'
      );
    }
  };

  const resetAlerts = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Providers Management</h4>
        <div>
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }} 
            className="me-2"
          >
            Add New
          </Button>
          <Button variant="warning" onClick={() => setShowBatchModal(true)}>
            Batch Update
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Search Bar */}
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <BiSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search providers by name, description or credit..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          )}
        </InputGroup>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Credit</th>
              <th>Creation Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.length > 0 ? (
              filteredProviders.map(provider => (
                <tr key={provider.id}>
                  <td>{provider.provider_name}</td>
                  <td>{provider.description || 'vide'}</td>
                  <td>{provider.credit}</td>
                  <td>{formatDate(provider.creationdate)}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(provider)}
                    >
                      <BiEdit /> Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(provider.id)}
                    >
                      <BiTrash /> Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  {searchQuery ? 'No matching providers found' : 'No providers found'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Provider Modal */}
      <Modal 
        show={showModal} 
        onHide={() => { 
          setShowModal(false); 
          resetAlerts(); 
          resetForm();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Provider' : 'Add New Provider'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Credit</Form.Label>
              <Form.Control
                type="number"
                name="credit"
                value={formData.credit}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Credit Control</Form.Label>
              <Form.Select
                name="credit_control"
                value={formData.credit_control}
                onChange={handleInputChange}
                required
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} 
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Batch Update Modal */}
      <Modal show={showBatchModal} onHide={() => { setShowBatchModal(false); resetAlerts(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Batch Update All Providers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBatchUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Providers Selection</Form.Label>
              <Alert variant="info">
                All {providers.length} providers will be updated
              </Alert>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Credit</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="number"
                  name="credit_amount"
                  value={batchData.credit_amount}
                  onChange={handleBatchInputChange}
                  placeholder="0,0000"
                  required
                  style={{ width: '100px' }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Credit control</Form.Label>
              <Form.Select
                name="credit_control"
                value={batchData.credit_control}
                onChange={handleBatchInputChange}
                required
              >
                <option value="">Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={batchData.description}
                onChange={handleBatchInputChange}
                rows={3}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowBatchModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="warning" type="submit">
                Update All Providers
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProviderTable;