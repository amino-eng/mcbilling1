import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './RestricNumber.css';

function RestricNumber() {
  const [phoneData, setPhoneData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restrictionType, setRestrictionType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userRestrict, setUserRestrict] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isEditing, setIsEditing] = useState(false);
  const [currentRestrictionId, setCurrentRestrictionId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/agent/affiche');
      setPhoneData(response.data.restrictions);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Erreur lors de la récupération des restrictions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/agent/afficheuserRestrict');
      if (Array.isArray(response.data.users)) {
        setUserRestrict(response.data.users);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setError('Erreur lors de la récupération des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const handleAddRestriction = async () => {
    if (!phoneNumber || !restrictionType || !selectedUser) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const now = new Date();
    const formattedDate = formatDateTime(now); 

    const data = {
      number: phoneNumber,
      direction: restrictionType,
      id_user: selectedUser,
      date: formattedDate
    };

    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/agent/edit/${currentRestrictionId}`, data);
        toast.success('Restriction modifiée avec succès !');
      } else {
        await axios.post('http://localhost:5000/api/admin/agent/add', data);
        toast.success('Restriction ajoutée avec succès !');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la restriction:", error);
      toast.error(isEditing ? "Erreur lors de la modification de la restriction." : "Erreur lors de l'ajout de la restriction.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRestriction = (restriction) => {
    setPhoneNumber(restriction.number);
    setRestrictionType(restriction.direction);
    setSelectedUser(restriction.id_user);
    setCurrentRestrictionId(restriction.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteRestriction = async (restrictionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette restriction ?')) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/agent/delete/${restrictionId}`);
      toast.success('Restriction supprimée avec succès !');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setRestrictionType('');
    setSelectedUser('');
    setShowForm(false);
    setError('');
    setIsEditing(false);
    setCurrentRestrictionId(null);
  };

  const filteredPhoneData = useMemo(() => {
    return phoneData.filter((item) =>
      (item.agent?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      item.number.includes(searchTerm)
    );
  }, [phoneData, searchTerm]);

  const sortedPhoneData = useMemo(() => {
    return [...filteredPhoneData].sort((a, b) => {
      return sortDirection === 'asc'
        ? a.agent?.username?.localeCompare(b.agent?.username || '')
        : b.agent?.username?.localeCompare(a.agent?.username || '');
    });
  }, [filteredPhoneData, sortDirection]);

  const totalPages = Math.max(Math.ceil(sortedPhoneData.length / itemsPerPage), 1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPhoneData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container mt-4">
      <ToastContainer />

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom d'utilisateur ou numéro"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Ajouter une restriction'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="loading-spinner">Chargement...</div>}

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                Nom d'utilisateur {sortDirection === 'asc' ? '↑' : '↓'}
              </th>
              <th>Numéro</th>
              <th>Direction</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((e, i) => (
                <tr key={i}>
                  <td>{e.agent?.username}</td>
                  <td>{e.number}</td>
                  <td>{e.direction === 2 ? 'Entrant' : 'Sortant'}</td>
                  <td>{formatDateTime(e.date)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRestriction(e.id)}>
                      Supprimer
                    </button>
                    <button className="btn btn-warning btn-sm ms-1" onClick={() => handleEditRestriction(e)}>
                      Modifier
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">Aucune restriction trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </button>
        <span>Page {currentPage} sur {totalPages}</span>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Suivant
        </button>
      </div>

      {showForm && (
        <div className="mt-3">
          <select
            className="form-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Sélectionner un utilisateur</option>
            {userRestrict.map((e, i) => (
              <option key={i} value={e.id}>{e.username}</option>
            ))}
          </select>

          <input
            type="text"
            className="form-control mt-2"
            placeholder="Numéro"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
          />

          <select
            className="form-select mt-2"
            value={restrictionType}
            onChange={(e) => setRestrictionType(e.target.value)}
          >
            <option value="">Type de restriction</option>
            <option value="2">Entrant</option>
            <option value="1">Sortant</option>
          </select>

          <input
            type="text"
            className="form-control mt-2"
            value={formatDateTime(new Date())}
            readOnly
          />

          <button className="btn btn-success mt-2" onClick={handleAddRestriction} disabled={loading}>
            {isEditing ? 'Modifier' : 'Confirmer'}
          </button>
        </div>
      )}
    </div>
  );
}

export default RestricNumber;