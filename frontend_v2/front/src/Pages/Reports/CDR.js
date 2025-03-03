import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styled from "styled-components";

// Styled Components
const TableContainer = styled.div`
  width: 100%;
  margin: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
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

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  z-index: 1000;
  margin-top: 5px;
`;

const DropdownLabel = styled.label`
  display: block;
  margin: 5px 0;
`;

// Component
const CDRTable = () => {
  const [cdrData, setCdrData] = useState([]);
  const [users, setUsers] = useState({});
  const [trunks, setTrunks] = useState({});
  const [pkgTrunks, setPkgTrunks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    Date: true,
    SipUser: true,
    CallerID: true,
    Number: true,
    Destination: true,
    Duration: true,
    RealDuration: true,
    Username: true,
    Trunk: true,
    Type: true,
    BuyPrice: true,
    SellPrice: true,
    UniqueID: true,
    Plan: true,
    Campaign: true,
    Server: true,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/users");
        const userMap = response.data.reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {});
        setUsers(userMap);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchTrunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/trunks");
        const trunkMap = response.data.reduce((acc, trunk) => {
          acc[trunk.id] = trunk.name;
          return acc;
        }, {});
        setTrunks(trunkMap);
      } catch (error) {
        console.error("Error fetching trunk data:", error);
      }
    };

    const fetchPkgTrunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/pkg_trunks");
        const pkgTrunkMap = response.data.reduce((acc, pkgTrunk) => {
          acc[pkgTrunk.id] = pkgTrunk.trunkcode;
          return acc;
        }, {});
        setPkgTrunks(pkgTrunkMap);
      } catch (error) {
        console.error("Error fetching pkg_trunk data:", error);
      }
    };

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

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Export to CSV
  const exportToCSV = () => {
    const headers = Object.keys(visibleColumns)
      .filter((column) => visibleColumns[column])
      .join(",");

    const rows = filteredData
      .map((cdr) =>
        Object.keys(visibleColumns)
          .filter((column) => visibleColumns[column])
          .map((column) => {
            switch (column) {
              case "Date":
                return `"${new Date(cdr.starttime).toLocaleString()}"`;
              case "SipUser":
                return `"${cdr.src}"`;
              case "CallerID":
                return `"${cdr.callerid}"`;
              case "Number":
                return `"${cdr.calledstation}"`;
              case "Destination":
                return `"${cdr.id_prefix}"`;
              case "Duration":
                return `"${cdr.sessiontime} seconds"`;
              case "RealDuration":
                return `"${cdr.real_sessiontime} seconds"`;
              case "Username":
                return `"${cdr.username}"`;
              case "Trunk":
                return `"${cdr.trunkcode}"`;
              case "Type":
                return `"${cdr.type}"`;
              case "BuyPrice":
                return `"${cdr.buycost} €"`;
              case "SellPrice":
                return `"${cdr.sessionbill} €"`;
              case "UniqueID":
                return `"${cdr.uniqueid}"`;
              case "Plan":
                return `"${cdr.id_plan}"`;
              case "Campaign":
                return `"${cdr.id_campaign || "vide"}"`;
              case "Server":
                return `"${cdr.server_name}"`;
              default:
                return "";
            }
          })
          .join(",")
      )
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "CDR_Export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <DropdownContainer ref={dropdownRef}>
          <Button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Columns</Button>
          {isDropdownOpen && (
            <DropdownContent>
              {Object.keys(visibleColumns).map((column) => (
                <DropdownLabel key={column}>
                  <input
                    type="checkbox"
                    checked={visibleColumns[column]}
                    onChange={() => toggleColumnVisibility(column)}
                  />
                  {column}
                </DropdownLabel>
              ))}
            </DropdownContent>
          )}
        </DropdownContainer>
        <Button onClick={exportToCSV}>Export CSV</Button>
      </div>
      <Table>
        <thead>
          <tr>
            {visibleColumns.Date && <TableHeader>Date</TableHeader>}
            {visibleColumns.SipUser && <TableHeader>Sip User</TableHeader>}
            {visibleColumns.CallerID && <TableHeader>Caller ID</TableHeader>}
            {visibleColumns.Number && <TableHeader>Number</TableHeader>}
            {visibleColumns.Destination && <TableHeader>Destination</TableHeader>}
            {visibleColumns.Duration && <TableHeader>Duration</TableHeader>}
            {visibleColumns.RealDuration && <TableHeader>Real Duration</TableHeader>}
            {visibleColumns.Username && <TableHeader>Username</TableHeader>}
            {visibleColumns.Trunk && <TableHeader>Trunk</TableHeader>}
            {visibleColumns.Type && <TableHeader>Type</TableHeader>}
            {visibleColumns.BuyPrice && <TableHeader>Buy Price</TableHeader>}
            {visibleColumns.SellPrice && <TableHeader>Sell Price</TableHeader>}
            {visibleColumns.UniqueID && <TableHeader>Unique ID</TableHeader>}
            {visibleColumns.Plan && <TableHeader>Plan</TableHeader>}
            {visibleColumns.Campaign && <TableHeader>Campaign</TableHeader>}
            {visibleColumns.Server && <TableHeader>Server</TableHeader>}
          </tr>
        </thead>
        <tbody>
          {filteredData
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((cdr) => (
              <TableRow key={cdr.id}>
                {visibleColumns.Date && <TableCell>{new Date(cdr.starttime).toLocaleString()}</TableCell>}
                {visibleColumns.SipUser && <TableCell>{cdr.src}</TableCell>}
                {visibleColumns.CallerID && <TableCell>{cdr.callerid}</TableCell>}
                {visibleColumns.Number && <TableCell>{cdr.calledstation}</TableCell>}
                {visibleColumns.Destination && <TableCell>{cdr.id_prefix}</TableCell>}
                {visibleColumns.Duration && <TableCell>{cdr.sessiontime} seconds</TableCell>}
                {visibleColumns.RealDuration && <TableCell>{cdr.real_sessiontime} seconds</TableCell>}
                {visibleColumns.Username && <TableCell>{cdr.username}</TableCell>}
                {visibleColumns.Trunk && <TableCell>{cdr.trunkcode}</TableCell>}
                {visibleColumns.Type && <TableCell>{cdr.type}</TableCell>}
                {visibleColumns.BuyPrice && <TableCell>{cdr.buycost} €</TableCell>}
                {visibleColumns.SellPrice && <TableCell>{cdr.sessionbill} €</TableCell>}
                {visibleColumns.UniqueID && <TableCell>{cdr.uniqueid}</TableCell>}
                {visibleColumns.Plan && <TableCell>{cdr.id_plan}</TableCell>}
                {visibleColumns.Campaign && <TableCell>{cdr.id_campaign || "vide"}</TableCell>}
                {visibleColumns.Server && <TableCell>{cdr.server_name}</TableCell>}
                
              </TableRow>
            ))}
        </tbody>
      </Table>
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