import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Table, Container, Alert, Button, Form, Dropdown, InputGroup, FormControl, Card, Badge, Spinner, Row, Col, Modal } from 'react-bootstrap';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaPhoneAlt,
  FaGlobe,
  FaEdit
} from 'react-icons/fa';
import ReactPaginate from 'react-paginate';

// Constants
const ITEMS_PER_PAGE = 5;

const App = () => {
  const [dids, setDids] = useState([]);
  const [filteredDids, setFilteredDids] = useState([]);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [user, setUser] = useState([]);
  const [sip, setSip] = useState([]);
  const [filteredSipUsers, setFilteredSipUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [didsList, setDidsList] = useState([]);
  const apiUrl = 'http://localhost:5000/api/admin/DIDDestination/affiche';

  const [newDidData, setNewDidData] = useState({
    did: '',
    username: '',
    status: 'Active',
    priority: 1,
    destinationType: 1,
    sipUser: '',
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingDid, setEditingDid] = useState(null);

  const fetchSipUsersByUserId = (userId) => {
    if (!userId) {
      setFilteredSipUsers([]);
      return;
    }
    
    axios.get(`http://localhost:5000/api/admin/DIDDestination/getSipUsersByUserId/${userId}`)
      .then((response) => {
        setFilteredSipUsers(response.data.sipUsers || []);
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des utilisateurs SIP:', err);
        setFilteredSipUsers([]);
      });
  };

  const renderSipUserSelect = () => (
    <Form.Group className="mb-3" controlId="formSipUser">
      <Form.Label>Utilisateur SIP</Form.Label>
      <Form.Control
        as="select"
        name="sipUser"
        value={newDidData.sipUser}
        onChange={handleInputChange}
        className="shadow-sm"
        disabled={!newDidData.username}
      >
        <option value="">
          {newDidData.username 
            ? 'Sélectionner un utilisateur SIP' 
            : 'Veuillez d\'abord sélectionner un utilisateur'}
        </option>
        {filteredSipUsers.map((sipUser) => (
          <option key={sipUser.id} value={sipUser.name}>
            {sipUser.name} {sipUser.callerid ? `(${sipUser.callerid})` : ''}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const updatedData = {
      ...newDidData,
      [name]: value
    };
    
    // Si l'utilisateur change, on met à jour la liste des SIP users
    if (name === 'username') {
      // Trouver l'ID utilisateur à partir du nom d'utilisateur
      const selectedUser = user.find(u => u.username === value);
      if (selectedUser) {
        fetchSipUsersByUserId(selectedUser.id);
      } else {
        setFilteredSipUsers([]);
      }
      // Réinitialiser le SIP user sélectionné
      updatedData.sipUser = '';
      updatedData.destination = '';
    }
    
    // Si un SIP user est sélectionné, on met à jour la destination
    if (name === 'sipUser') {
      updatedData.destination = value;
    }
    
    setNewDidData(updatedData);
  };

  // ... [le reste du code reste inchangé]

  return (
    // ... [le début du JSX reste inchangé]
    // Remplacer l'ancien sélecteur par :
    {renderSipUserSelect()}
    // ... [le reste du JSX reste inchangé]
  );
};

export default App;
