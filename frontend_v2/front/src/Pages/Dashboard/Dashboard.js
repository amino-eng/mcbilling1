import React, { useState, useEffect } from "react";
import { Card, Row, Col, Alert, Spinner, Button, Badge } from "react-bootstrap";
import { Line, Doughnut } from "react-chartjs-2";

import axios from "axios";
import { PowerBIEmbed } from "powerbi-client-react"; // Import PowerBIEmbed component
import { models } from "powerbi-client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

// PowerBI Report Component
const PowerBIReport = () => {
  return (
    <div className="powerbi-container">
      <iframe
        title="CDR Analytics"
        className="powerbi-frame"
        src="YOUR_POWERBI_EMBED_URL_HERE"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

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
      padding: "1.5rem",
      backgroundColor: "#f8f9fa",
      backgroundImage: "linear-gradient(to bottom, #f8f9fa, #ffffff)",
      minHeight: "100vh",
      transition: "all 0.3s ease",
    },
    headerCard: {
      borderLeft: "4px solid #007bff",
      boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.05)",
      marginBottom: "1.5rem",
      borderRadius: "0.75rem",
      background: "linear-gradient(135deg, #ffffff, #f8f9fa)",
      overflow: "hidden",
      position: "relative",
    },
    statCard: {
      borderRadius: "0.75rem",
      boxShadow: "0 0.25rem 1rem rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s ease",
      height: "100%",
      overflow: "hidden",
      border: "none",
    },
    statCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)",
    },
    chartCard: {
      borderRadius: "0.75rem",
      boxShadow: "0 0.25rem 1rem rgba(0, 0, 0, 0.05)",
      height: "100%",
      border: "none",
      overflow: "hidden",
    },
    chartContainer: {
      height: "250px",
      position: "relative",
    },
    activityCard: {
      borderRadius: "0.75rem",
      boxShadow: "0 0.25rem 1rem rgba(0, 0, 0, 0.05)",
      border: "none",
      overflow: "hidden",
      transition: "all 0.3s ease",
    },
    activityItem: {
      borderLeft: "3px solid #dee2e6",
      padding: "0.75rem 1rem",
      marginBottom: "0.5rem",
      backgroundColor: "white",
      borderRadius: "0.5rem",
      display: "flex",
      alignItems: "center",
      transition: "all 0.2s ease",
      boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.03)",
    },
    activityItemHover: {
      transform: "translateX(5px)",
      boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.05)",
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      marginRight: "1rem",
    },
    cardHeader: {
      background: "linear-gradient(to right, #ffffff, #f8f9fa)",
      borderBottom: "none",
      padding: "1.25rem 1.5rem 0.75rem",
    },
    progressBar: {
      height: "8px",
      borderRadius: "4px",
      marginTop: "0.5rem",
    },
    badge: {
      padding: "0.5rem 0.75rem",
      fontWeight: "500",
      borderRadius: "50rem",
    },
  });

  // Dark theme styles
  const getDarkTheme = () => ({
    container: {
      padding: "1.5rem",
      backgroundColor: "#212529",
      backgroundImage: "linear-gradient(to bottom, #212529, #343a40)",
      minHeight: "100vh",
      transition: "all 0.3s ease",
      color: "#e9ecef",
    },
    headerCard: {
      borderLeft: "4px solid #007bff",
      boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)",
      marginBottom: "1.5rem",
      borderRadius: "0.75rem",
      background: "linear-gradient(135deg, #343a40, #212529)",
      overflow: "hidden",
      position: "relative",
    },
    statCard: {
      borderRadius: "0.75rem",
      boxShadow: "0 0.25rem 1rem rgba(0, 0, 0, 0.2)",
      transition: "all 0.3s ease",
      height: "100%",
      overflow: "hidden",
      border: "none",
      backgroundColor: "#343a40",
      color: "#e9ecef",
    },
    statCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)",
    },
    chartCard: {
      borderRadius: "0.75rem",
      boxShadow: "0 0.25rem 1rem rgba(0, 0, 0, 0.2)",
      height: "100%",
      border: "none",
      overflow: "hidden",
      backgroundColor: "#343a40",
      color: "#e9ecef",
    },
    chartContainer: {
      height: "250px",
      position: "relative",
    },
    activityCard: {
      borderRadius: "0.75rem",
      boxShadow: "0 0.25rem 1rem rgba(0, 0, 0, 0.2)",
      border: "none",
      overflow: "hidden",
      backgroundColor: "#343a40",
      color: "#e9ecef",
      transition: "all 0.3s ease",
    },
    activityItem: {
      borderLeft: "3px solid #495057",
      padding: "0.75rem 1rem",
      marginBottom: "0.5rem",
      backgroundColor: "#343a40",
      borderRadius: "0.5rem",
      display: "flex",
      alignItems: "center",
      transition: "all 0.2s ease",
      boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.1)",
    },
    activityItemHover: {
      transform: "translateX(5px)",
      boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)",
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      marginRight: "1rem",
    },
    cardHeader: {
      background: "linear-gradient(to right, #343a40, #212529)",
      borderBottom: "none",
      padding: "1.25rem 1.5rem 0.75rem",
      color: "#e9ecef",
    },
    progressBar: {
      height: "8px",
      borderRadius: "4px",
      marginTop: "0.5rem",
    },
    badge: {
      padding: "0.5rem 0.75rem",
      fontWeight: "500",
      borderRadius: "50rem",
    },
  });

  // State for theme
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("week"); // 'day', 'week', 'month', 'year'

  // Get theme based on dark mode state
  const dashboardStyles = darkMode ? getDarkTheme() : getLightTheme();

  const [loading, setLoading] = useState({
    callTrends: false,
    recentActivity: false,
    callStats: false,
  });

  const [error, setError] = useState({
    callTrends: "",
    recentActivity: "",
    callStats: "",
  });
  const [callTrendsData, setCallTrendsData] = useState({
    labels: [],
    datasets: [],
  });
  const [monthlyStatsData, setMonthlyStatsData] = useState({
    labels: [],
    datasets: [],
  });
  const [callTrendsOptions, setCallTrendsOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    animation: false,
  });
  const [callDistributionData, setCallDistributionData] = useState({
    labels: ["Successful", "Failed"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["#28a745", "#dc3545"],
        hoverOffset: 4,
      },
    ],
  });
  const [callDistributionOptions, setCallDistributionOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "50%",
    animation: false,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalDuration: 0,
    totalBuyPrice: 0,
    totalSellPrice: 0,
  });

  const [userCallStats, setUserCallStats] = useState([]);
  const [userMonthlyCallStats, setUserMonthlyCallStats] = useState([]);
  const [loadingUserStats, setLoadingUserStats] = useState(true);
  const [loadingMonthlyUserStats, setLoadingMonthlyUserStats] = useState(true);

  // Fetch user call statistics
  const fetchUserCallStats = async () => {
    setLoadingUserStats(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/SummaryDayUser/stats/user-calls"
      );
      setUserCallStats(response.data);
    } catch (error) {
      console.error("Error fetching user call stats:", error);
    } finally {
      setLoadingUserStats(false);
    }
  };

  // Fetch monthly user call statistics
  const fetchUserMonthlyCallStats = async () => {
    setLoadingMonthlyUserStats(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/SummaryMonthUser/stats/user-monthly-stats"
      );
      setUserMonthlyCallStats(response.data);
    } catch (error) {
      console.error("Error fetching monthly user call stats:", error);
    } finally {
      setLoadingMonthlyUserStats(false);
    }
  };

  useEffect(() => {
    fetchUserCallStats();
    fetchUserMonthlyCallStats();
  }, []);

  useEffect(() => {
    // Initialize chart options
    setCallTrendsOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of calls",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
    });

    setCallDistributionOptions({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "50%",
    });

    // Fetch initial data
    const fetchData = async () => {
      try {
        await fetchCallSummaryData();
        await fetchRecentActivity();
        await fetchCallStats();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError((prev) => ({
          ...prev,
          callTrends: "Failed to load call trends",
          recentActivity: "Failed to load recent activity",
          callStats: "Failed to load call stats",
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchCallSummaryData = async () => {
    setLoading((prev) => ({ ...prev, callTrends: true }));
    try {
      const today = new Date();
      const date = today.toISOString().split("T")[0];

      const response = await axios.get(
        `http://localhost:5000/api/admin/SummaryPerDay`,
        {
          params: {
            date: date,
          },
        }
      );
      console.log("Summary Per Day Response:", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        const summaryData = response.data.data;

        // Sort data by day
        summaryData.sort((a, b) => new Date(a.day) - new Date(b.day));

        // Extract labels (days) and call volumes
        const labels = summaryData.map((day) => {
          const date = new Date(day.day);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        });

        const callVolumes = summaryData.map((day) => day.nbcall || 0);
        const failedVolumes = summaryData.map((day) => day.nbcall_fail || 0);
        const successVolumes = summaryData.map(
          (day) => (day.nbcall || 0) - (day.nbcall_fail || 0)
        );

        // Update call trends data
        setCallTrendsData({
          labels,
          datasets: [
            {
              label: "Total Calls",
              data: callVolumes,
              fill: false,
              borderColor: "#007bff",
              backgroundColor: "rgba(0, 123, 255, 0.1)",
              tension: 0.1,
              order: 1,
              yAxisID: "y",
            },
            {
              label: "Successful Calls",
              data: successVolumes,
              fill: false,
              borderColor: "#28a745",
              backgroundColor: "rgba(40, 167, 69, 0.1)",
              tension: 0.1,
              order: 2,
              yAxisID: "y",
            },
            {
              label: "Failed Calls",
              data: failedVolumes,
              fill: false,
              borderColor: "#dc3545",
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              tension: 0.1,
              order: 3,
              yAxisID: "y",
            },
          ],
        });

        // Fetch monthly statistics
        const monthlyResponse = await axios.get(
          `http://localhost:5000/api/admin/SummaryPerMonth`
        );
        console.log("Summary Per Month Response:", monthlyResponse.data);

        // Process monthly statistics
        const monthlyData = monthlyResponse.data && monthlyResponse.data.data;
        const monthlyStats =
          monthlyData && Array.isArray(monthlyData)
            ? {
                labels: monthlyData.map((item) => item.month),
                datasets: [
                  {
                    label: "Successful Calls",
                    data: monthlyData.map(
                      (item) => item.nbcall - item.nbcall_fail
                    ),
                    borderColor: "#4CAF50",
                    backgroundColor: "rgba(76, 175, 80, 0.2)",
                    fill: true,
                  },
                  {
                    label: "Failed Calls",
                    data: monthlyData.map((item) => item.nbcall_fail),
                    borderColor: "#f44336",
                    backgroundColor: "rgba(244, 67, 54, 0.2)",
                    fill: true,
                  },
                ],
              }
            : {
                labels: [],
                datasets: [],
              };
        setMonthlyStatsData(monthlyStats);
      }
    } catch (error) {
      console.error("Error fetching call trends:", error);
      setError((prev) => ({
        ...prev,
        callTrends: "Failed to load call trends",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, callTrends: false }));
    }
  };

  const fetchRecentActivity = async () => {
    setLoading((prev) => ({ ...prev, recentActivity: true }));
    try {
      // Fetch CDR data
      const cdrResponse = await axios.get(
        "http://localhost:5000/api/admin/CDR/affiche"
      );

      // Fetch user history
      const userHistoryResponse = await axios.get(
        "http://localhost:5000/api/admin/UserHistory/affiche"
      );

      const activities = [];

      // Process CDR data
      if (cdrResponse.data && Array.isArray(cdrResponse.data)) {
        const recentCalls = cdrResponse.data.slice(0, 5).map((call) => ({
          id: `call-${call.id || Math.random().toString(36).substr(2, 9)}`,
          type: "call",
          user: call.src || "Unknown",
          timestamp: new Date(call.calldate || Date.now()).toLocaleString(),
          status: call.disposition === "ANSWERED" ? "success" : "danger",
          details: `${
            call.disposition === "ANSWERED" ? "Successful" : "Failed"
          } call to ${call.dst || "Unknown"}`,
        }));

        activities.push(...recentCalls);
      }

      // Process user history data
      if (userHistoryResponse.data && Array.isArray(userHistoryResponse.data)) {
        const userActivities = userHistoryResponse.data
          .slice(0, 5)
          .map((activity) => ({
            id: `activity-${
              activity.id || Math.random().toString(36).substr(2, 9)
            }`,
            type: "user",
            user: activity.username || "Unknown",
            timestamp: new Date(activity.date || Date.now()).toLocaleString(),
            status: "info",
            details: activity.description || "User activity",
          }));

        activities.push(...userActivities);
      }

      // Sort activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Take the 10 most recent activities
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching activity data:", error);
      setError((prev) => ({
        ...prev,
        recentActivity: "Failed to load recent activity",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, recentActivity: false }));
    }
  };

  const fetchCallStats = async () => {
    setLoading((prev) => ({ ...prev, callStats: true }));
    try {
      // Fetch all CDR data (both successful and failed)
      const [successResponse, failedResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/CDR/affiche"),
        axios.get("http://localhost:5000/api/admin/CdrFailed/affiche"),
      ]);

      console.log("CDR Response:", successResponse.data);
      console.log("Failed CDR Response:", failedResponse?.data);

      // Process successful CDR data
      let successData = [];
      let uniqueCalls = [];
      const seenCallIds = new Set();

      if (successResponse.data && Array.isArray(successResponse.data.cdr)) {
        console.log("Raw CDR data count:", successResponse.data.cdr.length);

        // First, filter out duplicates based on call ID
        uniqueCalls = successResponse.data.cdr.filter((call) => {
          if (!call.id) return false; // Skip if no ID
          if (seenCallIds.has(call.id)) {
            console.log("Found duplicate call ID:", call.id);
            return false;
          }
          seenCallIds.add(call.id);
          return true;
        });

        console.log("Unique calls after deduplication:", uniqueCalls.length);

        // Now filter successful calls from unique calls
        successData = uniqueCalls.filter((call) => {
          const hasSessionTime = parseFloat(call.sessiontime) > 0;
          const isAnswered = call.disposition === "ANSWERED";
          const isTerminatedNormally =
            call.terminatecauseid === "16" || call.terminatecauseid === 16;

          // Log the first few calls for debugging
          if (successData.length < 3) {
            console.log("Call details:", {
              id: call.id,
              sessiontime: call.sessiontime,
              disposition: call.disposition,
              terminatecauseid: call.terminatecauseid,
              isSuccessful:
                hasSessionTime || isAnswered || isTerminatedNormally,
            });
          }

          return hasSessionTime || isAnswered || isTerminatedNormally;
        });
      }

      // Process failed CDR data
      let failedData = [];
      if (
        failedResponse?.data?.cdr_failed &&
        Array.isArray(failedResponse.data.cdr_failed)
      ) {
        failedData = failedResponse.data.cdr_failed;
      }

      // Calculate statistics
      const successfulCalls = successData.length;
      const failedCalls = failedData.length;
      const totalCalls = successfulCalls + failedCalls;

      console.log("Total calls from API:", totalCalls);

      // Calculate total duration, buy price and sell price
      let totalDuration = 0;
      let totalBuyPrice = 0;
      let totalSellPrice = 0;

      // Process successful calls
      for (const call of successData) {
        totalDuration += parseFloat(call.sessiontime || 0);
        totalBuyPrice += parseFloat(call.buycost || 0);
        totalSellPrice += parseFloat(call.sessionbill || 0);
      }

      // Process failed calls
      for (const call of failedData) {
        totalBuyPrice += parseFloat(call.buycost || 0);
        totalSellPrice += parseFloat(call.sessionbill || 0);
      }

      // Round to 4 decimal places to avoid floating point precision issues
      totalBuyPrice = parseFloat(totalBuyPrice.toFixed(4));
      totalSellPrice = parseFloat(totalSellPrice.toFixed(4));

      console.log("Total buy price:", totalBuyPrice);
      console.log("Total sell price:", totalSellPrice);
      console.log("Total duration:", totalDuration);

      // Update call stats
      setCallStats({
        totalCalls,
        successfulCalls,
        failedCalls,
        totalDuration,
        totalBuyPrice,
        totalSellPrice,
      });

      // Update call distribution data
      setCallDistributionData({
        labels: ["Successful", "Failed"],
        datasets: [
          {
            data: [successfulCalls, failedCalls],
            backgroundColor: ["#28a745", "#dc3545"],
            hoverOffset: 4,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching call stats:", error);
      setError((prev) => ({
        ...prev,
        callStats: error.message || "Failed to load call stats",
      }));
      setCallStats({
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalDuration: 0,
        totalBuyPrice: 0,
        totalSellPrice: 0,
      });
      setCallDistributionData({
        labels: ["Successful", "Failed"],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ["#28a745", "#dc3545"],
            hoverOffset: 4,
          },
        ],
      });
    } finally {
      setLoading((prev) => ({ ...prev, callStats: false }));
    }
  };

  // Custom animation for cards
  const fadeInAnimation = {
    opacity: 0,
    animation: "fadeIn 0.6s ease-in-out forwards",
    animationDelay: "0.2s",
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
      fetchCallStats(),
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
    const textColor = darkMode ? "#e9ecef" : "#666";
    const gridColor = darkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";

    // Update options for all charts with safe access to nested properties
    setCallTrendsOptions((prev) => {
      // Create a safe copy of the previous options
      const safeOptions = { ...prev };

      // Ensure scales and its properties exist
      if (!safeOptions.scales) safeOptions.scales = {};
      if (!safeOptions.scales.x) safeOptions.scales.x = {};
      if (!safeOptions.scales.y) safeOptions.scales.y = {};

      // Ensure plugins and legend exist
      if (!safeOptions.plugins) safeOptions.plugins = {};
      if (!safeOptions.plugins.legend) safeOptions.plugins.legend = {};
      if (!safeOptions.plugins.legend.labels)
        safeOptions.plugins.legend.labels = {};

      return {
        ...safeOptions,
        scales: {
          ...safeOptions.scales,
          x: {
            ...safeOptions.scales.x,
            grid: { color: gridColor },
            ticks: { color: textColor },
          },
          y: {
            ...safeOptions.scales.y,
            grid: { color: gridColor },
            ticks: { color: textColor },
          },
        },
        plugins: {
          ...safeOptions.plugins,
          legend: {
            ...safeOptions.plugins.legend,
            labels: { ...safeOptions.plugins.legend.labels, color: textColor },
          },
        },
      };
    });

    // Only update monthly stats if they exist
    if (
      monthlyStatsData &&
      monthlyStatsData.datasets &&
      monthlyStatsData.datasets.length > 0
    ) {
      // We'll update the monthly stats options in the future if needed
      // For now, we'll skip this part as setMonthlyStatsOptions is not defined
    }

    // Update call distribution options with safe access
    setCallDistributionOptions((prev) => {
      // Create a safe copy of the previous options
      const safeOptions = { ...prev };

      // Ensure plugins and legend exist
      if (!safeOptions.plugins) safeOptions.plugins = {};
      if (!safeOptions.plugins.legend) safeOptions.plugins.legend = {};
      if (!safeOptions.plugins.legend.labels)
        safeOptions.plugins.legend.labels = {};

      return {
        ...safeOptions,
        plugins: {
          ...safeOptions.plugins,
          legend: {
            ...safeOptions.plugins.legend,
            labels: { ...safeOptions.plugins.legend.labels, color: textColor },
          },
        },
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
            background-color: ${darkMode ? "#007bff" : "#e9ecef"};
            position: relative;
            transition: all 0.3s ease;
          }
          .theme-toggle-circle {
            position: absolute;
            top: 2px;
            left: ${darkMode ? "26px" : "2px"};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${darkMode ? "#343a40" : "#f8f9fa"};
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
            background-color: ${darkMode ? "#007bff" : "#e9ecef"};
            position: relative;
            transition: all 0.3s ease;
          }
          .theme-toggle-circle {
            position: absolute;
            top: 2px;
            left: ${darkMode ? "26px" : "2px"};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${darkMode ? "#343a40" : "#f8f9fa"};
            font-size: 12px;
          }
        `}
      </style>

      <Card
        style={{
          ...dashboardStyles.headerCard,
          ...fadeInAnimation,
          animationDelay: "0.1s",
        }}
        className="mb-4"
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "150px",
            height: "150px",
            background:
              "radial-gradient(circle, rgba(0,123,255,0.1) 0%, rgba(255,255,255,0) 70%)",
            borderRadius: "0 0 0 100%",
            zIndex: 0,
          }}
        ></div>
        <Card.Body style={{ position: "relative", zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0 fw-bold">Call Analysis Dashboard</h2>
              <p className="text-muted mb-0">
                Welcome back! Here's an overview of your call activity
              </p>
            </div>
            <div className="d-flex align-items-center">
              <div className="bg-light rounded-pill px-3 py-2 d-flex align-items-center">
                <i className="bi bi-calendar3 text-primary me-2"></i>
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
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

      {/* First Row: Total Calls, Buy Price, Sell Price */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card
            style={{ ...dashboardStyles.statCard }}
            className="h-100"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                height: "4px",
                background: "linear-gradient(to right, #007bff, #00c6ff)",
              }}
            ></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    ...dashboardStyles.iconContainer,
                    background:
                      "linear-gradient(135deg, rgba(0,123,255,0.1), rgba(0,198,255,0.1))",
                  }}
                  className="icon-container"
                >
                  <i className="bi bi-telephone-fill text-primary fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Total Calls</h5>
                  <p className="text-muted mb-0 small">
                    All calls in the selected period
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-primary mb-1">{callStats.totalCalls}</h2>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            style={{ ...dashboardStyles.statCard }}
            className="h-100"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                height: "4px",
                background: "linear-gradient(to right, #20c997, #3dd5f3)",
              }}
            ></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    ...dashboardStyles.iconContainer,
                    background:
                      "linear-gradient(135deg, rgba(32,201,151,0.1), rgba(61,213,243,0.1))",
                  }}
                  className="icon-container"
                >
                  <i className="bi bi-currency-dollar text-success fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Total Buy Price</h5>
                  <p className="text-muted mb-0 small">Total cost of calls</p>
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-success mb-1">
                  {callStats.totalBuyPrice !== undefined &&
                  callStats.totalBuyPrice !== null
                    ? callStats.totalBuyPrice.toFixed(2)
                    : "0.00"}
                </h2>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            style={{ ...dashboardStyles.statCard }}
            className="h-100"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                height: "4px",
                background: "linear-gradient(to right, #6f42c1, #9c27b0)",
              }}
            ></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    ...dashboardStyles.iconContainer,
                    background:
                      "linear-gradient(135deg, rgba(111,66,193,0.1), rgba(156,39,176,0.1))",
                  }}
                  className="icon-container"
                >
                  <i className="bi bi-cash-coin text-purple fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Total Sell Price</h5>
                  <p className="text-muted mb-0 small">
                    Total revenue from calls
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-purple mb-1">
                  {callStats.totalSellPrice !== undefined &&
                  callStats.totalSellPrice !== null
                    ? callStats.totalSellPrice.toFixed(2)
                    : "0.00"}
                </h2>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div
                    className="progress-bar bg-purple"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Second Row: Successful Calls and Failed Calls */}
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card
            style={{ ...dashboardStyles.statCard }}
            className="h-100"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                height: "4px",
                background: "linear-gradient(to right, #28a745, #20c997)",
              }}
            ></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    ...dashboardStyles.iconContainer,
                    background:
                      "linear-gradient(135deg, rgba(40,167,69,0.1), rgba(32,201,151,0.1))",
                  }}
                  className="icon-container"
                >
                  <i className="bi bi-check-circle-fill text-success fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Successful Calls</h5>
                  <p className="text-muted mb-0 small">
                    Successfully connected calls
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-success mb-1">{callStats.successfulCalls}</h2>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${callStats.totalCalls > 0 ? (callStats.successfulCalls / callStats.totalCalls) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card
            style={{ ...dashboardStyles.statCard }}
            className="h-100"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                height: "4px",
                background: "linear-gradient(to right, #dc3545, #fd7e14)",
              }}
            ></div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    ...dashboardStyles.iconContainer,
                    background:
                      "linear-gradient(135deg, rgba(220,53,69,0.1), rgba(253,126,20,0.1))",
                  }}
                  className="icon-container"
                >
                  <i className="bi bi-x-circle-fill text-danger fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Failed Calls</h5>
                  <p className="text-muted mb-0 small">
                    Unsuccessful call attempts
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-danger mb-1">{callStats.failedCalls}</h2>
                <div className="progress" style={dashboardStyles.progressBar}>
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${callStats.totalCalls > 0 ? (callStats.failedCalls / callStats.totalCalls) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section - Call Distribution */}
      <Row className="g-3 mb-4">
        <Col md={12}>
          <Card style={dashboardStyles.chartCard}>
            <Card.Header
              style={dashboardStyles.cardHeader}
              className="border-bottom-0 pt-3 pb-0"
            >
              <div className="d-flex align-items-center">
                <div
                  style={{
                    ...dashboardStyles.iconContainer,
                    background:
                      "linear-gradient(135deg, rgba(108,117,125,0.05), rgba(173,181,189,0.05))",
                    width: "36px",
                    height: "36px",
                    marginRight: "0.75rem",
                  }}
                >
                  <i className="bi bi-pie-chart-fill text-primary"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Call Distribution</h5>
                  <p className="text-muted small mb-0">
                    Successful vs. Failed Calls
                  </p>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div
                style={{ ...dashboardStyles.chartContainer, height: "300px" }}
                className="chart-container"
              >
                {callDistributionData &&
                callDistributionData.datasets &&
                callDistributionData.datasets.length > 0 ? (
                  <Doughnut
                    data={callDistributionData}
                    options={{
                      ...callDistributionOptions,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || "";
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce(
                                (a, b) => a + b,
                                0
                              );
                              const percentage = Math.round(
                                (value / total) * 100
                              );
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
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
      </Row>

      {/* Daily User Call Statistics */}
      <Card
        style={{
          ...dashboardStyles.chartCard,
          ...fadeInAnimation,
          animationDelay: "0.7s",
          marginBottom: "1.5rem",
        }}
      >
        <Card.Header
          style={dashboardStyles.cardHeader}
          className="border-bottom-0 pt-3 pb-0"
        >
          <div className="d-flex align-items-center">
            <div
              style={{
                ...dashboardStyles.iconContainer,
                background:
                  "linear-gradient(135deg, rgba(108,117,125,0.05), rgba(173,181,189,0.05))",
                width: "36px",
                height: "36px",
                marginRight: "0.75rem",
              }}
            >
              <i className="bi bi-people-fill text-primary"></i>
            </div>
            <div>
              <h5 className="card-title mb-0">Daily User Call Statistics</h5>
              <p className="text-muted small mb-0">
                Top 5 users by call volume (Today)
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {loadingUserStats ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 mb-0">Loading user statistics...</p>
            </div>
          ) : userCallStats.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th className="text-end">Total Calls</th>
                    <th className="text-end">Answered</th>
                    <th className="text-end">Failed</th>
                    <th className="text-end">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {userCallStats.map((user, index) => (
                    <tr key={`daily-${index}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm me-2">
                            <div className="avatar-title rounded-circle bg-soft-primary text-primary">
                              {user.username
                                ? user.username.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          </div>
                          <div>
                            <h6 className="mb-0">
                              {user.username || "Unknown"}
                            </h6>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">{user.total_calls}</td>
                      <td className="text-end text-success">
                        {user.answered_calls}
                      </td>
                      <td className="text-end text-danger">
                        {user.failed_calls}
                      </td>
                      <td className="text-end">
                        {formatDuration(user.total_duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-people fs-1 text-muted mb-2 d-block"></i>
              <p className="text-muted mb-0">
                No daily user statistics available
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Monthly User Call Statistics */}
      <Card
        style={{
          ...dashboardStyles.chartCard,
          ...fadeInAnimation,
          animationDelay: "0.75s",
          marginBottom: "1.5rem",
        }}
      >
        <Card.Header
          style={dashboardStyles.cardHeader}
          className="border-bottom-0 pt-3 pb-0"
        >
          <div className="d-flex align-items-center">
            <div
              style={{
                ...dashboardStyles.iconContainer,
                background:
                  "linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,220,57,0.1))",
                width: "36px",
                height: "36px",
                marginRight: "0.75rem",
              }}
            >
              <i className="bi bi-calendar2-month-fill text-warning"></i>
            </div>
            <div>
              <h5 className="card-title mb-0">Monthly User Call Statistics</h5>
              <p className="text-muted small mb-0">
                Top users by call volume (Current Month)
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {loadingMonthlyUserStats ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="warning" />
              <p className="mt-2 mb-0">Loading monthly user statistics...</p>
            </div>
          ) : userMonthlyCallStats.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th className="text-end">Month</th>
                    <th className="text-end">Total Calls</th>
                    <th className="text-end">Answered</th>
                    <th className="text-end">Failed</th>
                    <th className="text-end">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {userMonthlyCallStats.map((user, index) => (
                    <tr key={`monthly-${index}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm me-2">
                            <div className="avatar-title rounded-circle bg-soft-warning text-warning">
                              {user.username
                                ? user.username.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          </div>
                          <div>
                            <h6 className="mb-0">
                              {user.username || "Unknown"}
                            </h6>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">{user.month}</td>
                      <td className="text-end">{user.total_calls}</td>
                      <td className="text-end text-success">
                        {user.answered_calls}
                      </td>
                      <td className="text-end text-danger">
                        {user.failed_calls}
                      </td>
                      <td className="text-end">
                        {formatDuration(user.total_duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-calendar2-month fs-1 text-muted mb-2 d-block"></i>
              <p className="text-muted mb-0">
                No monthly user statistics available
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Recent Activity */}
 

      <Card
        style={{
          ...dashboardStyles.activityCard,
          ...fadeInAnimation,
          animationDelay: "0.8s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = darkMode
            ? "0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)"
            : "0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = darkMode
            ? "0 0.25rem 1rem rgba(0, 0, 0, 0.2)"
            : "0 0.25rem 1rem rgba(0, 0, 0, 0.05)")
        }
      >
        <Card.Header
          style={dashboardStyles.cardHeader}
          className="d-flex justify-content-between align-items-center"
        >
          <div>
            <div className="d-flex align-items-center">
              <div
                style={{
                  ...dashboardStyles.iconContainer,
                  background:
                    "linear-gradient(135deg, rgba(108,117,125,0.05), rgba(173,181,189,0.05))",
                  width: "36px",
                  height: "36px",
                  marginRight: "0.75rem",
                }}
              >
                <i className="bi bi-bar-chart-fill text-primary"></i>
              </div>
              <div>
                <h5 className="card-title mb-0">CDR Analytics Dashboard</h5>
                <p className="text-muted small mb-0">
                  Detailed call data analysis
                </p>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-3">
          <PowerBIEmbed
            embedConfig={{
              type: "report",
              id: "22784ba6-c4f2-4b2c-a0f8-6708a114b06f", // Your report ID
              embedUrl:
                "https://app.powerbi.com/reportEmbed?reportId=22784ba6-c4f2-4b2c-a0f8-6708a114b06f&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUZSQU5DRS1DRU5UUkFMLUEtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d",
              accessToken:
                "eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUZSQU5DRS1DRU5UUkFMLUEtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ",
              tokenType: models.TokenType.Embed, // Azure AD token
              settings: {
                panes: {
                  filters: {
                    expanded: false,
                    visible: false,
                  },
                },
                background: models.BackgroundType.Transparent,
              },
            }}
            eventHandlers={
              new Map([
                [
                  "loaded",
                  function () {
                    console.log("Report loaded");
                  },
                ],
                [
                  "rendered",
                  function () {
                    console.log("Report rendered");
                  },
                ],
                [
                  "error",
                  function (event) {
                    console.log(event.detail);
                  },
                ],
                ["visualClicked", () => console.log("visual clicked")],
                ["pageChanged", (event) => console.log(event)],
              ])
            }
            cssClassName={"reportClass"}
            getEmbeddedComponent={(embeddedReport) => {
              window.report = embeddedReport;
            }}
          />
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;
