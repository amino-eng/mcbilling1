import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';

const Dashboard = () => {
  const [totalClients, setTotalClients] = useState(null);
  const [totalFactures, setTotalFactures] = useState(null);
  const [revenusMensuels, setRevenusMensuels] = useState([]);
  const [appelsMensuels, setAppelsMensuels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les données depuis le backend
        const clientsResponse = await axios.get('http://localhost:5000/api/admin/dashboard/getTotalClients');
        const facturesResponse = await axios.get('http://localhost:5000/api/admin/dashboard/getTotalFactures');
        const revenusResponse = await axios.get('http://localhost:5000/api/admin/dashboard/getRevenusMensuels');
        const appelsResponse = await axios.get('http://localhost:5000/api/admin/dashboard/getAppelsMensuels');

        // Mettre à jour les états avec les données reçues
        setTotalClients(clientsResponse.data.totalClients);
        setTotalFactures(facturesResponse.data.totalFactures);
        setRevenusMensuels(revenusResponse.data.revenus);
        setAppelsMensuels(appelsResponse.data.appels);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Si le contenu est en cours de chargement
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Chargement des données...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        {/* Total Clients */}
        <Col md={6} lg={3} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Total Clients</Card.Title>
              <Card.Text>{totalClients}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Total Factures */}
        <Col md={6} lg={3} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Total Factures</Card.Title>
              <Card.Text>{totalFactures}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Revenus Mensuels */}
        <Col md={6} lg={3} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Revenus Mensuels</Card.Title>
              <Card.Text>
                {revenusMensuels.length > 0 ? (
                  revenusMensuels.map((item, index) => (
                    <div key={index}>
                      {`Mois: ${item.month}, Revenus: ${item.revenue}€`}
                    </div>
                  ))
                ) : (
                  <p>Aucun revenu trouvé</p>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Appels Mensuels */}
        <Col md={6} lg={3} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Appels Mensuels</Card.Title>
              <Card.Text>
                {appelsMensuels.length > 0 ? (
                  appelsMensuels.map((item, index) => (
                    <div key={index}>
                      {`Mois: ${item.month}, Appels: ${item.appels}`}
                    </div>
                  ))
                ) : (
                  <p>Aucun appel trouvé</p>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
