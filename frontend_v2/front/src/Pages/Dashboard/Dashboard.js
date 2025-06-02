import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';

import axios from 'axios';

// Helper function to format duration
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

// Status badge component
const StatusBadge = ({ status }) => (
  <span className={`badge bg-${status}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

function Dashboard() {
  const [loading, setLoading] = useState({
    callTrends: false,
    recentActivity: false,
    callStats: false
  });

  const [error, setError] = useState({
    callTrends: '',
    recentActivity: '',
    callStats: ''
  });
  const [callTrendsData, setCallTrendsData] = useState(false);
  const [monthlyStatsData, setMonthlyStatsData] = useState(false);
  const [callTrendsOptions, setCallTrendsOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    animation: false
  });
  const [callDistributionData, setCallDistributionData] = useState({
    labels: ['Successful', 'Failed'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#28a745', '#dc3545'],
      hoverOffset: 4
    }]
  });
  const [callDistributionOptions, setCallDistributionOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    animation: false
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalDuration: 0
  });

  useEffect(() => {
    // Initialize chart options
    setCallTrendsOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Nombre d\'appels'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    });

    setCallDistributionOptions({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '50%'
    });

    // Fetch initial data
    const fetchData = async () => {
      try {
        await fetchCallSummaryData();
        await fetchRecentActivity();
        await fetchCallStats();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(prev => ({
          ...prev,
          callTrends: "Failed to load call trends",
          recentActivity: "Failed to load recent activity",
          callStats: "Failed to load call stats"
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchCallSummaryData = async () => {
    setLoading(prev => ({ ...prev, callTrends: true }));
    try {
      // Get today's date
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      
      const response = await axios.get(`http://localhost:5000/api/admin/SummaryPerDay`, {
        params: {
          date: date
        }
      });
      console.log('Summary Per Day Response:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        const summaryData = response.data.data;
        
        // Sort data by day
        summaryData.sort((a, b) => new Date(a.day) - new Date(b.day));
        
        // Extract labels (days) and call volumes
        const labels = summaryData.map(day => {
          const date = new Date(day.day);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const callVolumes = summaryData.map(day => day.nbcall || 0);
        const failedVolumes = summaryData.map(day => day.nbcall_fail || 0);
        const successVolumes = summaryData.map(day => (day.nbcall || 0) - (day.nbcall_fail || 0));
        
        // Update call trends data
        setCallTrendsData({
          labels,
          datasets: [
            {
              label: 'Total Calls',
              data: callVolumes,
              fill: false,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              tension: 0.1,
              order: 1,
              yAxisID: 'y'
            },
            {
              label: 'Successful Calls',
              data: successVolumes,
              fill: false,
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              tension: 0.1,
              order: 2,
              yAxisID: 'y'
            },
            {
              label: 'Failed Calls',
              data: failedVolumes,
              fill: false,
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              tension: 0.1,
              order: 3,
              yAxisID: 'y'
            }
          ]
        });

        // Fetch monthly statistics
        const monthlyResponse = await axios.get(`http://localhost:5000/api/admin/SummaryPerMonth`);
        console.log('Summary Per Month Response:', monthlyResponse.data);
        
        // Process monthly statistics
        const monthlyStats = monthlyResponse.data ? {
          labels: monthlyResponse.data.map(item => item.month),
          datasets: [
            {
              label: 'Appels réussis',
              data: monthlyResponse.data.map(item => item.nbcall - item.nbcall_fail),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              fill: true
            },
            {
              label: 'Appels échoués',
              data: monthlyResponse.data.map(item => item.nbcall_fail),
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              fill: true
            }
          ]
        } : {
          labels: [],
          datasets: []
        };
        setMonthlyStatsData(monthlyStats);
      }

    } catch (error) {
      console.error("Error fetching call trends:", error);
      setError(prev => ({
        ...prev,
        callTrends: "Failed to load call trends"
      }));
    } finally {
      setLoading(prev => ({ ...prev, callTrends: false }));
    }
  }

  const fetchRecentActivity = async () => {
    setLoading(prev => ({ ...prev, recentActivity: true }));
    try {
      // Fetch CDR data
      const cdrResponse = await axios.get("http://localhost:5000/api/admin/CDR/affiche");
      
      // Fetch user history
      const userHistoryResponse = await axios.get("http://localhost:5000/api/admin/UserHistory/affiche");
      
      const activities = [];
      
      // Process CDR data
      if (cdrResponse.data && Array.isArray(cdrResponse.data)) {
        const recentCalls = cdrResponse.data.slice(0, 5).map(call => ({
          id: `call-${call.id || Math.random().toString(36).substr(2, 9)}`,
          type: 'call',
          user: call.src || 'Unknown',
          timestamp: new Date(call.calldate || Date.now()).toLocaleString(),
          status: call.disposition === 'ANSWERED' ? 'success' : 'danger',
          details: `${call.disposition === 'ANSWERED' ? 'Successful' : 'Failed'} call to ${call.dst || 'Unknown'}`
        }));
        
        activities.push(...recentCalls);
      }
      
      // Process user history data
      if (userHistoryResponse.data && Array.isArray(userHistoryResponse.data)) {
        const userActivities = userHistoryResponse.data.slice(0, 5).map(activity => ({
          id: `activity-${activity.id || Math.random().toString(36).substr(2, 9)}`,
          type: 'user',
          user: activity.username || 'Unknown',
          timestamp: new Date(activity.date || Date.now()).toLocaleString(),
          status: 'info',
          details: activity.description || 'User activity'
        }));
        
        activities.push(...userActivities);
      }
      
      // Sort activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Take the 10 most recent activities
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching activity data:", error);
      setError(prev => ({
        ...prev,
        recentActivity: "Failed to load recent activity"
      }));
    } finally {
      setLoading(prev => ({ ...prev, recentActivity: false }));
    }
  }

  const fetchCallStats = async () => {
    setLoading(prev => ({ ...prev, callStats: true }));
    try {
      // Fetch failed CDR data
      let failedData = [];
      try {
        const failedResponse = await axios.get("http://localhost:5000/api/admin/CdrFailed/affiche");
        console.log('Failed CDR Response:', failedResponse.data);
        failedData = failedResponse.data?.cdr_failed || [];
        console.log('Number of failed calls:', failedData.length);
      } catch (error) {
        console.error("Error fetching failed CDR data:", error);
      }

      // Fetch successful CDR data
      const successResponse = await axios.get("http://localhost:5000/api/admin/CDR/affiche");
      console.log('CDR Response:', successResponse.data);
      
      if (!successResponse.data || !Array.isArray(successResponse.data.cdr)) {
        console.error('Invalid CDR data format:', successResponse.data);
        throw new Error('Invalid CDR data format');
      }

      // Filter successful calls
      const successData = successResponse.data.cdr.filter(call => {
        console.log('Call details:', {
          terminatecauseid: call.terminatecauseid,
          sessiontime: call.sessiontime,
          real_sessiontime: call.real_sessiontime,
          sessionbill: call.sessionbill,
          calledstation: call.calledstation,
          callerid: call.callerid
        });
        // Consider a call successful if it has sessiontime > 0
        return call.sessiontime > 0;
      });

      // Calculate statistics
      const totalCalls = successData.length + failedData.length;
      const successfulCalls = successData.length;
      const failedCalls = failedData.length;
      
      // Calculate average duration using sessiontime
      const totalDuration = successData.reduce((sum, call) => sum + call.sessiontime, 0);
      const averageDuration = successfulCalls > 0 ? totalDuration / successfulCalls : 0;
      
      console.log('Call Stats:', {
        totalCalls,
        successfulCalls,
        failedCalls,
        totalDuration
      });
      
      // Update call stats
      setCallStats({
        totalCalls,
        successfulCalls,
        failedCalls,
        totalDuration
      });
      
      // Update call distribution data
      setCallDistributionData({
        labels: ['Successful', 'Failed'],
        datasets: [{
          data: [successfulCalls, failedCalls],
          backgroundColor: ['#28a745', '#dc3545'],
          hoverOffset: 4
        }]
      });
    } catch (error) {
      console.error("Error fetching call stats:", error);
      setError(prev => ({
        ...prev,
        callStats: error.message || "Failed to load call stats"
      }));
      setCallStats({
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalDuration: 0
      });
      setCallDistributionData({
        labels: ['Successful', 'Failed'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#28a745', '#dc3545'],
          hoverOffset: 4
        }]
      });
    } finally {
      setLoading(prev => ({ ...prev, callStats: false }));
    }
  }

  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
      </div>

      {/* Error Alert */}
      {Object.values(error).some(Boolean) && (
        <Alert variant="danger" className="mb-4">
          {Object.entries(error).find(([_, value]) => value)?.[1]}
        </Alert>
      )}

      {/* Loading Spinner */}
      {Object.values(loading).some(Boolean) && (
        <div className="d-flex justify-content-center mb-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* Call Statistics */}
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Total Calls</h5>
              <h2 className="text-primary">{callStats.totalCalls}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Successful Calls</h5>
                <StatusBadge status="success" />
              </div>
              <h2 className="text-success">{callStats.successfulCalls}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Failed Calls</h5>
              <h2 className="text-danger">{callStats.failedCalls}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Total Duration</h5>
              <h2 className="text-info">{formatDuration(callStats.totalDuration)}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Statistiques des appels</h5>
            </Card.Body>
            <Card.Body>
              <div className="doughnut-chart">
                <Doughnut 
                  data={callDistributionData} 
                  options={callDistributionOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Statistiques par jour</h5>
              </div>
            </Card.Body>
            <Card.Body>
              <div className="line-chart">
                <Line 
                  data={callTrendsData} 
                  options={callTrendsOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Statistiques mensuelles</h5>
              </div>
            </Card.Body>
            <Card.Body>
              <div className="line-chart">
                {monthlyStatsData && monthlyStatsData.labels.length > 0 && (
                <Line 
                  data={monthlyStatsData} 
                  options={callTrendsOptions}
                />
              )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <h5 className="card-title mb-0">Recent Activity</h5>
        </Card.Header>
        <Card.Body>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <StatusBadge status={activity.status} />
                <div className="activity-content">
                  <div className="activity-user">{activity.user}</div>
                  <div className="activity-details">{activity.details}</div>
                </div>
                <div className="activity-timestamp">
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;