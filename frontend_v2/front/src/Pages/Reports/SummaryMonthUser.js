import React, { useEffect, useState } from "react";
import axios from "axios";

const SummaryMonthUserTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/SummaryMonthUser")
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching data.");
        setLoading(false);
      });
  }, []);

  // Render loading or error states
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Function to round values to two decimal places
  const roundToTwoDecimalPlaces = (value) => {
    if (value || value === 0) {
      return Number(value).toFixed(2); // Round to 2 decimal places
    }
    return value; // Return original value if it’s null or undefined
  };

  // Function to format session time (assuming it is in seconds)
  const formatSessionTime = (seconds) => {
    if (seconds || seconds === 0) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    }
    return "-"; // Return "-" if session time is not available
  };

  // Function to export data to CSV
  const exportToCSV = () => {
    const headers = [
      "Month",
      "Session Time",
      "Total Calls",
      "Failed Calls",
      "Buy Cost (€)",
      "Session Bill",
      "Profit (Lucro)",
      "ASR (%)",
    ];
    const rows = data.map((item) => [
      `${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}`,
      formatSessionTime(item.sessiontime),  // Format session time here
      item.nbcall.toFixed(2),
      item.nbcall_fail.toFixed(2),
      `${item.buycost.toFixed(2)} €`,
      item.sessionbill.toFixed(2),
      item.lucro.toFixed(2),
      `${item.asr.toFixed(2)} %`,
    ]);
    const csvData =
      [headers.join(",")].concat(rows.map((row) => row.join(","))).join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "summary_per_month.csv";
    link.click();
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center text-dark">Summary of Monthly User Data</h2>

      {/* Export CSV Button */}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary px-4 py-2"
          onClick={exportToCSV}  // Trigger the CSV export function on click
        >
          <i className="bi bi-file-earmark-spreadsheet me-2"></i> Export CSV
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover table-light">
          <thead className="table-light">
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Username</th>
              <th scope="col">Duration (Session Time)</th>
              <th scope="col">Allocated All Calls</th>
              <th scope="col">Answered Calls</th>
              <th scope="col">Buy Price (€)</th>
              <th scope="col">Sell Price (€)</th>
              <th scope="col">Markup</th>
              <th scope="col">ASR (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.month.slice(0, 7)}</td> {/* Format month as YYYY-MM */}
                <td>{item.username}</td>
                <td>{formatSessionTime(item.sessiontime)}</td> {/* Format session time */}
                <td>{roundToTwoDecimalPlaces(item.aloc_all_calls)}</td> {/* Round allocated calls */}
                <td>{item.nbcall}</td> {/* Answered Calls */}
                <td>{roundToTwoDecimalPlaces(item.buycost)}€</td> {/* Round buy price */}
                <td>{roundToTwoDecimalPlaces(item.sessionbill)}€</td> {/* Round sell price */}
                <td>{roundToTwoDecimalPlaces(item.lucro)}</td> {/* Round markup */}
                <td>{roundToTwoDecimalPlaces(item.asr)}%</td> {/* Round ASR */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryMonthUserTable;
