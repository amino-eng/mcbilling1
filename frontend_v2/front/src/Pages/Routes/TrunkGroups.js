import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, InputGroup, FormControl, Spinner, Alert } from 'react-bootstrap';
import { BiSearch, BiEdit, BiTrash, BiExport, BiPlus } from 'react-icons/bi';

const TrunkGroups = () => {
  const [trunkGroups, setTrunkGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [trunks, setTrunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trunks: []
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
    fetchTrunks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGroups(trunkGroups);
    } else {
      const filtered = trunkGroups.filter(group => 
        (group.trunk_group && group.trunk_group.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, trunkGroups]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/TrunkGroup/afficher');
      setTrunkGroups(res.data.trunk_groups);
      setFilteredGroups(res.data.trunk_groups);
      setError("");
    } catch (err) {
      console.error("Error fetching trunk groups:", err);
      setError("Failed to fetch trunk groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrunks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/Trunks/afficher');
      setTrunks(res.data.trunks || res.data); // selon la structure de l'API
    } catch (err) {
      console.error("Error fetching trunks:", err);
    }
  };

  const handleAddNew = () => {
    setSelectedGroup(null);
    setFormData({
      name: "",
      description: "",
      trunks: []
    });
    setShowModal(true);
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setFormData({
      trunk_group: group.trunk_group,
      description: group.description || "",
      trunks: group.trunks?.map(tr => tr.id) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trunk group?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/admin/TrunkGroup/supprimer/${id}`);
        setSuccess("Trunk group deleted successfully");
        fetchData();
      } catch (err) {
        console.error("Error deleting trunk group:", err);
        setError("Failed to delete trunk group. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrunkSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      trunks: selectedOptions
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(selectedGroup);
    try {
      setLoading(true);
      
      if (selectedGroup) {
      
        
        await axios.put(`http://localhost:5000/api/admin/TrunkGroup/modifier/${selectedGroup.id}`, formData);
        setSuccess("Trunk group updated successfully");
      } else {
        await axios.post('http://localhost:5000/api/admin/TrunkGroup/ajouter', formData);
        setSuccess("Trunk group added successfully");
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Error with trunk group:", err);
      setError(`Failed to ${selectedGroup ? 'update' : 'add'} trunk group. Please try again.`);
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Trunk Group', 'Description'];
    const csvContent = [
      headers.join(','),
      ...trunkGroups.map(group => 
        [
          group.id, 
          `"${group.trunk_group?.replace(/"/g, '""') || ''}"`, 
          `"${group.description?.replace(/"/g, '""') || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'trunk_groups.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAlerts = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Trunk Groups</h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleAddNew}>
            <BiPlus className="me-1" /> Add New
          </Button>
          <Button variant="success" onClick={handleExportCSV}>
            <BiExport className="me-1" /> Export CSV
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <BiSearch />
          </InputGroup.Text>
          <FormControl
            placeholder="Search trunk groups..."
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

      {loading && !filteredGroups.length ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.description || '-'}</td>
                  <td>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(group)}
                    >
                      <BiEdit /> Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(group.id)}
                    >
                      <BiTrash /> Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-3">
                  {searchQuery ? 'No matching trunk groups found' : 'No trunk groups found'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          resetAlerts();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedGroup ? 'Edit Trunk Group' : 'Add New Trunk Group'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Trunk Group Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
  <Form.Label>
    Type <span title="Select the trunk group type">❓</span>
  </Form.Label>
  <Form.Select
    name="description"
    value={formData.description}
    onChange={handleInputChange}
    required
  >
    <option value="">-- Select Type --</option>
    <option value="Order">Order</option>
    <option value="random">random</option>
    <option value="LCR">LCR</option>
    {/* Ajoute d'autres types si nécessaire */}
  </Form.Select>
</Form.Group>


            <Form.Group className="mb-3">
              <Form.Label>Select one or more trunks</Form.Label>
              <Form.Select multiple value={formData.trunks} onChange={handleTrunkSelection}>
                {trunks.map(trunk => (
                  <option key={trunk.id} value={trunk.id}>
                    {trunk.name} ({trunk.provider_name})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)} 
                className="me-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    {selectedGroup ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  selectedGroup ? 'Update' : 'Save'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TrunkGroups;
