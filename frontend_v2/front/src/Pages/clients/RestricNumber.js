// RestricNumber.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RestricNumber() {
  const [phoneData, setPhoneData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restrictionType, setRestrictionType] = useState('');



  //function to get all restrict numbers 
  const fetchData =()=>{
    axios.get('http://localhost:5000/data')
    .then((response) => {
      console.log("log1",response.data);
      
      setPhoneData(response.data)
      
      
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }
  // Fetch phone restrictions data from the backend on component mount
  useEffect(() => {
fetchData()
  }, []);
  console.log(phoneData);

  // // Handle form submission to insert a new phone restriction
  // const handleSubmit = () => {
  //   axios.post('http://localhost:5000/api/pkg_restrict_phone', {
  //     phone_number: phoneNumber,
  //     restriction_type: restrictionType,
  //   })
  //     .then(() => {
  //       alert('Data inserted successfully');
  //       setPhoneNumber('');
  //       setRestrictionType('');
  //     })
  //     .catch((error) => {
  //       console.error('Error inserting data:', error);
  //     });
  // };

  return (
    <div>
      <h1>Phone Restrictions</h1>

      <h2>Add New Restriction</h2>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Phone Number"
      />
      <input
        type="text"
        value={restrictionType}
        onChange={(e) => setRestrictionType(e.target.value)}
        placeholder="Restriction Type"
      />
      <button >Add Restriction</button>

      <h2>Current Restrictions</h2>
      <ul>
      {phoneData.length && <div>
        {phoneData.map((e,i)=>{
          return(
            <div key={i}>
                <h2>id_user :{e.id_user}</h2>
                <h2>number :{e.number}</h2>
                <h2>direction :{e.direction}</h2>


            </div>
          )
        })}
        </div>}
      </ul>
    </div>
  );
}

export default RestricNumber;
