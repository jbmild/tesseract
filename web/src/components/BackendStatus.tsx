import { useState, useEffect } from 'react';
import { healthApi } from '../services/api';
import './BackendStatus.css';

export default function BackendStatus() {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackend = async () => {
    try {
      await healthApi.check();
      setStatus('online');
      setLastCheck(new Date());
    } catch (error) {
      setStatus('offline');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Check immediately
    checkBackend();

    // Check every 5 seconds
    const interval = setInterval(checkBackend, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`backend-status ${status}`} title={`Backend is ${status}`}>
      <div className="status-indicator">
        <span className="status-dot"></span>
        <span className="status-text">
          {status === 'checking' ? 'Checking...' : status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
