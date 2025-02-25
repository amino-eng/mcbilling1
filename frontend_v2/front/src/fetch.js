import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/data')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(err => console.error('Erreur lors de la récupération des données', err));
  }, []);

  return (
    <div>
      <h1>Données de MySQL</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
