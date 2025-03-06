import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver'; // Pour l'exportation en CSV

const RecordTable = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

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
    const minutes = Math.floor(seconds / 60); // Convertir les secondes en minutes
    return `${minutes}m`; // Retourner uniquement les minutes
  };

  // Fonction pour formater la durée en minutes et secondes
  const formatDurationMinutesSeconds = (seconds) => {
    const minutes = Math.floor(seconds / 60); // Convertir les secondes en minutes
    const remainingSeconds = seconds % 60; // Secondes restantes
    return `${minutes}m ${remainingSeconds}s`; // Retourner en format Xm Ys
  };

  // Récupérer tous les enregistrements
  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/SummaryDayUser/affiche'); // Assurez-vous que cette URL correspond à votre backend
      setRecords(response.data);
      console.log(records);
    } catch (err) {
      setError("Erreur lors de la récupération des données");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Exportation en CSV
  const exportToCSV = () => {
    const csvData = records.map(record => (
      `${record.day},${record.username},${record.nbcall},${record.nbcall_fail},${record.buycost},${record.sessionbill},${record.lucro},${record.agent_bill},${record.asr}`
    )).join('\n');

    const csvHeader = "Day,Username,Duration,ALOC all calls,Answered,Failed,Buy Price,Sell Price,Markup,ASR";
    const csvFile = csvHeader + csvData;
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

      {/* Bouton pour masquer/afficher les colonnes */}
      <div className="mb-3">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
           colonnes
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

      <button className="btn btn-primary mb-3" onClick={exportToCSV}>Exporter en CSV</button>
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
          {currentRecords.map((record) => (
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
          ))}
        </tbody>
      </table>
      <nav>
        <ul className="pagination">
          {Array.from({ length: Math.ceil(records.length / recordsPerPage) }, (_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <button onClick={() => paginate(i + 1)} className="page-link">
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default RecordTable;