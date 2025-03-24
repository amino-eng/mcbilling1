import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const RecordTable = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // État pour gérer la visibilité des colonnes
  const [visibleColumns, setVisibleColumns] = useState({
    day: true,
    username: true,
    sessiontime: true,
    aloc_all_calls: true,
    nbcall: true,
    nbcall_fail: true,
    buycost: true,
    sessionbill: true,
    lucro: true,
    asr: true,
  });

  // Fonction pour formater la durée en minutes uniquement
  const formatDurationMinutes = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  // Fonction pour formater la durée en minutes et secondes
  const formatDurationMinutesSeconds = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Récupérer tous les enregistrements
  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/SummaryDayUser/affiche');
      setRecords(response.data);
      setFilteredRecords(response.data); // Initialiser les données filtrées
    } catch (err) {
      setError("Erreur lors de la récupération des données");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filtrer les enregistrements en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredRecords(records);
      setCurrentPage(1);
    } else {
      const filtered = records.filter(record => 
        record.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, records]);

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Exportation en CSV
  const exportToCSV = () => {
    const csvData = filteredRecords.map(record => (
      `${record.day},${record.username},${record.nbcall},${record.nbcall_fail},${record.buycost},${record.sessionbill},${record.lucro},${record.agent_bill},${record.asr}`
    )).join('\n');

    const csvHeader = "Day,Username,Duration,ALOC all calls,Answered,Failed,Buy Price,Sell Price,Markup,ASR";
    const csvFile = csvHeader + '\n' + csvData;
    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'records.csv');
  };

  // Gérer la visibilité des colonnes
  const toggleColumnVisibility = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  return (
    <div className="container mt-4">
      <h1>Tableau des Enregistrements</h1>
      {error && <p className="text-danger">{error}</p>}

      {/* Barre de recherche */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par jour ou nom d'utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bouton pour masquer/afficher les colonnes */}
      <div className="mb-3 d-flex justify-content-between">
        <div>
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Colonnes
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {Object.keys(visibleColumns).map((column) => (
              <li key={column}>
                <label className="dropdown-item">
                  <input
                    type="checkbox"
                    checked={visibleColumns[column]}
                    onChange={() => toggleColumnVisibility(column)}
                  />
                  {column}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-primary" onClick={exportToCSV}>Exporter en CSV</button>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="thead-light">
          <tr>
            {visibleColumns.day && <th>Day</th>}
            {visibleColumns.username && <th>Username</th>}
            {visibleColumns.sessiontime && <th>Duration</th>}
            {visibleColumns.aloc_all_calls && <th>ALOC all calls</th>}
            {visibleColumns.nbcall && <th>Answered</th>}
            {visibleColumns.nbcall_fail && <th>Failed</th>}
            {visibleColumns.buycost && <th>Buy Price</th>}
            {visibleColumns.sessionbill && <th>Sell Price</th>}
            {visibleColumns.lucro && <th>Markup</th>}
            {visibleColumns.asr && <th>ASR</th>}
          </tr>
        </thead>
        <tbody>
          {currentRecords.length > 0 ? (
            currentRecords.map((record) => (
              <tr key={record.id}>
                {visibleColumns.day && <td>{record.day}</td>}
                {visibleColumns.username && <td>{record.username}</td>}
                {visibleColumns.sessiontime && <td>{formatDurationMinutes(record.sessiontime)}</td>}
                {visibleColumns.aloc_all_calls && <td>{formatDurationMinutesSeconds(record.aloc_all_calls)}</td>}
                {visibleColumns.nbcall && <td>{record.nbcall}</td>}
                {visibleColumns.nbcall_fail && <td>{record.nbcall_fail}</td>}
                {visibleColumns.buycost && <td>{parseFloat(record.buycost).toFixed(2)} €</td>}
                {visibleColumns.sessionbill && <td>{parseFloat(record.sessionbill).toFixed(2)} €</td>}
                {visibleColumns.lucro && <td>{parseFloat(record.lucro).toFixed(2)} €</td>}
                {visibleColumns.asr && <td>{parseFloat(record.asr).toFixed(2)}%</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center">
                Aucun enregistrement trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {filteredRecords.length > recordsPerPage && (
        <nav>
          <ul className="pagination">
            {Array.from({ length: Math.ceil(filteredRecords.length / recordsPerPage) }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button onClick={() => paginate(i + 1)} className="page-link">
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Affichage du nombre de résultats */}
      <div className="mt-2">
        {filteredRecords.length} résultat(s) trouvé(s)
      </div>
    </div>
  );
};

export default RecordTable;