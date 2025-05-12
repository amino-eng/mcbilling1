import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Table, Button, Spinner, Dropdown, Form, Pagination, 
  Card, Container, Row, Col, Badge, Alert
} from "react-bootstrap";
import {
  FaDownload,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaFileExport
} from "react-icons/fa";

const CDRTable = () => {
  const [cdrData, setCdrData] = useState([]);
  const [users, setUsers] = useState({});
  const [trunks, setTrunks] = useState({});
  const [pkgTrunks, setPkgTrunks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
      .filter(key => visibleColumns[key])
      .join(",") + "\n";

    const csvContent = currentRecords
      .map(cdr => {
        return [
          visibleColumns.Date ? new Date(cdr.starttime).toLocaleString() : null,
          visibleColumns.SipUser ? cdr.src : null,
          visibleColumns.CallerID ? cdr.callerid : null,
          visibleColumns.Number ? cdr.calledstation : null,
          visibleColumns.Destination ? cdr.id_prefix : null,
          visibleColumns.Duration ? cdr.sessiontime + " seconds" : null,
          visibleColumns.RealDuration ? cdr.real_sessiontime + " seconds" : null,
          visibleColumns.Username ? cdr.username : null,
          visibleColumns.Trunk ? cdr.trunkcode : null,
          visibleColumns.Type ? cdr.type : null,
          visibleColumns.BuyPrice ? cdr.buycost + " €" : null,
          visibleColumns.SellPrice ? cdr.sessionbill + " €" : null,
          visibleColumns.UniqueID ? cdr.uniqueid : null,
          visibleColumns.Plan ? cdr.id_plan : null,
          visibleColumns.Campaign ? cdr.id_campaign || "vide" : null,
          visibleColumns.Server ? cdr.server_name : null
        ].filter(Boolean).join(",");
      })
      .join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cdr_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={12}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <FaFilter className="me-2" />
                  CDR Report
                </h4>
                <div className="d-flex gap-2">
                  <Button 
                    variant="light" 
                    className="d-flex align-items-center"
                    onClick={exportToCSV}
                  >
                    <FaFileExport className="me-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body>
              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <FaTimesCircle className="me-2" />
                  {error}
                </Alert>
              )}

              <div className="d-flex mb-3 gap-2">
                <div className="position-relative flex-grow-1">
                  <Form.Control
                    type="text"
                    placeholder="Search by Caller ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-4"
                  />
                  <FaSearch 
                    className="position-absolute text-muted"
                    style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
                
                <Dropdown ref={dropdownRef}>
                  <Dropdown.Toggle variant="secondary" className="d-flex align-items-center">
                    <FaEye className="me-2" />
                    Columns
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="p-2">
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {Object.keys(visibleColumns).map((column) => (
                        <Form.Check
                          key={column}
                          type="checkbox"
                          label={column}
                          checked={visibleColumns[column]}
                          onChange={() => toggleColumnVisibility(column)}
                          className="px-3 py-1"
                        />
                      ))}
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading CDR data...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="bg-light">
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
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records
                </div>
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
                      )}
                    disabled={currentPage === Math.ceil(filteredRecords.length / recordsPerPage)}
                  />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CDRTable;