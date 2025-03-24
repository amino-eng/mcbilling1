import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Table, Button, Spinner, Dropdown, Form, Pagination } from "react-bootstrap";

const CDRTable = () => {
  const [cdrData, setCdrData] = useState([]);
  const [users, setUsers] = useState({});
  const [trunks, setTrunks] = useState({});
  const [pkgTrunks, setPkgTrunks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    Date: true,
    SipUser: true,
    CallerID: true,
    Number: true,
    Destination: true,
    Duration: true,
    RealDuration: false,
    Username: true,
    Trunk: true,
    Type: true,
    BuyPrice: true,
    SellPrice: true,
    UniqueID: false,
    Plan: false,
    Campaign: false,
    Server: false,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

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

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // Filter records based on search term
  const filteredRecords = cdrData.filter(cdr =>
    cdr.callerid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    const rows = filteredRecords
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

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-center">Call Detail Records (CDR)</h2>
      <div className="d-flex mb-3">
        <input
          type="text"
          placeholder="Search by Caller ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control me-2"
        />
        <Dropdown ref={dropdownRef} className="me-2">
          <Dropdown.Toggle variant="primary" id="dropdown-basic">
            Columns
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {Object.keys(visibleColumns).map((column) => (
              <Dropdown.Item key={column}>
                <Form.Check
                  type="checkbox"
                  label={column}
                  checked={visibleColumns[column]}
                  onChange={() => toggleColumnVisibility(column)}
                />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Button variant="primary" onClick={exportToCSV}>Export CSV</Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            {visibleColumns.Date && <th>Date</th>}
            {visibleColumns.SipUser && <th>Sip User</th>}
            {visibleColumns.CallerID && <th>Caller ID</th>}
            {visibleColumns.Number && <th>Number</th>}
            {visibleColumns.Destination && <th>Destination</th>}
            {visibleColumns.Duration && <th>Duration</th>}
            {visibleColumns.RealDuration && <th>Real Duration</th>}
            {visibleColumns.Username && <th>Username</th>}
            {visibleColumns.Trunk && <th>Trunk</th>}
            {visibleColumns.Type && <th>Type</th>}
            {visibleColumns.BuyPrice && <th>Buy Price</th>}
            {visibleColumns.SellPrice && <th>Sell Price</th>}
            {visibleColumns.UniqueID && <th>Unique ID</th>}
            {visibleColumns.Plan && <th>Plan</th>}
            {visibleColumns.Campaign && <th>Campaign</th>}
            {visibleColumns.Server && <th>Server</th>}
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((cdr) => (
            <tr key={cdr.id}>
              {visibleColumns.Date && <td>{new Date(cdr.starttime).toLocaleString()}</td>}
              {visibleColumns.SipUser && <td>{cdr.src}</td>}
              {visibleColumns.CallerID && <td>{cdr.callerid}</td>}
              {visibleColumns.Number && <td>{cdr.calledstation}</td>}
              {visibleColumns.Destination && <td>{cdr.id_prefix}</td>}
              {visibleColumns.Duration && <td>{cdr.sessiontime} seconds</td>}
              {visibleColumns.RealDuration && <td>{cdr.real_sessiontime} seconds</td>}
              {visibleColumns.Username && <td>{cdr.username}</td>}
              {visibleColumns.Trunk && <td>{cdr.trunkcode}</td>}
              {visibleColumns.Type && <td>{cdr.type}</td>}
              {visibleColumns.BuyPrice && <td>{cdr.buycost} €</td>}
              {visibleColumns.SellPrice && <td>{cdr.sessionbill} €</td>}
              {visibleColumns.UniqueID && <td>{cdr.uniqueid}</td>}
              {visibleColumns.Plan && <td>{cdr.id_plan}</td>}
              {visibleColumns.Campaign && <td>{cdr.id_campaign || "vide"}</td>}
              {visibleColumns.Server && <td>{cdr.server_name}</td>}
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination>
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))}
          disabled={currentPage === 1}
        />
        {Array.from({ length: Math.ceil(filteredRecords.length / recordsPerPage) }, (_, i) => (
          <Pagination.Item
            key={i + 1}
            active={i + 1 === currentPage}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() =>
            setCurrentPage((prev) =>
              prev < Math.ceil(filteredRecords.length / recordsPerPage) ? prev + 1 : prev
            )
          }
          disabled={currentPage === Math.ceil(filteredRecords.length / recordsPerPage)}
        />
      </Pagination>
    </div>
  );
};

export default CDRTable;