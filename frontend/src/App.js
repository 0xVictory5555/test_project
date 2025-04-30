import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:4000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [form, setForm] = useState({
    clientName: '',
    address: '',
    systemSize: '',
    preferredInstallDate: '',
  });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (token) fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`);
      setJobs(res.data);
    } catch (err) {
      alert('Failed to fetch jobs. Is backend running?');
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, authForm);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert('Invalid username or password');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/jobs`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        clientName: '',
        address: '',
        systemSize: '',
        preferredInstallDate: '',
      });
      fetchJobs();
    } catch (err) {
      alert('Failed to submit job.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await axios.delete(`${API}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs();
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  // Login view only
  if (!token) {
    return (
      <div className="login-container">
        <div className="form-section">
          <h2>Login to Certana</h2>
          <form onSubmit={login}>
            <input
              name="username"
              value={authForm.username}
              onChange={handleAuthChange}
              placeholder="Username"
              required
            />
            <input
              name="password"
              type="password"
              value={authForm.password}
              onChange={handleAuthChange}
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="dashboard-container">
      <div className="form-section">
        <h2>Submit a New Job</h2>
        <form onSubmit={handleJobSubmit}>
          <input
            name="clientName"
            value={form.clientName}
            onChange={handleFormChange}
            placeholder="Client Name"
            required
          />
          <input
            name="address"
            value={form.address}
            onChange={handleFormChange}
            placeholder="Address"
            required
          />
          <input
            name="systemSize"
            value={form.systemSize}
            onChange={handleFormChange}
            placeholder="System Size (kW)"
            required
          />
          <input
            type="date"
            name="preferredInstallDate"
            value={form.preferredInstallDate}
            onChange={handleFormChange}
            required
          />
          <button type="submit">Submit Job</button>
        </form>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="jobs-section">
        <h2>Submitted Jobs</h2>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Address</th>
              <th>System Size</th>
              <th>Install Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.clientName}</td>
                <td>{job.address}</td>
                <td>{job.systemSize}</td>
                <td>{job.preferredInstallDate}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(job.id)}
                  >
                    Delet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;