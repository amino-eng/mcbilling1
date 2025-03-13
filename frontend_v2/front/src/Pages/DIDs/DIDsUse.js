import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Table, Container, Alert, Button, Pagination, Form, Dropdown } from 'react-bootstrap';

const DIDsUse = () => {
    const [dids, setDids] = useState([]);
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [visibleColumns, setVisibleColumns] = useState({
        DID: true,
        Username: true,
        MonthPayed: true,
        ReservationDate: true,
        ReleaseDate: true,
        NextDueDate: true
    });

    const [showColumnSelector, setShowColumnSelector] = useState(false);

    const apiUrl = 'http://localhost:5000/api/admin/DIDUse/affiche';
    
    const fetchDIDs = async () => {
        try {
            const response = await axios.get(apiUrl);
            const result = response.data;
            if (result.didsUsers) {
                setDids(result.didsUsers);
            } else {
                setMessage('No DIDs found');
            }
        } catch (error) {
            console.error('Error fetching DIDs:', error);
            setMessage('Failed to fetch data');
        }
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toISOString().slice(0, 19).replace('T', ' ') : '';
    };

    const handleCSVExport = () => {
        const headers = Object.keys(visibleColumns).filter(key => visibleColumns[key]);
        const csvRows = [
            headers.join(','), 
            ...dids.map(did => headers.map(column => column === 'ReservationDate' || column === 'ReleaseDate' || column === 'NextDueDate' ? formatDate(did[column]) : did[column]).join(','))
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'dids_usage.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleColumnToggle = (column) => {
        setVisibleColumns(prevState => ({
            ...prevState,
            [column]: !prevState[column]
        }));
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDIDs = dids.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        fetchDIDs();
    }, []);

    return (
        <Container>
            <h1 className="mt-5">Utilisation des DIDs</h1>

            {message && <Alert variant="info">{message}</Alert>}

            <div className="mb-3 d-flex gap-2">
                <Button variant="success" onClick={handleCSVExport}>Exporter en CSV</Button>
                <Button variant="secondary" onClick={() => setShowColumnSelector(!showColumnSelector)}>
                    Masquer Colonnes
                </Button>
            </div>

            {showColumnSelector && (
                <div className="mb-3 p-3 border rounded">
                    <h5>Choisir les colonnes à afficher :</h5>
                    {Object.keys(visibleColumns).map(column => (
                        <Form.Check 
                            key={column}
                            type="checkbox"
                            label={column}
                            checked={visibleColumns[column]}
                            onChange={() => handleColumnToggle(column)}
                        />
                    ))}
                </div>
            )}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        {visibleColumns.DID && <th>DID</th>}
                        {visibleColumns.Username && <th>Username</th>}
                        {visibleColumns.MonthPayed && <th>Month Payed</th>}
                        {visibleColumns.ReservationDate && <th>Reservation Date</th>}
                        {visibleColumns.ReleaseDate && <th>Release Date</th>}
                        {visibleColumns.NextDueDate && <th>Next Due Date</th>}
                    </tr>
                </thead>
                <tbody>
                    {currentDIDs.map((did) => (
                        <tr key={did.id}>
                            {visibleColumns.DID && <td>{did.DID}</td>}
                            {visibleColumns.Username && <td>{did.Username}</td>}
                            {visibleColumns.MonthPayed && <td>{did.MonthPayed}</td>}
                            {visibleColumns.ReservationDate && <td>{formatDate(did.ReservationDate)}</td>}
                            {visibleColumns.ReleaseDate && <td>{formatDate(did.ReleaseDate)}</td>}
                            {visibleColumns.NextDueDate && <td>{formatDate(did.NextDueDate)}</td>}
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Pagination>
                {[...Array(Math.ceil(dids.length / itemsPerPage))].map((_, index) => (
                    <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </Container>
    );
};

export default DIDsUse;
