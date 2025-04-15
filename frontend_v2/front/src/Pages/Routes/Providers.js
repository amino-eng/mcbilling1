import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';

const ProviderTable = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
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

  // Fetch providers from backend
  useEffect(() => {
    fetchProviders();
  }, []);

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
    } catch (error) {
      console.error("Error fetching providers:", error);
      setError('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
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
      await axios.post('http://localhost:5000/api/admin/providers/ajouter', formData);
      setSuccess('Provider added successfully');
      setShowModal(false);
      fetchProviders();
      setFormData({
        name: '',
        description: '',
        credit: '',
        creation_date: '',
        credit_control: 'no'
      });
    } catch (error) {
      console.error("Error adding provider:", error);
      setError('Failed to add provider');
    }
  };

    const handleBatchUpdate = async (e) => {
      e.preventDefault();
      
      try {
        // Prepare the data to send
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
        
        // Reset form
        setBatchData({
          credit_amount: '',
          credit_percentage: '',
          credit_control: '',
          description: '',
          selectedProviders: providers.map(p => p.id) // Keep all selected
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
          <Button variant="primary" onClick={() => setShowModal(true)} className="me-2">
            Add New
          </Button>
          <Button variant="warning" onClick={() => setShowBatchModal(true)}>
            Batch Update
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

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
            </tr>
          </thead>
          <tbody>
            {providers.length > 0 ? (
              providers.map(provider => (
                <tr key={provider.id}>
                  <td>{provider.provider_name}</td>
                  <td>{provider.description || 'vide'}</td>
                  <td>{provider.credit}</td>
                  <td>{formatDate(provider.creationdate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-3">No providers found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Add New Provider Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetAlerts(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Provider</Modal.Title>
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
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
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