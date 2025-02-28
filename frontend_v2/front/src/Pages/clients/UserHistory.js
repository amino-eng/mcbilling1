import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const UserHistoryTable = () => {
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/UserHistory/affiche");
      setUserHistory(response.data.user_history);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setError("Erreur lors de la récupération des données.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHistory();
  }, []);

  const exportCSV = () => {
    const csvData = [
      ["Utilisateur", "Description", "Date"],
      ...userHistory.map((history) => [history.username, history.description, new Date(history.date).toLocaleString()]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_history.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return <div className="text-center mt-5">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Historique des Utilisateurs</h2>
      <button className="btn btn-success mb-3" onClick={exportCSV}>Exporter en CSV</button>
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Utilisateur</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {userHistory.length > 0 ? (
            userHistory.map((history) => (
              <tr key={history.id}>
                <td>{history.username}</td>
                <td>{history.description}</td>
                <td>{new Date(history.date).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">Aucun historique trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserHistoryTable;
