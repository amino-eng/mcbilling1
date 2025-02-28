import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CdrFailedTable() {
  const [cdrFailedData, setCdrFailedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Columns mapping
  const allColumns = [
    { label: "Date", key: "starttime" },
    { label: "SIP User", key: "src" },
    { label: "Number", key: "calledstation" },
    { label: "Username", key: "username" },
    { label: "Trunk", key: "trunkcode" },
    { label: "SIP Code", key: "hangupcause" },
    { label: "Server", key: "server" },
  ];

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.reduce((acc, col) => {
      acc[col.key] = true; // Toutes les colonnes sont visibles par défaut
      return acc;
    }, {})
  );

  useEffect(() => {
    fetchCdrFailedData();
  }, []);

  const fetchCdrFailedData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/CdrFailed/affiche"
      );
      const data = response.data.cdr_failed;
      setCdrFailedData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Unable to retrieve data.");
      toast.error("Error fetching data!");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    const csvRows = [];

    // Ajouter les en-têtes au CSV
    const headers = allColumns
      .filter((col) => visibleColumns[col.key])
      .map((col) => col.label)
      .join(",");
    csvRows.push(headers);

    // Ajouter les données au CSV
    cdrFailedData.forEach((row) => {
      const values = allColumns
        .filter((col) => visibleColumns[col.key])
        .map((col) => `"${row[col.key] || ""}"`);
      csvRows.push(values.join(","));
    });

    // Créer un fichier CSV
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cdr_failed_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/CdrFailed/${confirmDeleteId}`);
      toast.success("Record deleted successfully!");
      setCdrFailedData(cdrFailedData.filter((cdr) => cdr.id !== confirmDeleteId));
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record.");
    } finally {
      setShowModal(false);
    }
  };

  // Composant Dropdown pour la visibilité des colonnes
  const ColumnVisibilityDropdown = ({ visibleColumns, setVisibleColumns, allColumns }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleColumnVisibility = (key) => {
      setVisibleColumns((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    return (
      <div className="dropdown" style={{ display: "inline-block", marginLeft: "10px" }}>
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Columns
        </button>
        {isDropdownOpen && (
          <div
            className="dropdown-menu show"
            style={{ display: "block", padding: "10px" }}
          >
            {allColumns.map((col) => (
              <div key={col.key} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={visibleColumns[col.key]}
                  onChange={() => toggleColumnVisibility(col.key)}
                />
                <label className="form-check-label">{col.label}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {/* Bouton pour exporter en CSV et menu déroulant des colonnes */}
          <div className="mb-3 text-end">
            <button className="btn btn-success me-2" onClick={exportToCSV}>
              Export to CSV
            </button>
            <ColumnVisibilityDropdown
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
              allColumns={allColumns}
            />
          </div>

          {/* Tableau des données */}
          <div className="table-responsive">
            <table className="table table-bordered table-striped shadow-sm text-center">
              <thead className="bg-dark text-white">
                <tr>
                  {allColumns
                    .filter((col) => visibleColumns[col.key]) // Filtrer les colonnes visibles
                    .map((col, index) => (
                      <th key={index} className="p-3">
                        {col.label}
                      </th>
                    ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cdrFailedData.length > 0 ? (
                  cdrFailedData.map((cdr, index) => (
                    <tr key={index}>
                      {allColumns
                        .filter((col) => visibleColumns[col.key]) // Filtrer les colonnes visibles
                        .map((col, idx) => (
                          <td key={idx} className="p-2">
                            {cdr[col.key] || <span className="text-muted">—</span>}
                          </td>
                        ))}
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setConfirmDeleteId(cdr.id);
                            setShowModal(true);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={allColumns.filter((col) => visibleColumns[col.key]).length + 1} className="text-muted">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal de confirmation pour la suppression */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation of Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this record? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CdrFailedTable;