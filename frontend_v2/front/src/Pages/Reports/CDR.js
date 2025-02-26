import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

// Styled Components for CSS
const TableContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: auto;
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
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: #007bff;
  color: white;
  padding: 12px;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
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
  margin-top: 15px;
`;

const CDRTable = () => {
  const [cdrData, setCdrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCDRData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/CDR/affiche");
      setCdrData(response.data.cdr);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching CDR data:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
  

    fetchCDRData();
  }, []);
console.log(cdrData.cdr);

  const filteredData = cdrData.filter(
    (cdr) =>
      cdr.callerid.includes(search) ||
      cdr.calledstation.includes(search) ||
      cdr.starttime.includes(search)
  );

  if (loading) return <p>Loading CDR data...</p>;
const supprimer =(id)=>{
    console.log(id);
    
    axios.delete(`http://localhost:5000/api/admin/CDR/delete/${id}`).then(()=>{
        console.log("deleted");
        fetchCDRData()
        
    }).catch((err)=>{
        console.log(err);
        
    })
}
  return (
    <TableContainer>
      <Title>Call Detail Records (CDR)</Title>
      <SearchInput
        type="text"
        placeholder="🔍 Search Caller ID, Number or Date"
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table>
        <thead>
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Caller ID</TableHeader>
            <TableHeader>Called Number</TableHeader>
            <TableHeader>Start Time</TableHeader>
            <TableHeader>Duration (sec)</TableHeader>
            <TableHeader>Cost (€)</TableHeader>
            <TableHeader>Action</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((cdr) => (
              <TableRow key={cdr.id}>
                <TableCell>{cdr.id}</TableCell>
                <TableCell>{cdr.callerid}</TableCell>
                <TableCell>{cdr.calledstation}</TableCell>
                <TableCell>{new Date(cdr.starttime).toLocaleString()}</TableCell>
                <TableCell>{cdr.sessiontime}</TableCell>
                <TableCell>{cdr.buycost} €</TableCell>
                <TableCell><button onClick={()=>supprimer(cdr.id)}>supprimer</button></TableCell>
              </TableRow>
            ))}
        </tbody>
      </Table>
      <PaginationContainer>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          ◀ Previous
        </button>
        <span> Page {page + 1} </span>
        <button
          disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
          onClick={() => setPage(page + 1)}
        >
          Next ▶
        </button>
      </PaginationContainer>
    </TableContainer>
  );
};

export default CDRTable;
