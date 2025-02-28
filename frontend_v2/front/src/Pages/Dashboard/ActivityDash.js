import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminDashboardContent() {
  const [activities, setActivities] = useState([
    { id: 1, description: 'User logged in', timestamp: '2025-02-28 10:00 AM' },
    { id: 2, description: 'User updated their profile', timestamp: '2025-02-28 10:05 AM' },
    { id: 3, description: 'User logged out', timestamp: '2025-02-28 10:10 AM' },
  ]);
  
  return (
    <div className="flex-fill p-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2>Activity Dashboard</h2>
        <button className="btn btn-primary" onClick={() => alert("Add Activity Functionality Here!")}>Add New Activity</button>
      </header>

      <div className="row mb-4">
        {/* Statistics Cards */}
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <p className="card-text">150</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Active Sessions</h5>
              <p className="card-text">75</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">Pending Requests</h5>
              <p className="card-text">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <h3 className="mt-4">Recent Activities</h3>
      <ul className="list-group mb-4">
        {activities.map(activity => (
          <li key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
            {activity.description}
            <span className="badge bg-primary rounded-pill">{activity.timestamp}</span>
          </li>
        ))}
      </ul>
      
      {/* User Management Section */}
      <h3>User Management</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example User Data */}
            <tr>
              <td>1</td>
              <td>john_doe</td>
              <td>john@example.com</td>
              <td><span className="badge bg-success">Active</span></td>
              <td>
                <button className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>jane_doe</td>
              <td>jane@example.com</td>
              <td><span className="badge bg-warning">Inactive</span></td>
              <td>
                <button className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}