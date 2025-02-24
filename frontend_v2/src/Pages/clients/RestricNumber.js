import React from 'react';

export default function RestricNumber() {
  const data = [
    { eya: "test", amine: "test", sofien: "test" },
    { eya: "test", amine: "test", sofien: "test" },
    { eya: "test", amine: "test", sofien: "test" },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Restrict Numbers</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", border: "1px solid #ddd" }}>
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white" }}>
            <th style={tableHeaderStyle}>eya</th>
            <th style={tableHeaderStyle}>amine</th>
            <th style={tableHeaderStyle}>sofien</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} style={index % 2 === 0 ? rowStyleEven : rowStyleOdd}>
              <td style={cellStyle}>{item.eya}</td>
              <td style={cellStyle}>{item.amine}</td>
              <td style={cellStyle}>{item.sofien}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ✅ Styles pour le tableau
const tableHeaderStyle = {
  padding: "10px",
  textAlign: "left",
  border: "1px solid #ddd",
};

const cellStyle = {
  padding: "10px",
  border: "1px solid #ddd",
};

const rowStyleEven = {
  backgroundColor: "#f9f9f9",
};

const rowStyleOdd = {
  backgroundColor: "#ffffff",
};
