import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    // Retry every 5 seconds if health check fails
    const interval = setInterval(() => {
      if (!health && !loading) {
        checkHealth();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [health, loading]);

  const checkHealth = async () => {
    try {
      setError(null);
      const response = await axios.get<HealthStatus>(`${API_BASE_URL}/api/health`, {
        timeout: 5000,
      });
      setHealth(response.data);
    } catch (error: any) {
      console.error('Health check failed:', error);
      setError(error.message || 'Connection failed');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="status-card">
        <h2>System Status</h2>
        {loading ? (
          <p>Checking connection...</p>
        ) : health ? (
          <div className="status-info">
            <p><strong>Status:</strong> <span style={{ color: '#10b981' }}>✓ {health.status}</span></p>
            <p><strong>Service:</strong> {health.service}</p>
            <p><strong>Timestamp:</strong> {new Date(health.timestamp).toLocaleString()}</p>
          </div>
        ) : (
          <div>
            <p className="error">Unable to connect to backend</p>
            {error && <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>Error: {error}</p>}
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>Retrying automatically...</p>
          </div>
        )}
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>👥 Users</h3>
          <p>Manage users, roles, and permissions</p>
        </div>
        <div className="feature-card">
          <h3>📦 Orders</h3>
          <p>Manage warehouse orders</p>
        </div>
        <div className="feature-card">
          <h3>📋 Products</h3>
          <p>Track inventory and products</p>
        </div>
      </div>
    </div>
  );
}
