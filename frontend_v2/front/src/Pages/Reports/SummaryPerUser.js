import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  Spinner, 
  Container, 
  Button, 
  Form, 
  Badge, 
  Card, 
  Alert, 
  Row, 
  Col, 
  FormCheck 
} from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { FaDownload, FaSearch, FaUser, FaClock, FaPhone, FaEuroSign, FaPercentage, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const SummaryPerUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const itemsPerPage = 10;

  // Fetch data from the API on component mount
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/SummaryPerUser')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching data');
        }
        return response.json();
      })
      .then((data) => {
        setData(data.data);
        setLoading(false);
        setSuccessMessage('Data loaded successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const formatSessionTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const roundToTwoDecimal = (num) => {
    return num ? num.toFixed(2) : '0.00';
  };

  const filteredData = data.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const paginatedData = filteredData.slice(offset, offset + itemsPerPage);

  const exportToCSV = useCallback(() => {
    const dataToExport = Object.keys(selectedRows).length > 0 
      ? filteredData.filter((_, index) => selectedRows[index])
      : filteredData;
      
    if (dataToExport.length === 0) {
      alert('Please select at least one row to export');
      return;
    }

    // Prepare headers with descriptions
    const headers = [
      'Username',
      'Duration (HH:MM:SS)',
      'Allocated Calls (min:sec)',
      'Answered Calls',
      'Failed Calls',
      'Buy Price (€)',
      'Sell Price (€)',
      'Margin (€)',
      'Answer Rate (%)'
    ];

    // Format the data with proper escaping for CSV
    const csvContent = [
      headers.join(','), // Header row
      ...dataToExport.map(user => [
        `"${(user.username || '').replace(/"/g, '""')}"`,
        `"${formatSessionTime(user.sessiontime || 0)}"`,
        `"${formatSessionTime(user.aloc_all_calls || 0)}"`,
        user.nbcall || 0,
        user.nbcall_fail || 0,
        roundToTwoDecimal(user.buycost || 0),
        roundToTwoDecimal(user.sessionbill || 0),
        roundToTwoDecimal(user.lucro || 0),
        roundToTwoDecimal(user.asr || 0)
      ].join(','))
    ].join('\r\n');
    
    // Create and trigger download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setSuccessMessage(`Exported ${dataToExport.length} records successfully`);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, [selectedRows, filteredData]);

  const handleRowSelect = (index) => {
    setSelectedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSelectAll = (e) => {
    const isSelected = e.target.checked;
    setSelectAll(isSelected);
    
    if (isSelected) {
      const allSelected = {};
      paginatedData.forEach((_, index) => {
        allSelected[offset + index] = true;
      });
      setSelectedRows(allSelected);
    } else {
      setSelectedRows({});
    }
  };

  // Reset select all when data changes
  useEffect(() => {
    setSelectAll(false);
  }, [filteredData, currentPage]);



  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="d-flex align-items-center">
          <FaTimesCircle className="me-2" />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={11}>
          <Card className="shadow border-0 overflow-hidden">
            <Card.Header className="bg-primary p-4 position-relative rounded-top">
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
                    <FaUser className="text-white opacity-25" />
                  </div>
                ))}
              </div>
              <div className="d-flex align-items-center position-relative z-2">
                <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
                  <FaUser className="text-primary fs-3" />
                </div>
                <div>
                  <h2 className="fw-bold mb-0 text-white">Call Summary by User</h2>
                  <p className="text-white-50 mb-0 d-none d-md-block">Detailed call statistics by user</p>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              {successMessage && (
                <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                  <FaCheckCircle className="me-2" />
                  {successMessage}
                </Alert>
              )}

              <Row className="mb-4">
                <Col md={6} lg={4}>
                  <Form.Group>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaSearch className="text-muted" />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Search by username..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(0);
                        }}
                        className="border-start-0"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} lg={8} className="d-flex justify-content-end align-items-center gap-3">
                  {Object.values(selectedRows).filter(Boolean).length > 0 && (
                    <span className="text-muted">
                      {Object.values(selectedRows).filter(Boolean).length} {Object.values(selectedRows).filter(Boolean).length > 1 ? 'rows selected' : 'row selected'}
                    </span>
                  )}
                  <Button 
                    variant="success" 
                    onClick={exportToCSV} 
                    className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
                    disabled={loading}
                  >
                    <div className="icon-container">
                      <FaDownload />
                    </div>
                    <span>Export to CSV</span>
                  </Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover className="elegant-table">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: '40px' }}>
                        <FormCheck
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="d-inline-block"
                        />
                      </th>
                      <th><FaUser className="me-2" /> Username</th>
                      <th><FaClock className="me-2" /> Duration</th>
                      <th><FaPhone className="me-2" /> Allocated Calls</th>
                      <th><FaCheckCircle className="me-2" /> Answered</th>
                      <th><FaTimesCircle className="me-2" /> Failed</th>
                      <th><FaEuroSign className="me-2" /> Buy Price</th>
                      <th><FaEuroSign className="me-2" /> Sell Price</th>
                      <th>Margin (€)</th>
                      <th><FaPercentage className="me-2" /> ASR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((userSummary, index) => (
                        <tr key={userSummary.id}>
                          <td>
                            <FormCheck
                              type="checkbox"
                              checked={!!selectedRows[offset + index]}
                              onChange={() => handleRowSelect(offset + index)}
                              className="d-inline-block"
                            />
                          </td>
                          <td>{userSummary.username}</td>
                          <td>{formatSessionTime(userSummary.sessiontime)}</td>
                          <td>{userSummary.aloc_all_calls}</td>
                          <td>{userSummary.nbcall}</td>
                          <td>{userSummary.nbcall_fail}</td>
                          <td>{roundToTwoDecimal(userSummary.buycost)}€</td>
                          <td>{roundToTwoDecimal(userSummary.sessionbill)}€</td>
                          <td>{roundToTwoDecimal(userSummary.lucro)}</td>
                          <td>{roundToTwoDecimal(userSummary.asr)}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          <div className="d-flex flex-column align-items-center">
                            <FaUser className="text-muted mb-2" size={24} />
                            <span className="text-muted">No matching users found</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                <div className="text-muted small">
                  <Badge bg="light" text="dark" className="shadow-sm">
                    <span className="fw-semibold">{paginatedData.length}</span> of {filteredData.length} users
                  </Badge>
                </div>
                
                <ReactPaginate
                  previousLabel={'Previous'}
                  nextLabel={'Next'}
                  breakLabel={'...'}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageChange}
                  containerClassName={'pagination justify-content-center mb-0'}
                  activeClassName={'active'}
                  pageClassName={'page-item'}
                  pageLinkClassName={'page-link'}
                  previousClassName={'page-item'}
                  previousLinkClassName={'page-link'}
                  nextClassName={'page-item'}
                  nextLinkClassName={'page-link'}
                  breakClassName={'page-item'}
                  breakLinkClassName={'page-link'}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
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
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .icon-container {
          transition: transform 0.2s ease;
        }
        .btn-hover-effect:hover .icon-container {
          transform: scale(1.2);
        }
      `}</style>
    </Container>
  );
};

export default SummaryPerUser;