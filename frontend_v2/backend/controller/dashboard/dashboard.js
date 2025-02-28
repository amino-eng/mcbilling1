import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { FaUsers, FaFileInvoiceDollar, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import AuthService from './AuthService';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [totalClients, setTotalClients] = useState(0);
  const [totalFactures, setTotalFactures] = useState(0);
  const [revenusMensuels, setRevenusMensuels] = useState([]);
  const [appelsMensuels, setAppelsMensuels] = useState([]);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    setDarkMode(savedMode === 'true');

    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, facturesRes, revenusRes, appelsRes] = await Promise.all([
        axios.get('/api/dashboard/totalClients'),
        axios.get('/api/dashboard/totalFactures'),
        axios.get('/api/dashboard/revenusMensuels'),
        axios.get('/api/dashboard/appelsMensuels')
      ]);

      setTotalClients(clientsRes.data.totalClients);
      setTotalFactures(facturesRes.data.totalFactures);
      setRevenusMensuels(revenusRes.data.revenus);
      setAppelsMensuels(appelsRes.data.appels);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#333' : '#fff';
    document.body.style.color = darkMode ? '#fff' : '#000';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    AuthService.logout();
    window.location.reload();
  };

  return (
    <Container className="mt-4">
      {/* Mode sombre et déconnexion */}
      <Row className="mb-3">
        <Col>
          <Button onClick={() => setDarkMode(!darkMode)} variant={darkMode ? 'light' : 'dark'}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Col>
        <Col className="text-end">
          {user && (
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Col>
      </Row>

      {user ? (
        loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Chargement des données...</p>
          </div>
        ) : (
          <>
            <Row className="mb-4">
              {/* Total Clients */}
              <Col md={4}>
                <Card className="text-center p-3 shadow-sm">
                  <FaUsers size={40} className="mb-2 text-primary" />
                  <h4>Total des Clients</h4>
                  <h3>{totalClients}</h3>
                </Card>
              </Col>

              {/* Total Factures */}
              <Col md={4}>
                <Card className="text-center p-3 shadow-sm">
                  <FaFileInvoiceDollar size={40} className="mb-2 text-success" />
                  <h4>Total des Factures</h4>
                  <h3>{totalFactures}</h3>
                </Card>
              </Col>

              {/* Total Appels */}
              <Col md={4}>
                <Card className="text-center p-3 shadow-sm">
                  <FaPhone size={40} className="mb-2 text-warning" />
                  <h4>Appels ce mois</h4>
                  <h3>{appelsMensuels.reduce((acc, cur) => acc + cur.appels, 0)}</h3>
                </Card>
              </Col>
            </Row>

            {/* Graphique Revenus Mensuels */}
            <Row className="mb-4">
              <Col>
                <Card className="p-3 shadow-sm">
                  <h5 className="text-center">Revenus Mensuels (€)</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenusMensuels}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* Graphique Appels Mensuels */}
            <Row>
              <Col>
                <Card className="p-3 shadow-sm">
                  <h5 className="text-center">Appels Mensuels</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={appelsMensuels}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="appels" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </>
        )
      ) : (
        <Row className="mt-5">
          <Col>
            <Card className="text-center p-3 shadow-sm">
              <h3>Veuillez vous connecter pour accéder au tableau de bord.</h3>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;
