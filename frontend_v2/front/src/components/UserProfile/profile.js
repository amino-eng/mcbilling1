import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = ({ username, email }) => {
  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>User Profile</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <strong>Username:</strong>
            </div>
            <div className="col-md-9">
              {username}
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <strong>Email:</strong>
            </div>
            <div className="col-md-9">
              {email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
