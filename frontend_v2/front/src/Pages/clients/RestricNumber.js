import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RestricNumber() {
  const [phoneData, setPhoneData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restrictionType, setRestrictionType] = useState('');
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const [userRestrict, setuserRestrict]=useState([])

  // Fetch the data from the backend
  const fetchData = () => {
    axios.get('http://localhost:5000/api/admin/agent/affiche')
      .then((response) => {
        setPhoneData(response.data.restrictions); // Set the restrictions with agent data
        console.log(response.data); // You can check the data structure in the console
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const fetchUser = () => {
    axios.get('http://localhost:5000/api/admin/agent/afficheuserRestrict')
      .then((response) => {
        setuserRestrict(response.data); 
        console.log("agent",response.data); 
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  

  useEffect(() => {
    fetchData();
    fetchUser()
  }, []);

  // Handle adding a new restriction
  const handleAddRestriction = () => {
    if (!phoneNumber || !restrictionType) {
      alert('Please enter both phone number and restriction type.');
      return;
    }

    axios.post('http://localhost:5000/add-restriction', {
      number: phoneNumber,
      direction: restrictionType
    })
      .then(() => {
        alert('Restriction added successfully!');
        setPhoneNumber('');
        setRestrictionType('');
        setShowForm(false); // Hide the form after submission
        fetchData(); // Refresh data after adding restriction
      })
      .catch((error) => {
        console.error('Error adding restriction:', error);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '6px 12px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : 'Add Restriction'}
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Phone Number</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Direction</th>
          </tr>
        </thead>
        <tbody>
          {phoneData.length > 0 && phoneData.map((e, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{e.agent.username}</td> {/* Display the agent username */}
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{e.number}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {e.direction === 2 ? 'Inbound' : 'Outbound'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Conditional rendering of the form */}
      {showForm && (
        <div style={{ marginTop: '10px' }}>
          <select>
            {userRestrict.map((e,i)=>{
              return(
                <option key={i}>
                  {e.id}
                </option>
              )
            })}
          </select>
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="text"
            placeholder="Restriction Type"
            value={restrictionType}
            onChange={(e) => setRestrictionType(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button
            onClick={handleAddRestriction}
            style={{ padding: '6px 12px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

export default RestricNumber;
