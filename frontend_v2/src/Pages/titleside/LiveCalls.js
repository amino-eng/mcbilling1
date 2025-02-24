import React from "react";


export default function LiveCalls() {
  const data = [
    { eya: "test", amine: "test", sofien: "test" },
    { eya: "test", amine: "test", sofien: "test" },
    { eya: "test", amine: "test", sofien: "test" },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>LiveCalls</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", border: "1px solid #ddd" }}>
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white" }}>
            <th style={tableHeaderStyle}>CallerID</th>
            <th style={tableHeaderStyle}>Usernames</th>
            <th style={tableHeaderStyle}>Name</th>
            <th style={tableHeaderStyle}>Descriptions</th>
            <th style={tableHeaderStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} style={index % 2 === 0 ? rowStyleEven : rowStyleOdd}>
              <td style={cellStyle}>{item.CallerID}</td>
              <td style={cellStyle}>{item.Username}</td>
              <td style={cellStyle}>{item.Name}</td>
              <td style={cellStyle}>{item.Description}</td>
              <td style={cellStyle}>{item.status}</td>
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
