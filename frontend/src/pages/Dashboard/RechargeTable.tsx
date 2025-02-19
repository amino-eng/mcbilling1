import { useState } from "react";
import "./RechargeTable.css";

interface Recharge {
  date: string;
  description: string;
  payment: string;
  montant: string;
}

const rechargeData: Recharge[] = [
  { date: "2024-05-08 12:12:01", description: "old 6, Ancien Solde : 6.99", payment: "Oui", montant: "10,00 €" },
  { date: "2024-05-08 11:07:07", description: "old 3, Ancien Solde : 2.99", payment: "Oui", montant: "4,00 €" },
  { date: "2024-05-08 11:04:00", description: "old 0, Ancien Solde : -0.01", payment: "Oui", montant: "3,00 €" },
];

const RechargeTable = () => {
  const [search, setSearch] = useState("");

  const filteredData = rechargeData.filter(
    (item) =>
      item.date.includes(search) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.payment.toLowerCase().includes(search.toLowerCase()) ||
      item.montant.includes(search)
  );

  return (
    <div className="recharge-container">
     <h2> </h2>
      <h2>Historique Des Recharges</h2>
      <button className="export-button">Export Historique</button>
      <div className="controls">
        <label>
          Show
          <select className="entries-select">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
            entries
        </label>
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="recharge-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Payment</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.description}</td>
              <td className="payment-oui">{item.payment}</td>
              <td className="montant">{item.montant}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className="pagination-button">Previous</button>
        <span className="current-page">1</span>
        <button className="pagination-button">Next</button>
      </div>
    </div>
  );
};

export default RechargeTable;
