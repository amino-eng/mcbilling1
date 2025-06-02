import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner, Button, Badge } from 'react-bootstrap';
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
  // Custom styles for dashboard elements
  // Light theme styles
  const getLightTheme = () => ({
    container: {
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    },
    headerCard: {
      borderLeft: '4px solid #007bff',
      boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.05)',
      marginBottom: '1.5rem',
      borderRadius: '0.75rem',
      background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
      overflow: 'hidden',
      position: 'relative'
    },
    statCard: {
      borderRadius: '0.75rem',
      boxShadow: '0 0.25rem 1rem rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      height: '100%',
      overflow: 'hidden',
      border: 'none'
    },
    statCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)'
    },
    chartCard: {
      borderRadius: '0.75rem',
      boxShadow: '0 0.25rem 1rem rgba(0, 0, 0, 0.05)',
      height: '100%',
      border: 'none',
      overflow: 'hidden'
    },
    chartContainer: {
      height: '250px',
      position: 'relative'
    },
    activityCard: {
      borderRadius: '0.75rem',
      boxShadow: '0 0.25rem 1rem rgba(0, 0, 0, 0.05)',
      border: 'none',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    activityItem: {
      borderLeft: '3px solid #dee2e6',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.03)'
    },
    activityItemHover: {
      transform: 'translateX(5px)',
      boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.05)'
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      marginRight: '1rem'
    },
    cardHeader: {
      background: 'linear-gradient(to right, #ffffff, #f8f9fa)',
      borderBottom: 'none',
      padding: '1.25rem 1.5rem 0.75rem'
    },
    progressBar: {
      height: '8px',
      borderRadius: '4px',
      marginTop: '0.5rem'
    },
    badge: {
      padding: '0.5rem 0.75rem',
      fontWeight: '500',
      borderRadius: '50rem'
    }
  });
  
  // Dark theme styles
  const getDarkTheme = () => ({
    container: {
      padding: '1.5rem',
      backgroundColor: '#212529',
      backgroundImage: 'linear-gradient(to bottom, #212529, #343a40)',
      minHeight: '100vh',
      transition: 'all 0.3s ease',
      color: '#e9ecef'
    },
    headerCard: {
      borderLeft: '4px solid #007bff',
      boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)',
      marginBottom: '1.5rem',
      borderRadius: '0.75rem',
      background: 'linear-gradient(135deg, #343a40, #212529)',
      overflow: 'hidden',
      position: 'relative'
    },
    statCard: {
      borderRadius: '0.75rem',
      boxShadow: '0 0.25rem 1rem rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      height: '100%',
      overflow: 'hidden',
      border: 'none',
      backgroundColor: '#343a40',
      color: '#e9ecef'
    },
    statCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)'
    },
    chartCard: {
      borderRadius: '0.75rem',
      boxShadow: '0 0.25rem 1rem rgba(0, 0, 0, 0.2)',
      height: '100%',
      border: 'none',
      overflow: 'hidden',
      backgroundColor: '#343a40',
      color: '#e9ecef'
    },
    chartContainer: {
      height: '250px',
      position: 'relative'
    },
    activityCard: {
      borderRadius: '0.75rem',
      boxShadow: '0 0.25rem 1rem rgba(0, 0, 0, 0.2)',
      border: 'none',
      overflow: 'hidden',
      backgroundColor: '#343a40',
      color: '#e9ecef',
      transition: 'all 0.3s ease'
    },
    activityItem: {
      borderLeft: '3px solid #495057',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      backgroundColor: '#343a40',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.1)'
    },
    activityItemHover: {
      transform: 'translateX(5px)',
      boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)'
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      marginRight: '1rem'
    },
    cardHeader: {
      background: 'linear-gradient(to right, #343a40, #212529)',
      borderBottom: 'none',
      padding: '1.25rem 1.5rem 0.75rem',
      color: '#e9ecef'
    },
    progressBar: {
      height: '8px',
      borderRadius: '4px',
      marginTop: '0.5rem'
    },
    badge: {
      padding: '0.5rem 0.75rem',
      fontWeight: '500',
      borderRadius: '50rem'
    }
  });
  
  // State for theme
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month', 'year'
  
  // Get theme based on dark mode state
  const dashboardStyles = darkMode ? getDarkTheme() : getLightTheme();
  
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
  const [callTrendsData, setCallTrendsData] = useState({
    labels: [],
    datasets: []
  });
  const [monthlyStatsData, setMonthlyStatsData] = useState({
    labels: [],
    datasets: []
  });
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
        const monthlyData = monthlyResponse.data && monthlyResponse.data.data;
        const monthlyStats = monthlyData && Array.isArray(monthlyData) ? {
          labels: monthlyData.map(item => item.month),
          datasets: [
            {
              label: 'Appels réussis',
              data: monthlyData.map(item => item.nbcall - item.nbcall_fail),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              fill: true
            },
            {
              label: 'Appels échoués',
              data: monthlyData.map(item => item.nbcall_fail),
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

  // Custom animation for cards
  const fadeInAnimation = {
    opacity: 0,
    animation: 'fadeIn 0.6s ease-in-out forwards',
    animationDelay: '0.2s'
  };
  
  // Handle theme toggle
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Update chart options for dark mode
    updateChartOptions();
  };
  
  // Handle refresh data
  const refreshData = () => {
    setRefreshing(true);
    // Call all the fetch functions directly
    Promise.all([
      fetchCallSummaryData(),
      fetchRecentActivity(),
      fetchCallStats()
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 1500);
    });
  };
  
  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // In a real app, you would fetch data for the new range
    // For demo, we'll just simulate a refresh
    refreshData();
  };
  
  // Update chart options based on theme
  const updateChartOptions = () => {
    const textColor = darkMode ? '#e9ecef' : '#666';
    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update options for all charts with safe access to nested properties
    setCallTrendsOptions(prev => {
      // Create a safe copy of the previous options
      const safeOptions = { ...prev };
      
      // Ensure scales and its properties exist
      if (!safeOptions.scales) safeOptions.scales = {};
      if (!safeOptions.scales.x) safeOptions.scales.x = {};
      if (!safeOptions.scales.y) safeOptions.scales.y = {};
      
      // Ensure plugins and legend exist
      if (!safeOptions.plugins) safeOptions.plugins = {};
      if (!safeOptions.plugins.legend) safeOptions.plugins.legend = {};
      if (!safeOptions.plugins.legend.labels) safeOptions.plugins.legend.labels = {};
      
      return {
        ...safeOptions,
        scales: {
          ...safeOptions.scales,
          x: { ...safeOptions.scales.x, grid: { color: gridColor }, ticks: { color: textColor } },
          y: { ...safeOptions.scales.y, grid: { color: gridColor }, ticks: { color: textColor } }
        },
        plugins: {
          ...safeOptions.plugins,
          legend: { 
            ...safeOptions.plugins.legend, 
            labels: { ...safeOptions.plugins.legend.labels, color: textColor } 
          }
        }
      };
    });
    
    // Only update monthly stats if they exist
    if (monthlyStatsData && monthlyStatsData.datasets && monthlyStatsData.datasets.length > 0) {
      // We'll update the monthly stats options in the future if needed
      // For now, we'll skip this part as setMonthlyStatsOptions is not defined
    }
    
    // Update call distribution options with safe access
    setCallDistributionOptions(prev => {
      // Create a safe copy of the previous options
      const safeOptions = { ...prev };
      
      // Ensure plugins and legend exist
      if (!safeOptions.plugins) safeOptions.plugins = {};
      if (!safeOptions.plugins.legend) safeOptions.plugins.legend = {};
      if (!safeOptions.plugins.legend.labels) safeOptions.plugins.legend.labels = {};
      
      return {
        ...safeOptions,
        plugins: {
          ...safeOptions.plugins,
          legend: { 
            ...safeOptions.plugins.legend, 
            labels: { ...safeOptions.plugins.legend.labels, color: textColor } 
          }
        }
      };
    });
  };
  
  // Effect to update chart options when theme changes
  useEffect(() => {
    if (callTrendsData.datasets.length > 0) {
      updateChartOptions();
    }
  }, [darkMode]);
  
  // Effect to update chart options when theme changes - removed duplicate

  return (
    <div style={dashboardStyles.container}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .stat-card:hover .icon-container {
            animation: pulse 1s infinite;
          }
          .chart-container {
            transition: all 0.3s ease;
          }
          .chart-container:hover {
            transform: scale(1.02);
          }
          .refresh-icon {
            transition: all 0.3s ease;
          }
          .refresh-icon.spinning {
            animation: spin 1s infinite linear;
          }
          .date-range-btn {
            border-radius: 20px;
            padding: 0.25rem 0.75rem;
            font-size: 0.85rem;
            margin-right: 0.5rem;
            transition: all 0.2s ease;
          }
          .date-range-btn.active {
            background-color: #007bff;
            color: white;
            font-weight: 500;
          }
          .theme-toggle {
            cursor: pointer;
            width: 48px;
            height: 24px;
            border-radius: 12px;
            background-color: ${darkMode ? '#007bff' : '#e9ecef'};
            position: relative;
            transition: all 0.3s ease;
          }
          .theme-toggle-circle {
            position: absolute;
            top: 2px;
            left: ${darkMode ? '26px' : '2px'};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${darkMode ? '#343a40' : '#f8f9fa'};
            font-size: 12px;
          }
          .refresh-icon {
            transition: all 0.3s ease;
          }
          .refresh-icon.spinning {
            animation: spin 1s infinite linear;
          }
          .date-range-btn {
            border-radius: 20px;
            padding: 0.25rem 0.75rem;
            font-size: 0.85rem;
            margin-right: 0.5rem;
            transition: all 0.2s ease;
          }
          .date-range-btn.active {
            background-color: #007bff;
            color: white;
            font-weight: 500;
          }
          .theme-toggle {
            cursor: pointer;
            width: 48px;
            height: 24px;
            border-radius: 12px;
            background-color: ${darkMode ? '#007bff' : '#e9ecef'};
            position: relative;
            transition: all 0.3s ease;
          }
          .theme-toggle-circle {
            position: absolute;
            top: 2px;
            left: ${darkMode ? '26px' : '2px'};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${darkMode ? '#343a40' : '#f8f9fa'};
            font-size: 12px;
          }
        `}
      </style>
      
 
      <Card style={{...dashboardStyles.headerCard, ...fadeInAnimation, animationDelay: '0.1s'}} className="mb-4">
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(0,123,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '0 0 0 100%',
          zIndex: 0
        }}></div>
        <Card.Body style={{position: 'relative', zIndex: 1}}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0 fw-bold">Call Analytics Dashboard</h2>
              <p className="text-muted mb-0">Welcome back! Here's your call activity overview</p>
            </div>
            <div className="d-flex align-items-center">
              <div className="bg-light rounded-pill px-3 py-2 d-flex align-items-center">
                <i className="bi bi-calendar3 text-primary me-2"></i>
                <span>{new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

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
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card 
            style={{...dashboardStyles.statCard}} 
            className="h-100"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{height: '4px', background: 'linear-gradient(to right, #007bff, #00c6ff)'}}></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(0,123,255,0.1), rgba(0,198,255,0.1))'}} className="icon-container">
                  <i className="bi bi-telephone-fill text-primary fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Total Calls</h5>
                  <p className="text-muted mb-0 small">All calls in the selected period</p>
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-primary mb-1">{callStats.totalCalls}</h2>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div className="progress-bar bg-primary" style={{width: '100%'}}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card 
            style={{...dashboardStyles.statCard}} 
            className="h-100"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{height: '4px', background: 'linear-gradient(to right, #28a745, #5cb85c)'}}></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(40,167,69,0.1), rgba(92,184,92,0.1))'}} className="icon-container">
                  <i className="bi bi-check-circle-fill text-success fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Successful Calls</h5>
                  <p className="text-muted mb-0 small">Completed without errors</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h2 className="text-success mb-0">{callStats.successfulCalls}</h2>
                  <span className="badge bg-success bg-opacity-10 text-success" style={dashboardStyles.badge}>
                    {Math.round((callStats.successfulCalls / (callStats.totalCalls || 1)) * 100)}% success rate
                  </span>
                </div>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div className="progress-bar bg-success" style={{width: `${Math.round((callStats.successfulCalls / (callStats.totalCalls || 1)) * 100)}%`}}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card 
            style={{...dashboardStyles.statCard}} 
            className="h-100"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{height: '4px', background: 'linear-gradient(to right, #dc3545, #ff6b81)'}}></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(220,53,69,0.1), rgba(255,107,129,0.1))'}} className="icon-container">
                  <i className="bi bi-x-circle-fill text-danger fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Failed Calls</h5>
                  <p className="text-muted mb-0 small">Calls with errors</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h2 className="text-danger mb-0">{callStats.failedCalls}</h2>
                  <span className="badge bg-danger bg-opacity-10 text-danger" style={dashboardStyles.badge}>
                    {Math.round((callStats.failedCalls / (callStats.totalCalls || 1)) * 100)}% failure rate
                  </span>
                </div>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div className="progress-bar bg-danger" style={{width: `${Math.round((callStats.failedCalls / (callStats.totalCalls || 1)) * 100)}%`}}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card 
            style={{...dashboardStyles.statCard}} 
            className="h-100"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{height: '4px', background: 'linear-gradient(to right, #17a2b8, #36c7d0)'}}></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(23,162,184,0.1), rgba(54,199,208,0.1))'}} className="icon-container">
                  <i className="bi bi-clock-fill text-info fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Total Duration</h5>
                  <p className="text-muted mb-0 small">Time spent on calls</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h2 className="text-info mb-0">{formatDuration(callStats.totalDuration)}</h2>
                  <span className="badge bg-info bg-opacity-10 text-info" style={dashboardStyles.badge}>
                    Avg: {formatDuration(Math.round(callStats.totalDuration / (callStats.successfulCalls || 1)))}
                  </span>
                </div>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div className="progress-bar bg-info" style={{width: '100%'}}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      {/* First row with Call Distribution */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card style={dashboardStyles.chartCard}>
            <Card.Header style={dashboardStyles.cardHeader} className="border-bottom-0 pt-3 pb-0">
              <div className="d-flex align-items-center">
                <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(108,117,125,0.05), rgba(173,181,189,0.05))', width: '36px', height: '36px', marginRight: '0.75rem'}}>
                  <i className="bi bi-pie-chart-fill text-primary"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Call Distribution</h5>
                  <p className="text-muted small mb-0">Success vs. Failure Rate</p>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={dashboardStyles.chartContainer} className="chart-container">
                {callDistributionData && callDistributionData.datasets && callDistributionData.datasets.length > 0 ? (
                  <Doughnut 
                    data={callDistributionData} 
                    options={{
                      ...callDistributionOptions,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center text-muted">
                      <i className="bi bi-bar-chart-line fs-1 d-block mb-2 text-secondary"></i>
                      No data available
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card 
            style={{...dashboardStyles.chartCard, height: '100%', ...fadeInAnimation, animationDelay: '0.6s'}}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0.25rem 1rem rgba(0, 0, 0, 0.05)'}
          >
            <Card.Header style={dashboardStyles.cardHeader} className="border-bottom-0 pt-3 pb-0">
              <div className="d-flex align-items-center">
                <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(108,117,125,0.05), rgba(173,181,189,0.05))', width: '36px', height: '36px', marginRight: '0.75rem'}}>
                  <i className="bi bi-graph-up text-success"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Daily Call Trends</h5>
                  <p className="text-muted small mb-0">Call volume by day</p>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{...dashboardStyles.chartContainer, height: '250px'}} className="chart-container">
                {callTrendsData && callTrendsData.datasets && callTrendsData.datasets.length > 0 ? (
                  <Line 
                    data={callTrendsData} 
                    options={{
                      ...callTrendsOptions,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center text-muted">
                      <i className="bi bi-graph-up fs-1 d-block mb-2 text-secondary"></i>
                      No data available
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Second row with Monthly Statistics */}
      <Row className="g-3 mb-4">
        <Col md={12}>
          <Card style={dashboardStyles.chartCard}>
            <Card.Header style={dashboardStyles.cardHeader} className="border-bottom-0 pt-3 pb-0">
              <div className="d-flex align-items-center">
                <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(108,117,125,0.05), rgba(173,181,189,0.05))', width: '36px', height: '36px', marginRight: '0.75rem'}}>
                  <i className="bi bi-calendar3 text-info"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Monthly Statistics</h5>
                  <p className="text-muted small mb-0">Call trends over months</p>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{...dashboardStyles.chartContainer, height: '300px'}} className="chart-container">
                {monthlyStatsData && monthlyStatsData.datasets && monthlyStatsData.datasets.length > 0 ? (
                  <Line 
                    data={monthlyStatsData} 
                    options={{
                      ...callTrendsOptions,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center text-muted">
                      <i className="bi bi-calendar3 fs-1 d-block mb-2 text-secondary"></i>
                      No data available
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card 
        style={{...dashboardStyles.activityCard, ...fadeInAnimation, animationDelay: '0.8s'}}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = darkMode ? '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)' : '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = darkMode ? '0 0.25rem 1rem rgba(0, 0, 0, 0.2)' : '0 0.25rem 1rem rgba(0, 0, 0, 0.05)'}
      >
        <Card.Header style={dashboardStyles.cardHeader} className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center">
              <div style={{...dashboardStyles.iconContainer, background: 'linear-gradient(135deg, rgba(108,117,125,0.05), rgba(173,181,189,0.05))', width: '36px', height: '36px', marginRight: '0.75rem'}}>
                <i className="bi bi-activity text-secondary"></i>
              </div>
              <div>
                <h5 className="card-title mb-0">Recent Activity</h5>
                <p className="text-muted small mb-0">Latest call records</p>
              </div>
            </div>
          </div>
          {recentActivity.length > 0 && (
            <span className="badge bg-primary rounded-pill" style={{fontSize: '0.8rem', padding: '0.35rem 0.75rem'}}>{recentActivity.length}</span>
          )}
        </Card.Header>
        <Card.Body className="p-3">
          {recentActivity.length > 0 ? (
            <div className="position-relative">
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: '24px',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                zIndex: '1'
              }}></div>
              
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id || index} 
                  style={{...dashboardStyles.activityItem, position: 'relative', zIndex: '2', borderLeft: 'none', marginLeft: '20px'}}
                  className="mb-3 ps-4"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 123, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#343a40' : 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-6px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: activity.status === 'success' ? '#28a745' : (activity.status === 'warning' ? '#ffc107' : '#dc3545'),
                    border: darkMode ? '2px solid #343a40' : '2px solid white',
                    zIndex: '3'
                  }}></div>
                  
                  <div className="d-flex align-items-start">
                    <div style={{
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: activity.status === 'success' ? 
                        (darkMode ? 'rgba(40, 167, 69, 0.2)' : 'rgba(40, 167, 69, 0.1)') : 
                        (activity.status === 'warning' ? 
                          (darkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)') : 
                          (darkMode ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)')), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: '1rem',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className={`bi ${activity.status === 'success' ? 'bi-check-lg text-success' : (activity.status === 'warning' ? 'bi-exclamation-triangle text-warning' : 'bi-x-lg text-danger')}`} style={{fontSize: '1.2rem'}}></i>
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0" style={{fontWeight: '600'}}>{activity.user}</h6>
                        <Badge bg={darkMode ? 'dark' : 'light'} text={darkMode ? 'light' : 'dark'} style={{borderRadius: '12px', padding: '0.35rem 0.75rem'}}>
                          <i className="bi bi-clock me-1"></i>
                          {activity.timestamp}
                        </Badge>
                      </div>
                      <p className="mb-0 text-muted small">{activity.details}</p>
                      <div className="mt-1">
                        <Badge bg={activity.status === 'success' ? 'success' : (activity.status === 'warning' ? 'warning' : 'danger')} style={{opacity: 0.8, fontSize: '0.7rem'}}>
                          {activity.status === 'success' ? 'SUCCESSFUL' : (activity.status === 'warning' ? 'WARNING' : 'FAILED')}
                        </Badge>
                        {activity.duration && (
                          <Badge bg={darkMode ? 'secondary' : 'light'} text={darkMode ? 'light' : 'dark'} className="ms-2" style={{fontSize: '0.7rem'}}>
                            {activity.duration} min
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div style={{width: '70px', height: '70px', borderRadius: '50%', backgroundColor: darkMode ? 'rgba(108, 117, 125, 0.2)' : 'rgba(108, 117, 125, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'}}>
                <i className="bi bi-activity text-muted" style={{fontSize: '2rem'}}></i>
              </div>
              <h6 className="mb-1">No Recent Activity</h6>
              <p className="mb-3 text-muted small">Call activity will appear here</p>
              <Button variant="outline-primary" size="sm" onClick={refreshData}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Data
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;