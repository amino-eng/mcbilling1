import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Table, Button, Modal, 
  Card, Badge, Spinner,
  Alert, Container, Row, Col 
} from "react-bootstrap";
import { 
  FaDownload, FaSearch, 
  FaTrashAlt, FaExclamationTriangle,
  FaCheckCircle, FaColumns
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, subDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale';

const DEFAULT_NEW_CDR = {
  starttime: "",
  src: "",
  calledstation: "",
  callerid: "",
  terminatecauseid: "",
  username: "",
  trunkcode: "",
  hangupcause: "",
  server: ""
};

function CDRHeader({ onExportClick, cdrCount, isExporting, startDate, endDate, onDateChange, onResetDates }) {
  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
          {Array(5).fill().map((_, i) => (
            <div 
              key={i}
              className="floating-icon position-absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <FaExclamationTriangle className="text-white opacity-25" />
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaExclamationTriangle className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Failed CDRs</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">Review failed call detail records</p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
          <span className="me-2 fw-normal">
            Total: <span className="fw-bold">{cdrCount}</span>
          </span>
        </Badge>
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center me-2">
            <span className="me-2">De:</span>
            <DatePicker
              selected={startDate}
              onChange={(date) => onDateChange('startDate', date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="form-control form-control-sm"
              locale={fr}
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="d-flex align-items-center me-2">
            <span className="me-2">À:</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => onDateChange('endDate', date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="form-control form-control-sm"
              locale={fr}
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <Button
            variant="outline-secondary"
            onClick={onResetDates}
            className="me-2"
            size="sm"
          >
            Réinitialiser
          </Button>
          <Button
            variant="primary"
            onClick={onExportClick}
            className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            disabled={isExporting}
          >
            {isExporting ? <Spinner size="sm" /> : <FaDownload />}
            <span>Export</span>
          </Button>
        </div>
      </div>
    </Card.Header>
  );
}

function CdrFailedTable() {
  const [cdrFailedData, setCdrFailedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'starttime', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [isFiltered, setIsFiltered] = useState(false);

  // Process, filter, and sort data - memoized for performance
  const displayedData = React.useMemo(() => {
    // Filter data based on search term
    let result = [...cdrFailedData];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((cdr) => (
        cdr.starttime?.toLowerCase().includes(searchLower) ||
        cdr.src?.toLowerCase().includes(searchLower) ||
        cdr.calledstation?.toLowerCase().includes(searchLower) ||
        cdr.callerid?.toLowerCase().includes(searchLower) ||
        cdr.terminatecauseid?.toString().toLowerCase().includes(searchLower) ||
        cdr.username?.toLowerCase().includes(searchLower) ||
        cdr.trunkcode?.toLowerCase().includes(searchLower) ||
        cdr.hangupcause?.toLowerCase().includes(searchLower) ||
        cdr.server?.toLowerCase().includes(searchLower)
      ));
    }
    
    // Sort the filtered data
    return [...result].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const comparison = String(aValue).localeCompare(String(bValue), undefined, {numeric: true});
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [cdrFailedData, searchTerm, sortConfig]);

  const allColumns = [
    { label: "Date", key: "starttime" },
    { label: "SIP User", key: "src" },
    { label: "Number", key: "calledstation" },
    { label: "Destination", key: "callerid" }, 
    { label: "Status", key: "terminatecauseid"},
    { label: "Username", key: "username" },
    { label: "Trunk", key: "trunkcode" },
    { label: "SIP Code", key: "hangupcause" },
    { label: "Server", key: "server" },
  ];

  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.reduce((acc, col) => {
      acc[col.key] = true;
      return acc;
    }, {})
  );

  useEffect(() => {
    fetchCdrFailedData();
  }, []);

  const fetchCdrFailedData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (isFiltered) {
        params.startDate = format(dateRange.startDate, 'yyyy-MM-dd');
        params.endDate = format(dateRange.endDate, 'yyyy-MM-dd');
      }
      
      const response = await axios.get("/api/admin/CDRFailed/affiche", { params });
      if (response.data.success) {
        setCdrFailedData(response.data.cdr_failed);
      } else {
        setError("Échec du chargement des CDR échoués");
      }
    } catch (err) {
      console.error("Error fetching CDR failed data:", err);
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (type, date) => {
    const newDateRange = { ...dateRange, [type]: date };
    setDateRange(newDateRange);
    
    // If both dates are set, we consider it a filter
    if (newDateRange.startDate && newDateRange.endDate) {
      setIsFiltered(true);
    }
  };
  
  const handleResetDates = () => {
    setDateRange({
      startDate: subDays(new Date(), 30),
      endDate: new Date()
    });
    setIsFiltered(false);
  };

  useEffect(() => {
    fetchCdrFailedData();
  }, [isFiltered, dateRange]);

  const toggleRowSelection = (id) => {
    const newSelectedRows = new Set(selectedRows);
    if (selectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);    
    if (selectAll && newSelectedRows.size < cdrFailedData.length) {
      setSelectAll(false);
    } else if (!selectAll && newSelectedRows.size === cdrFailedData.length) {
      setSelectAll(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(cdrFailedData.map(row => row.id));
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll);
  };

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['Selected', ...allColumns]
      .filter((col, index) => index === 0 || (col.key && visibleColumns[col.key]))
      .map(col => col === 'Selected' ? 'Selected' : col.label)
      .join(",");
    csvRows.push(headers);

    const rowsToExport = selectedRows.size > 0 
      ? displayedData.filter(row => selectedRows.has(row.id))
      : displayedData;

    rowsToExport.forEach((row) => {
      const isSelected = selectedRows.has(row.id) ? 'Oui' : 'Non';
      const rowValues = [isSelected, ...allColumns
        .filter(col => visibleColumns[col.key])
        .map(col => `"${String(row[col.key] || '').replace(/"/g, '""')}"`)];
      csvRows.push(rowValues.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `failed_cdr_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/CdrFailed/delete/${confirmDeleteId}`);
      toast.success("Record deleted successfully!");
      // Refresh the data from the server instead of just filtering
      await fetchCdrFailedData();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error(error.response?.data?.error || "Failed to delete record.");
    } finally {
      setShowModal(false);
    }
  };

  const ColumnVisibilityDropdown = ({ visibleColumns, setVisibleColumns, allColumns }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleColumnVisibility = (key) => {
      setVisibleColumns((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    return (
      <div className="dropdown" style={{ display: "inline-block", marginLeft: "10px" }}>
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Columns
        </button>
        {isDropdownOpen && (
          <div
            className="dropdown-menu show"
            style={{ display: "block", padding: "10px" }}
          >
            {allColumns.map((col) => (
              <div key={col.key} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={visibleColumns[col.key]}
                  onChange={() => toggleColumnVisibility(col.key)}
                />
                <label className="form-check-label">{col.label}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Fonction de tri
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Using memoized filteredData and displayedData for rendering

  return (
    <div className="dashboard-main" style={{ marginLeft: "80px" }}>
      <style>
        {`
          .floating-icon {
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          .pulse-effect {
            animation: pulse 2s infinite;
          }
          .btn-hover-effect:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .elegant-table th {
            background-color: #f8f9fa;
            position: sticky;
            top: 0;
          }
        `}
      </style>

      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
              <CDRHeader 
                onExportClick={exportToCSV} 
                cdrCount={displayedData.length}
                isExporting={false}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateChange={handleDateChange}
                onResetDates={handleResetDates}
              />
              <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaExclamationTriangle className="me-2" />
                    {error}
                  </Alert>
                )}

                <Row className="mb-4">
                  <Col md={6} lg={4}>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaSearch className="text-muted" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search CDRs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="ms-auto text-end">
                    <ColumnVisibilityDropdown
                      visibleColumns={visibleColumns}
                      setVisibleColumns={setVisibleColumns}
                      allColumns={allColumns}
                    />
                  </Col>
                </Row>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading CDR data...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="elegant-table">
                      <thead>
                        <tr>
                          <th>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectAll}
                                onChange={toggleSelectAll}
                              />
                            </div>
                          </th>
                          {allColumns
                            .filter((col) => visibleColumns[col.key])
                            .map((column, index) => (
                              <th 
                                key={index} 
                                style={{ cursor: 'pointer' }}
                                onClick={() => requestSort(column.key)}
                                className={sortConfig.key === column.key ? `sort-${sortConfig.direction}` : ''}
                              >
                                <div className="d-flex align-items-center justify-content-between">
                                  {column.label}
                                  {sortConfig.key === column.key && (
                                    <span className="ms-1">
                                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                  )}
                                </div>
                              </th>
                            ))}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedData.length > 0 ? (
                          displayedData.map((cdr, index) => (
                            <tr key={index} className="hover-effect">
                              <td>
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedRows.has(cdr.id)}
                                    onChange={() => toggleRowSelection(cdr.id)}
                                  />
                                </div>
                              </td>
                              {allColumns
                                .filter((col) => visibleColumns[col.key])
                                .map((col, idx) => (
                                  <td key={idx} className="p-2">
                                    {col.key === "starttime"
                                      ? format(new Date(cdr[col.key]), "dd/MM/yyyy HH:mm:ss")
                                      : cdr[col.key] || <span className="text-muted">—</span>}
                                  </td>
                                ))}
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => {
                                    setConfirmDeleteId(cdr.id);
                                    setShowModal(true);
                                  }}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={allColumns.length + 2} className="text-center py-5 text-muted">
                              <FaExclamationTriangle className="mb-2" />
                              <p>Aucun CDR en échec trouvé</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this failed CDR?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Delete Record
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default CdrFailedTable;