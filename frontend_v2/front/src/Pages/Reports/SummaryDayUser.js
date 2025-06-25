"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Button, Modal, Form, Dropdown, 
  Alert, Card, Container, Row, Col, 
  Badge, Spinner, InputGroup
} from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { CSVLink } from 'react-csv';
import { 
  FaCheckCircle, FaTimesCircle, FaEdit, 
  FaSearch, FaDownload, FaPlusCircle, 
  FaTrashAlt, FaCalendarAlt, FaChartBar,
  FaCog, FaFilter
} from 'react-icons/fa';
import { saveAs } from 'file-saver';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ITEMS_PER_PAGE = 10;

// Format functions moved to top level
const formatDurationMinutes = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
};

const formatDurationMinutesSeconds = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Helper Components
function SummaryHeader({ onExportClick, records, isExporting, onResetFilters }) {
  return (
    <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
      <div className="bg-primary p-3 w-100 position-relative">
        <div className="d-flex align-items-center position-relative z-2">
          <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
            <FaChartBar className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="fw-bold mb-0 text-white">Daily User Summary</h2>
            <p className="text-white-50 mb-0 d-none d-md-block">
              Summary of user activities by day
            </p>
          </div>
        </div>
      </div>
      <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-end align-items-center gap-2 border-bottom">
        <Button
          variant="outline-secondary"
          onClick={onResetFilters}
          className="d-flex align-items-center gap-2 fw-semibold me-2"
        >
          <span>Reset Filters</span>
        </Button>
        <Button
          variant="primary"
          onClick={onExportClick}
          className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
          disabled={isExporting}
        >
          <div className="icon-container">
            {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
          </div>
          <span>Export</span>
        </Button>
      </div>
    </Card.Header>
  );
}

function SearchBar({ 
  searchTerm, 
  onSearchChange, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  onFilterClick
}) {
  return (
    <div className="mb-3">
      <div className="d-flex flex-wrap gap-2 align-items-end">
        <div className="position-relative flex-grow-1">
          <Form.Control
            type="text"
            placeholder="Search by day or username..."
            value={searchTerm}
            onChange={onSearchChange}
            className="ps-5"
          />
          <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
        </div>
        
        <div className="d-flex flex-wrap gap-2">
          <div className="d-flex flex-column">
            <Form.Label className="small mb-1">From Date</Form.Label>
            <DatePicker
              selected={startDate}
              onChange={onStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="form-control"
              dateFormat="yyyy-MM-dd"
              placeholderText="Start date"
            />
          </div>
          
          <div className="d-flex flex-column">
            <Form.Label className="small mb-1">To Date</Form.Label>
            <DatePicker
              selected={endDate}
              onChange={onEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="form-control"
              dateFormat="yyyy-MM-dd"
              placeholderText="End date"
            />
          </div>
          
          <Button 
            variant="primary" 
            className="d-flex align-items-center gap-2"
            onClick={onFilterClick}
          >
            <FaFilter />
            <span>Filter</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryTable({ 
  records, 
  visibleColumns, 
  isLoading, 
  sortConfig, 
  onSort, 
  onSelectRow, 
  onSelectAll, 
  selectAll, 
  selectedRows, 
  currentPage,
  itemsPerPage = 10
}) {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="table-responsive">
      <Table className="elegant-table">
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="form-check-input"
              />
            </th>
            {visibleColumns.day && (
              <th 
                style={{ cursor: 'pointer' }} 
                onClick={() => onSort('day')}
                className="sortable-header"
              >
                Day {getSortIcon('day')}
              </th>
            )}
            {visibleColumns.username && <th>Username</th>}
            {visibleColumns.sessiontime && <th>Duration</th>}
            {visibleColumns.aloc_all_calls && <th>ALOC</th>}
            {visibleColumns.nbcall && <th>Answered Calls</th>}
            {visibleColumns.nbcall_fail && <th>Failed Calls</th>}
            {visibleColumns.buycost && <th>Buy Price</th>}
            {visibleColumns.sessionbill && <th>Sell Price</th>}
            {visibleColumns.lucro && <th>Margin</th>}
            {visibleColumns.asr && <th>Answer Rate</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="11" className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 mb-0">Loading records...</p>
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center py-5 text-muted">
                No records found
              </td>
            </tr>
          ) : (
            records.map((record, index) => {
              const absoluteIndex = (currentPage * itemsPerPage) + index;
              return (
                <tr key={`${record.day}-${record.username}`}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedRows.has(absoluteIndex)}
                      onChange={() => onSelectRow(absoluteIndex)}
                      className="form-check-input"
                    />
                  </td>
                  {visibleColumns.day && <td>{record.day}</td>}
                  {visibleColumns.username && <td>{record.username}</td>}
                  {visibleColumns.sessiontime && (
                    <td>{formatDurationMinutes(record.sessiontime)}</td>
                  )}
                  {visibleColumns.aloc_all_calls && (
                    <td>{formatDurationMinutesSeconds(record.aloc_all_calls)}</td>
                  )}
                  {visibleColumns.nbcall && <td>{record.nbcall}</td>}
                  {visibleColumns.nbcall_fail && <td>{record.nbcall_fail}</td>}
                  {visibleColumns.buycost && (
                    <td>{parseFloat(record.buycost).toFixed(2)}</td>
                  )}
                  {visibleColumns.sessionbill && (
                    <td>{parseFloat(record.sessionbill).toFixed(2)}</td>
                  )}
                  {visibleColumns.lucro && (
                    <td>{parseFloat(record.lucro).toFixed(2)}</td>
                  )}
                  {visibleColumns.asr && (
                    <td>{parseFloat(record.asr).toFixed(2)}%</td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}

function ColumnSelector({ visibleColumns, toggleColumn }) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2">
        <FaCog /> Columns
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-3">
        <div className="d-flex flex-column">
          {Object.keys(visibleColumns).map((column) => (
            <Form.Check
              key={column}
              type="switch"
              id={`toggle-${column}`}
              label={
          column === 'day' ? 'Day' :
          column === 'username' ? 'Username' :
          column === 'sessiontime' ? 'Duration' :
          column === 'aloc_all_calls' ? 'ALOC' :
          column === 'nbcall' ? 'Answered Calls' :
          column === 'nbcall_fail' ? 'Failed Calls' :
          column === 'buycost' ? 'Buy Price' :
          column === 'sessionbill' ? 'Sell Price' :
          column === 'lucro' ? 'Margin' :
          column === 'asr' ? 'ASR' : column
        }
              checked={visibleColumns[column]}
              onChange={() => toggleColumn(column)}
              className="mb-2"
            />
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function PaginationSection({ pageCount, onPageChange, currentPage }) {
  return (
    <ReactPaginate
      previousLabel={'Previous'}
      nextLabel={'Next'}
      breakLabel={'...'}
      breakClassName={'page-item'}
      breakLinkClassName={'page-link'}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      containerClassName={'pagination mb-0'}
      pageClassName={'page-item'}
      pageLinkClassName={'page-link'}
      previousClassName={'page-item'}
      previousLinkClassName={'page-link'}
      nextClassName={'page-item'}
      nextLinkClassName={'page-link'}
      activeClassName={'active'}
      forcePage={currentPage}
    />
  );
}

// Main Component
const SummaryDayUser = () => {
  // State for date range
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

    const [sortConfig, setSortConfig] = useState({
    key: 'day',
    direction: 'asc',
  });

    const [visibleColumns, setVisibleColumns] = useState({
    day: true,
    username: true,
    sessiontime: true,
    aloc_all_calls: true,
    nbcall: true,
    nbcall_fail: true,
    buycost: true,
    sessionbill: true,
    lucro: true,
    asr: true,
  });
  
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const sortRecords = (records, { key, direction }) => {
    const sorted = [...records].sort((a, b) => {
      if (key === 'day') {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return direction === 'asc' 
        ? (a[key] > b[key] ? 1 : -1)
        : (a[key] < b[key] ? 1 : -1);
    });
    return sorted;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    
    // Prepare query parameters
    const params = new URLSearchParams();
    if (isFilterApplied && startDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
    }
    if (isFilterApplied && endDate) {
      params.append('endDate', endDate.toISOString().split('T')[0]);
    }
    
    const url = `http://localhost:5000/api/admin/SummaryDayUser/affiche${params.toString() ? `?${params.toString()}` : ''}`;
    try {
      const response = await axios.get(url);
      const sortedRecords = sortRecords(response.data, sortConfig);
      setRecords(sortedRecords);
      setFilteredRecords(sortedRecords);
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [sortConfig]);

  useEffect(() => {
    let filtered = [...records];
    
    if (searchTerm !== '') {
      filtered = filtered.filter(record => 
        record.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const sorted = sortRecords(filtered, sortConfig);
    setFilteredRecords(sorted);
    setCurrentPage(0);
  }, [searchTerm, records, sortConfig]);

  const exportToCSV = () => {
    setIsExporting(true);
    
    // If no rows are selected, export all filtered records
    const recordsToExport = selectedRows.size > 0 
      ? filteredRecords.filter((_, index) => selectedRows.has(index))
      : filteredRecords;

    if (recordsToExport.length === 0) {
      setError("No rows selected for export");
      setTimeout(() => setError(null), 5000);
      setIsExporting(false);
      return;
    }

    // Prepare headers with proper CSV formatting
    const headers = [
      'Day',
      'Username',
      'Duration (min)',
      'Average Call Duration (min:sec)',
      'Answered Calls',
      'Failed Calls',
      'Buy Price (€)',
      'Sell Price (€)',
      'Margin (€)',
      'Answer Rate (%)'
    ];

    // Prepare CSV content with BOM for Excel
    let csvContent = '\uFEFF' + headers.join(',') + '\r\n';
    
    // Add data rows
    recordsToExport.forEach(record => {
      const row = [
        `"${record.day}"`,
        `"${record.username || ''}"`,
        formatDurationMinutes(record.sessiontime || 0),
        `"${formatDurationMinutesSeconds(record.aloc_all_calls || 0)}"`,
        record.nbcall || 0,
        record.nbcall_fail || 0,
        parseFloat(record.buycost || 0).toFixed(2),
        parseFloat(record.sessionbill || 0).toFixed(2),
        parseFloat(record.lucro || 0).toFixed(2),
        `${parseFloat(record.asr || 0).toFixed(2)}%`
      ];
      csvContent += row.join(',') + '\r\n';
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `daily_user_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
    setSuccess(`Successfully exported ${recordsToExport.length} records`);
    setTimeout(() => setSuccess(null), 5000);
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleRowSelection = (index) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.size === filteredRecords.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(Array.from({ length: filteredRecords.length }, (_, i) => i)));
    }
    setSelectAll(!selectAll);
  }; 
  
  // Reset selected rows when records change
  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [filteredRecords]);

  const handleFilterClick = () => {
    setIsFilterApplied(true);
    fetchRecords();
  };
  
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(new Date());
    setIsFilterApplied(false);
    fetchRecords();
  }; 
  
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };
  
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const pageCount = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const pagedRecords = filteredRecords.slice(offset, offset + ITEMS_PER_PAGE);

  return (
    <div className="dashboard-main" style={{ marginLeft: "80px" }}>
      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden main-card">
              <SummaryHeader 
                onExportClick={exportToCSV} 
                records={filteredRecords} 
                isExporting={isExporting}
                onResetFilters={handleResetFilters}
              />
              <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaTimesCircle className="me-2" />
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                    <FaCheckCircle className="me-2" />
                    {success}
                  </Alert>
                )}

                <Row className="mb-4">
                  <Col md={6}>
                    <SearchBar 
                      searchTerm={searchTerm} 
                      onSearchChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                      }} 
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                      onFilterClick={handleFilterClick}
                    />
                  </Col>
                  <Col md={6} className="d-flex justify-content-end">
                    <ColumnSelector 
                      visibleColumns={visibleColumns} 
                      toggleColumn={toggleColumnVisibility} 
                    />
                  </Col>
                </Row>

                <SummaryTable 
                  records={pagedRecords} 
                  visibleColumns={visibleColumns}
                  isLoading={isLoading}
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  onSelectRow={toggleRowSelection}
                  onSelectAll={toggleSelectAll}
                  selectAll={selectAll}
                  selectedRows={selectedRows}
                  currentPage={currentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    {!isLoading && (
                      <Badge bg="light" text="dark" className="shadow-sm">
                        Displaying {pagedRecords.length} of {filteredRecords.length} records
                      </Badge>
                    )}
                  </div>
                  {pageCount > 1 && (
                    <PaginationSection 
                      pageCount={pageCount} 
                      onPageChange={({ selected }) => setCurrentPage(selected)}
                      currentPage={currentPage}
                    />
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx global>{`
        .pulse-effect {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .elegant-table th, .elegant-table td {
          border-top: none;
          border-bottom: 1px solid #e9ecef;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .sortable-header:hover {
          background-color: #f8f9fa;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SummaryDayUser;