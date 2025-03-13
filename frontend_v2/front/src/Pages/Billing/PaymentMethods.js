import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PaymentMethods() {
  const [data, setData] = useState([]);

  const fetchData = () => {
    axios
      .get("http://localhost:5000/api/admin/PayMeth/afficher")
      .then((res) => setData(res.data.payment_methods))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Liste des méthodes de paiement</h2>
        
      </div>

      {/* Tableau */}
      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Utilisateur</th>
            <th>Pays</th>
            <th>Méthode de paiement</th>
            <th>Actif</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((e, i) => (
              <tr key={i}>
                <td>{e.username}</td>
                <td>{e.country}</td>
                <td>{e.payment_method}</td>
                <td>{e.active ? "Oui" : "Non"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">Aucun enregistrement trouvé</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modale avec backdrop Bootstrap (sans CSS personnalisé) */}
      <div
        className="modal fade"
        id="newPaymentModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="newPaymentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="newPaymentModalLabel">
                Ajouter une méthode de paiement
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Nom d'utilisateur</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pays</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Méthode de paiement</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Actif</label>
                  <select className="form-select">
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Annuler
              </button>
              <button type="button" className="btn btn-primary">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
