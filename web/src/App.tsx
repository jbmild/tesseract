import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get<HealthStatus>(`${API_BASE_URL}/api/health`);
      setHealth(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧊 Tesseract</h1>
        <p className="subtitle">The cosmic cube that controls your warehouse Space</p>
      </header>

      <main className="app-main">
        <div className="status-card">
          <h2>System Status</h2>
          {loading ? (
            <p>Checking connection...</p>
          ) : health ? (
            <div className="status-info">
              <p><strong>Status:</strong> {health.status}</p>
              <p><strong>Service:</strong> {health.service}</p>
              <p><strong>Timestamp:</strong> {new Date(health.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p className="error">Unable to connect to backend</p>
          )}
        </div>

        <div className="features">
          <div className="feature-card">
            <h3>📦 Orders</h3>
            <p>Manage warehouse orders</p>
          </div>
          <div className="feature-card">
            <h3>📋 Products</h3>
            <p>Track inventory and products</p>
          </div>
          <div className="feature-card">
            <h3>👥 Users</h3>
            <p>User management system</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
