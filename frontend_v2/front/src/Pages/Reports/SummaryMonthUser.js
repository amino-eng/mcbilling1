"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Table, Button, Card, Container, Row, Col, Badge, Spinner, Alert, Form } from "react-bootstrap"
import ReactPaginate from "react-paginate"
import { CSVLink } from "react-csv"
import { FaDownload, FaSearch, FaChartLine, FaTimesCircle, FaSort, FaSortUp, FaSortDown } from "react-icons/fa"

const ITEMS_PER_PAGE = 10

const SummaryMonthUserTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'month', direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState({})
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/SummaryMonthUser")
      .then((response) => {
        setData(response.data.data)
        setLoading(false)
      })
      .catch((err) => {
        setError("Unable to retrieve data.")
        setLoading(false)
      })
  }, [])

  const roundToTwoDecimalPlaces = (value) => {
    if (value || value === 0) {
      return Number(value).toFixed(2)
    }
    return value
  }

  const formatSessionTime = (seconds) => {
    if (seconds || seconds === 0) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}m ${remainingSeconds}s`
    }
    return "-"
  }

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      if (sortConfig.key === 'month') {
        const monthA = parseInt(a.month)
        const monthB = parseInt(b.month)
        return sortConfig.direction === 'asc' ? monthA - monthB : monthB - monthA
      }
      return 0
    })
  }

  const filteredData = data.filter(item =>
    `${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}`.includes(searchTerm)
  )
  
  const sortedData = sortData(filteredData)

  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE)
  const offset = currentPage * ITEMS_PER_PAGE
  const pagedData = sortedData.slice(offset, offset + ITEMS_PER_PAGE)
  
  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleSelectRow = (id) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    const newSelectedRows = {}
    if (newSelectAll) {
      sortedData.forEach(item => {
        newSelectedRows[item.id] = true
      })
    }
    setSelectedRows(newSelectedRows)
  }

  const getSelectedData = () => {
    if (Object.keys(selectedRows).length === 0) return sortedData
    return sortedData.filter(item => selectedRows[item.id])
  }

  const csvData = [
    ["Mois", "Utilisateur", "Durée", "Appels alloués", "Appels répondu", "Prix d'achat (€)", "Prix de vente (€)", "Marge", "ASR (%)"],
    ...getSelectedData().map(item => [
      `${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}`,
      item.username,
      formatSessionTime(item.sessiontime),
      roundToTwoDecimalPlaces(item.aloc_all_calls),
      item.nbcall,
      roundToTwoDecimalPlaces(item.buycost),
      roundToTwoDecimalPlaces(item.sessionbill),
      roundToTwoDecimalPlaces(item.lucro),
      roundToTwoDecimalPlaces(item.asr)
    ])
  ]

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="d-flex align-items-center">
          <FaTimesCircle className="me-2" />
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <div className="dashboard-main" style={{ marginLeft: "80px" }}>
      <Container fluid className="px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={11}>
            <Card className="shadow border-0 overflow-hidden">
              <Card.Header className="bg-primary p-3 position-relative">
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
                      <FaChartLine className="text-white opacity-25" style={{ fontSize: `${Math.random() * 1.5 + 0.5}rem` }} />
                    </div>
                  ))}
                </div>
                <div className="d-flex align-items-center position-relative z-2">
                  <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
                    <FaChartLine className="text-primary fs-3" />
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0 text-white">Monthly User Reports</h2>
                    <p className="text-white-50 mb-0 d-none d-md-block">Detailed monthly usage statistics by user</p>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body className="p-4">
                <Row className="mb-4">
                  <Col md={6} lg={4}>
                    <Form.Control
                      type="text"
                      placeholder="Search by month..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="shadow-sm"
                    />
                  </Col>
                  <Col md={6} lg={8} className="d-flex justify-content-end">
                    <CSVLink
                      data={csvData}
                      filename="monthly_user_reports.csv"
                      className={`btn btn-success d-flex align-items-center gap-2 ${Object.keys(selectedRows).length === 0 ? 'disabled' : ''}`}
                      disabled={isExporting || Object.keys(selectedRows).length === 0}
                      title={Object.keys(selectedRows).length === 0 ? 'Sélectionnez au moins une ligne à exporter' : ''}
                    >
                      {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
                      {Object.keys(selectedRows).length > 0 ? `Exporter (${Object.values(selectedRows).filter(Boolean).length})` : 'Exporter'}
                    </CSVLink>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <Table striped bordered hover className="elegant-table">
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectAll && Object.keys(selectedRows).length === sortedData.length}
                            onChange={handleSelectAll}
                            className="d-inline-block"
                          />
                        </th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => requestSort('month')}
                          className="d-flex align-items-center"
                        >
                          Mois
                          {sortConfig.key === 'month' ? (
                            sortConfig.direction === 'asc' ? 
                              <FaSortUp className="ms-1" /> : 
                              <FaSortDown className="ms-1" />
                          ) : (
                            <FaSort className="ms-1 text-muted" />
                          )}
                        </th>
                        <th>Username</th>
                        <th>Duration</th>
                        <th>Allocated Calls</th>
                        <th>Answered Calls</th>
                        <th>Buy Price (€)</th>
                        <th>Sell Price (€)</th>
                        <th>Markup</th>
                        <th>ASR (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={!!selectedRows[item.id]}
                              onChange={() => handleSelectRow(item.id)}
                              className="d-inline-block"
                            />
                          </td>
                          <td>{`${item.month.toString().slice(0, 4)}-${item.month.toString().slice(4)}`}</td>
                          <td>{item.username}</td>
                          <td>{formatSessionTime(item.sessiontime)}</td>
                          <td>{roundToTwoDecimalPlaces(item.aloc_all_calls)}</td>
                          <td>{item.nbcall}</td>
                          <td>{roundToTwoDecimalPlaces(item.buycost)}€</td>
                          <td>{roundToTwoDecimalPlaces(item.sessionbill)}€</td>
                          <td>
                            <Badge bg={item.lucro >= 0 ? "success" : "danger"}>
                              {roundToTwoDecimalPlaces(item.lucro)}
                            </Badge>
                          </td>
                          <td>{roundToTwoDecimalPlaces(item.asr)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                  <div className="text-muted small">
                    <Badge bg="light" text="dark" className="me-2 shadow-sm">
                      <span className="fw-semibold">{pagedData.length}</span> of {filteredData.length} records
                    </Badge>
                    {searchTerm && (
                      <Badge bg="light" text="dark" className="shadow-sm">
                        Filtered from {data.length} total records
                      </Badge>
                    )}
                  </div>
                  
                  <ReactPaginate
                    previousLabel="Previous"
                    nextLabel="Next"
                    breakLabel="..."
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={({ selected }) => setCurrentPage(selected)}
                    containerClassName="pagination"
                    activeClassName="active"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    breakClassName="page-item"
                    breakLinkClassName="page-link"
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx global>{`
        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
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
      `}</style>
    </div>
  )
}

export default SummaryMonthUserTable