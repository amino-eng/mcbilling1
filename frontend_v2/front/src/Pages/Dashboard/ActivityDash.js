import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CircularProgress, Badge } from '@mui/material';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Register necessary components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function AdminDashboardContent() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState([null, null]);
  const [tasks, setTasks] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [notifications, setNotifications] = useState(3); // Badge example for notifications

  const fetchActiveUsers = () => {
    axios.get("http://localhost:5000/api/admin/users/users")
      .then((response) => {
        const activeCount = response.data.users.filter(user => user.active === 1).length;
        setActiveUsers(activeCount);
      })
      .catch((err) => {
        console.error('Error fetching active users:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActiveUsers();
    // Live data stream setup
    const interval = setInterval(() => {
      fetchLiveData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate fetching live data
  const fetchLiveData = () => {
    console.log("Fetching live data...");
    // You can integrate real-time data here (e.g., WebSocket or API calls)
  };

  // Example Data for charts
  const weeklyRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Weekly Revenue',
        data: [300, 400, 450, 500, 600, 700, 800],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const dailyTrafficData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Traffic',
        data: [50, 100, 150, 200, 250, 300, 350],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  // Add task to the To-Do list
  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  return (
    <div className="container-fluid">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2>Main Dashboard</h2>
        <div>
          <button className="btn btn-primary me-2">Add New Activity</button>
          <Badge badgeContent={notifications} color="primary">
            <button className="btn btn-warning">Notifications</button>
          </Badge>
        </div>
      </header>

      {/* Date Range Filter */}
      <div className="mb-3">
        <h5>Filter Data:</h5>
        <label htmlFor="dateRangePicker">Select Date Range:</label>
        <DatePicker
          selected={selectedDate[0]}
          onChange={(date) => setSelectedDate([date, selectedDate[1]])}
          selectsStart
          startDate={selectedDate[0]}
          endDate={selectedDate[1]}
          placeholderText="Start Date"
          className="form-control mb-2"
        />
        <DatePicker
          selected={selectedDate[1]}
          onChange={(date) => setSelectedDate([selectedDate[0], date])}
          selectsEnd
          startDate={selectedDate[0]}
          endDate={selectedDate[1]}
          minDate={selectedDate[0]}
          placeholderText="End Date"
          className="form-control"
        />
      </div>

      {/* Main Content */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Earnings</h5>
              <h2 className="card-text">{loading ? <CircularProgress color="inherit" /> : `$${activeUsers * 100}`}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Sales</h5>
              <h2 className="card-text">{loading ? <CircularProgress color="inherit" /> : `$${activeUsers * 150}`}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Active Users</h5>
              <h2 className="card-text">{loading ? <CircularProgress color="inherit" /> : activeUsers}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Weekly Revenue</h5>
              <Bar data={weeklyRevenueData} options={{ responsive: true }} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Daily Traffic</h5>
              <Line data={dailyTrafficData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>

      {/* Task Management Section */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">To-Do List</h5>
              <ul className="list-group">
                {tasks.map((task, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    {task}
                    <button className="btn btn-sm btn-danger" onClick={() => setTasks(tasks.filter((t, i) => i !== index))}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <button className="btn btn-secondary mt-2" onClick={() => addTask("New Task")}>Add Task</button>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Recent Activities</h5>
              <ul className="list-group">
                {activities.map(activity => (
                  <li key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {activity.description}
                    <span className="badge bg-primary">{activity.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
