import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

// Styled Components

const TableContainer = styled.div`
  width: 100%;
  height: 70vh;
  margin: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-x: auto;
  overflow-y: auto;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  padding: 10px 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Table = styled.table`
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHeader = styled.th`
  background-color: #007bff;
  color: white;
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
  &:hover {
    background-color: #ddd;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

const Button = styled.button`
  padding: 10px 15px;
  margin: 0 5px;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 18px;
  color: #007bff;
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  font-weight: bold;
`;

// Component

const CDRTable = () => {
  const [cdrData, setCdrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Limité à 5 par page
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showExtraColumns, setShowExtraColumns] = useState(false);

  useEffect(() => {
    const fetchCDRData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/CDR/affiche");
        setCdrData(response.data.cdr);
      } catch (error) {
        setError("Error fetching data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCDRData();
  }, []);

  const filteredData = cdrData.filter((cdr) =>
    [cdr.callerid, cdr.calledstation, new Date(cdr.starttime).toLocaleString()]
      .some(field => field?.toString().toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/CDR/delete/${id}`);
        setCdrData(prevData => prevData.filter(cdr => cdr.id !== id));
      } catch (err) {
        setError("Error deleting the record. Please try again.");
      }
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  if (loading) return <LoadingSpinner>Loading...</LoadingSpinner>;

  return (
    <TableContainer>
      <Title>Call Detail Records (CDR)</Title>
      <SearchInput
        type="text"
        placeholder="🔍 Search Caller ID, Number or Date"
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button onClick={() => setShowExtraColumns(!showExtraColumns)}>
        {showExtraColumns ? "Hide Extra Columns" : "Show Extra Columns"}
      </Button>
      <Table>
        <thead>
          <tr>
            {["ID", "Caller ID", "Called Number", "Start Time", "Duration (sec)", "Cost (€)", "Sip User", "Destination", "Real Duration", "User", "Trunk", "Type", "Sell Price (€)", "Unique ID", "Plan", "Campaign", "Server", "Action"]
              .map((header, index) => (
                <TableHeader key={header} style={{ display: (index >= 12 && !showExtraColumns) ? "none" : "" }}>
                  {header}
                </TableHeader>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((cdr) => (
            <TableRow key={cdr.id}>
              {Object.values(cdr).map((value, index) => (
                <TableCell key={index} style={{ display: (index >= 12 && !showExtraColumns) ? "none" : "" }}>
                  {value}
                </TableCell>
              ))}
              <TableCell>
                <Button onClick={() => handleDelete(cdr.id)}>
                  {confirmDelete === cdr.id ? "Confirm?" : "Delete"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <PaginationContainer>
        <Button onClick={() => handlePageChange(page - 1)} disabled={page <= 0}>
          Prev
        </Button>
        <span>Page {page + 1} of {totalPages}</span>
        <Button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}>
          Next
        </Button>
      </PaginationContainer>
    </TableContainer>
  );
};

export default CDRTable;
