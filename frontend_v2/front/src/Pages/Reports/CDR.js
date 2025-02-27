import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";


// Styled Components (unchanged)
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
  const [users, setUsers] = useState({}); // Mapping of user IDs to usernames
  const [trunks, setTrunks] = useState({}); // Mapping of trunk IDs to trunk names
  const [pkgTrunks, setPkgTrunks] = useState({}); // Mapping of trunk IDs to trunkcodes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch CDR data
  useEffect(() => {
    const fetchCDRData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/CDR/affiche");
        setCdrData(response.data.cdr || []);
      } catch (error) {
        setError("Error fetching CDR data. Please try again.");
      }
    };

    // Fetch user data
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/users");
        const userMap = response.data.reduce((acc, user) => {
          acc[user.id] = user.username; // Map user ID to username
          return acc;
        }, {});
        setUsers(userMap);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Fetch trunk data
    const fetchTrunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/trunks");
        const trunkMap = response.data.reduce((acc, trunk) => {
          acc[trunk.id] = trunk.name; // Map trunk ID to name
          return acc;
        }, {});
        setTrunks(trunkMap);
      } catch (error) {
        console.error("Error fetching trunk data:", error);
      }
    };

    // Fetch pkg_trunk data
    const fetchPkgTrunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/pkg_trunks");
        const pkgTrunkMap = response.data.reduce((acc, pkgTrunk) => {
          acc[pkgTrunk.id] = pkgTrunk.trunkcode; // Map trunk ID to trunkcode
          return acc;
        }, {});
        setPkgTrunks(pkgTrunkMap);
      } catch (error) {
        console.error("Error fetching pkg_trunk data:", error);
      }
    };

    // Execute all API calls
    Promise.all([fetchCDRData(), fetchUsers(), fetchTrunks(), fetchPkgTrunks()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Filter data based on search query
  const filteredData = cdrData.filter((cdr) =>
    [
      cdr.callerid,
      cdr.calledstation,
      new Date(cdr.starttime).toLocaleString(),
      cdr.uniqueid,
      cdr.id_prefix,
      cdr.id_campaign,
    ].some((field) =>
      field?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/CDR/delete/${id}`);
        setCdrData((prevData) => prevData.filter((cdr) => cdr.id !== id));
      } catch (err) {
        setError("Error deleting the record. Please try again.");
      }
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  if (loading) return <LoadingSpinner>Loading...</LoadingSpinner>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <TableContainer>
      <Title>Call Detail Records (CDR)</Title>
      <SearchInput
        type="text"
        placeholder="🔍 Search Caller ID, Number, or Date"
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table>
        <thead>
          <tr>
            <TableHeader>Date</TableHeader>
            <TableHeader>Sip User</TableHeader>
            <TableHeader>Caller ID</TableHeader>
            <TableHeader>Number</TableHeader>
            <TableHeader>Destination</TableHeader>
            <TableHeader>Duration</TableHeader>
            <TableHeader>Real Duration</TableHeader>
            <TableHeader>Username</TableHeader>
            <TableHeader>Trunk</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Buy Price</TableHeader>
            <TableHeader>Sell Price</TableHeader>
            <TableHeader>Unique ID</TableHeader>
            <TableHeader>Plan</TableHeader>
            <TableHeader>Campaign</TableHeader>
            <TableHeader>Server</TableHeader>
            <TableHeader>Action</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredData
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((cdr) => (
              <TableRow key={cdr.id}>
                <TableCell>{new Date(cdr.starttime).toLocaleString()}</TableCell>
                <TableCell>{users[cdr.id_user] || ""}</TableCell> {/* Username */}
                <TableCell>{cdr.callerid}</TableCell>
                <TableCell>{cdr.calledstation}</TableCell>
                <TableCell>{cdr.id_prefix}</TableCell>
                <TableCell>{cdr.sessiontime} seconds</TableCell>
                <TableCell>{cdr.real_sessiontime} seconds</TableCell>
                <TableCell>{cdr.id_user || "test"}</TableCell>
                <TableCell>{pkgTrunks[cdr.id_trunk] || cdr.id_trunk}</TableCell> {/* Trunkcode */}
                <TableCell>{trunks[cdr.type] || ""}</TableCell> 
                <TableCell>{cdr.buycost} €</TableCell>
                <TableCell>{cdr.sessionbill} €</TableCell>
                <TableCell>{cdr.uniqueid}</TableCell>
                <TableCell>{cdr.id_plan}</TableCell>
                <TableCell>{cdr.id_campaign || "N/A"}</TableCell>
                <TableCell>{cdr.id_server}</TableCell>
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
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Next
        </Button>
      </PaginationContainer>
    </TableContainer>
  );
};

export default CDRTable;