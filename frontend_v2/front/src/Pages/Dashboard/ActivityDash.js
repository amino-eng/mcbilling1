"use client"

import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Chart, registerables } from 'chart.js'
import { Doughnut, Line, Bar } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Register Chart.js components
Chart.register(...registerables, ChartDataLabels)

export default function AdminDashboardContent() {
  const [stats, setStats] = useState({
    revenue: { value: 12500, change: 25 },
    users: { value: 1250, change: 12 },
    satisfaction: { value: 92, change: 5 },
    orders: { value: 456, change: 18 },
    conversion: { value: 4.2, change: 3.5 },
    bounceRate: { value: 28.5, change: -2.1 }
  })

  const [activities, setActivities] = useState([
    {
      id: 1,
      icon: "fas fa-user-plus",
      description: "New user registered",
      timestamp: "10 min ago",
      type: "success"
    },
    {
      id: 2,
      icon: "fas fa-file-alt",
      description: "Sales report generated",
      timestamp: "1 hour ago",
      type: "info"
    },
    {
      id: 3,
      icon: "fas fa-cog",
      description: "System update completed",
      timestamp: "3 hours ago",
      type: "warning"
    },
    {
      id: 4,
      icon: "fas fa-box",
      description: "New product added",
      timestamp: "5 hours ago",
      type: "primary"
    }
  ])

  const [tasks, setTasks] = useState([
    { id: 1, text: "Review quarterly reports", completed: false },
    { id: 2, text: "Update product pricing", completed: false },
    { id: 3, text: "Schedule team meeting", completed: true },
    { id: 4, text: "Prepare sales presentation", completed: false }
  ])

  // Advanced Chart Data
  const revenueData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        data: [15000, 18000, 22000, 25000],
        backgroundColor: [
          'rgba(13, 110, 253, 0.8)',
          'rgba(25, 135, 84, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ],
        borderColor: [
          'rgba(13, 110, 253, 1)',
          'rgba(25, 135, 84, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1
      }
    ]
  }

  const dailyTrafficData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Visitors',
        data: [1200, 1500, 1800, 2100, 2400, 2700, 3000],
        borderColor: 'rgba(13, 110, 253, 1)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Conversions',
        data: [24, 30, 36, 42, 48, 54, 60],
        borderColor: 'rgba(25, 135, 84, 1)',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const salesByCategoryData = {
    labels: ['Electronics', 'Fashion', 'Home & Living', 'Books', 'Toys'],
    datasets: [
      {
        data: [30, 20, 25, 15, 10],
        backgroundColor: [
          'rgba(13, 110, 253, 0.8)',
          'rgba(25, 135, 84, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(17, 119, 216, 0.8)'
        ],
        borderColor: [
          'rgba(13, 110, 253, 1)',
          'rgba(25, 135, 84, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(17, 119, 216, 1)'
        ],
        borderWidth: 1
      }
    ]
  }

  // Additional Stats
  const additionalStats = [
    {
      title: "Conversion Rate",
      value: stats.conversion.value,
      change: stats.conversion.change,
      unit: "%",
      icon: "fas fa-chart-line",
      color: "success"
    },
    {
      title: "Average Order Value",
      value: 156.25,
      change: 8.5,
      unit: "$",
      icon: "fas fa-dollar-sign",
      color: "primary"
    },
    {
      title: "Customer Retention",
      value: 78.5,
      change: 4.2,
      unit: "%",
      icon: "fas fa-users",
      color: "info"
    },
    {
      title: "Cart Abandonment",
      value: 68.3,
      change: -2.1,
      unit: "%",
      icon: "fas fa-shopping-cart",
      color: "warning"
    },
    {
      title: "Bounce Rate",
      value: stats.bounceRate.value,
      change: stats.bounceRate.change,
      unit: "%",
      icon: "fas fa-chart-pie",
      color: "danger"
    },
    {
      title: "Customer Lifetime Value",
      value: 456.75,
      change: 12.8,
      unit: "$",
      icon: "fas fa-star",
      color: "success"
    }
  ]

  // Recent Orders
  const recentOrders = [
    {
      id: 1,
      orderNumber: "#ORD12345",
      customer: "John Doe",
      amount: 156.25,
      status: "Delivered",
      date: "2025-05-04"
    },
    {
      id: 2,
      orderNumber: "#ORD12346",
      customer: "Jane Smith",
      amount: 245.50,
      status: "Processing",
      date: "2025-05-04"
    },
    {
      id: 3,
      orderNumber: "#ORD12347",
      customer: "Bob Johnson",
      amount: 98.75,
      status: "Shipped",
      date: "2025-05-03"
    }
  ]

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header py-4">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="dashboard-title">Admin Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back, Admin!</p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="btn-group">
                <button className="btn btn-outline-primary me-2">
                  <i className="fas fa-download me-2"></i>Export
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>New Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="container-fluid py-4">
        <div className="row g-4">
          {/* Revenue Card */}
          <div className="col-md-3">
            <div className="stat-card bg-light border-0 hover-card">
              <div className="stat-icon bg-primary text-white">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-content">
                <h6 className="stat-label">Total Revenue</h6>
                <h2 className="stat-value">${stats.revenue.value.toLocaleString()}</h2>
                <div className="stat-change text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  {stats.revenue.change}% Increase
                </div>
                <div className="progress rounded-2 mt-3">
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: "75%" }}
                    aria-valuenow="75"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <span className="progress-label">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="col-md-3">
            <div className="stat-card bg-light border-0 hover-card">
              <div className="stat-icon bg-info text-white">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h6 className="stat-label">Active Users</h6>
                <h2 className="stat-value">{stats.users.value.toLocaleString()}</h2>
                <div className="stat-change text-info">
                  <i className="fas fa-arrow-up me-1"></i>
                  {stats.users.change}% Growth
                </div>
                <div className="progress rounded-2 mt-3">
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: "62%" }}
                    aria-valuenow="62"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <span className="progress-label">62%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Satisfaction Card */}
          <div className="col-md-3">
            <div className="stat-card bg-light border-0 hover-card">
              <div className="stat-icon bg-warning text-white">
                <i className="fas fa-smile"></i>
              </div>
              <div className="stat-content">
                <h6 className="stat-label">Customer Satisfaction</h6>
                <h2 className="stat-value">{stats.satisfaction.value}%</h2>
                <div className="stat-change text-warning">
                  <i className="fas fa-arrow-up me-1"></i>
                  {stats.satisfaction.change}% Higher
                </div>
                <div className="progress rounded-2 mt-3">
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: "92%" }}
                    aria-valuenow="92"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <span className="progress-label">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="col-md-3">
            <div className="stat-card bg-light border-0 hover-card">
              <div className="stat-icon bg-success text-white">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="stat-content">
                <h6 className="stat-label">Total Orders</h6>
                <h2 className="stat-value">{stats.orders.value.toLocaleString()}</h2>
                <div className="stat-change text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  {stats.orders.change}% More
                </div>
                <div className="progress rounded-2 mt-3">
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: "85%" }}
                    aria-valuenow="85"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <span className="progress-label">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row mt-4">
          {/* Quarterly Revenue Chart */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 hover-card">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Quarterly Revenue</h5>
                  <button className="btn btn-link text-primary p-0">
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
              </div>
              <div className="card-body p-4">
                <div style={{ height: '300px' }}>
                  <Doughnut
                    data={revenueData}
                    options={{
                      responsive: true,
                      animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            font: {
                              size: 12
                            }
                          }
                        },
                        datalabels: {
                          color: '#fff',
                          font: {
                            weight: 'bold',
                            size: 14
                          },
                          formatter: (value) => `$${value.toLocaleString()}`
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            callback: function(value) {
                              return `$${value.toLocaleString()}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Traffic Chart */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 hover-card">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Daily Traffic</h5>
                  <button className="btn btn-link text-primary p-0">
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
              </div>
              <div className="card-body p-4">
                <div style={{ height: '300px' }}>
                  <Line
                    data={dailyTrafficData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sales by Category Chart */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 hover-card">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Sales by Category</h5>
                  <button className="btn btn-link text-primary p-0">
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
              </div>
              <div className="card-body p-4">
                <div style={{ height: '300px' }}>
                  <Bar
                    data={salesByCategoryData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Section */}
        <div className="row mt-4">
          {additionalStats.map((stat, index) => (
            <div key={index} className="col-md-2">
              <div className="stat-card bg-light border-0 hover-card">
                <div className={`stat-icon bg-${stat.color} text-white`}>
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-content">
                  <h6 className="stat-label">{stat.title}</h6>
                  <h2 className="stat-value">
                    {stat.unit === "$" ? `$${stat.value.toFixed(2)}` : 
                     `${stat.value.toFixed(1)}${stat.unit}`}
                  </h2>
                  <div className={`stat-change text-${stat.color}`}>
                    <i className={`fas ${stat.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} me-1`}>
                    </i>
                    {Math.abs(stat.change)}% {stat.change >= 0 ? 'Increase' : 'Decrease'}
                  </div>
                  <div className="progress rounded-2 mt-3">
                    <div
                      className={`progress-bar bg-${stat.color}`}
                      role="progressbar"
                      style={{ width: `${stat.value}%` }}
                      aria-valuenow={stat.value}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <span className="progress-label">{stat.value}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0 hover-card">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Recent Orders</h5>
                  <button className="btn btn-link text-primary p-0">
                    <i className="fas fa-ellipsis-h"></i>
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="table-row">
                          <td>{order.orderNumber}</td>
                          <td>{order.customer}</td>
                          <td>${order.amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge bg-${
                              order.status === 'Delivered' ? 'success' :
                              order.status === 'Processing' ? 'primary' :
                              order.status === 'Shipped' ? 'info' : 'warning'
                            }`}>{order.status}</span>
                          </td>
                          <td>{new Date(order.date).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0 hover-card">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Activity Log</h5>
                  <button className="btn btn-link text-primary p-0">
                    <i className="fas fa-filter"></i>
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="list-group-item d-flex align-items-center px-3 py-3 hover-item"
                    >
                      <div className={`activity-icon me-3 bg-${activity.type} text-white rounded-circle`}
                           style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={activity.icon}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1">{activity.description}</p>
                        <small className="text-muted">{activity.timestamp}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0 hover-card">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Pending Tasks</h5>
                  <button className="btn btn-link text-primary p-0">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="list-group-item d-flex align-items-center px-3 py-3 hover-item"
                    >
                      <div className="form-check me-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {
                            setTasks(tasks.map(t => 
                              t.id === task.id ? { ...t, completed: !t.completed } : t
                            ));
                          }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <p className={`mb-0 ${task.completed ? 'text-muted' : ''}`}>
                          {task.text}
                        </p>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">
                          {new Date().toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add custom CSS styles
const style = document.createElement('style');
style.innerHTML = `
  .dashboard-container {
    min-height: 100vh;
    background: #f8f9fa;
  }

  .dashboard-header {
    background: linear-gradient(135deg, #0d6efd 0%, #198754 100%);
    color: white;
  }

  .stat-card {
    transition: all 0.3s ease;
    border-radius: 10px;
    overflow: hidden;
  }

  .hover-card {
    transition: all 0.3s ease;
  }

  .hover-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-content {
    padding: 1.5rem;
  }

  .stat-label {
    color: #6c757d;
    font-size: 0.875rem;
  }

  .stat-value {
    font-size: 1.5rem;
    margin: 0.5rem 0;
  }

  .stat-change {
    font-size: 0.875rem;
  }

  .progress {
    height: 8px;
  }

  .progress-label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: white;
  }

  .table-row {
    transition: all 0.3s ease;
  }

  .table-row:hover {
    background-color: #f8f9fa;
  }

  .hover-item {
    transition: all 0.3s ease;
  }

  .hover-item:hover {
    background-color: #f8f9fa;
  }

  .activity-icon {
    transition: all 0.3s ease;
  }

  .activity-icon:hover {
    transform: scale(1.1);
  }

  .form-check-input {
    width: 20px;
    height: 20px;
  }

  .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
  }
`;
document.head.appendChild(style);
