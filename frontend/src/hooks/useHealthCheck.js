import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/api';

export const useHealthCheck = (intervalMs = 30000) => {
  const [status, setStatus] = useState({
    isOnline: false,
    message: 'Connecting to backend...',
    latencyMs: null,
    lastChecked: null,
    loading: true,
  });

  const runCheck = useCallback(async () => {
    const startTime = performance.now();
    try {
      const res = await checkHealth();
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (res.online && res.data?.success) {
        setStatus({
          isOnline: true,
          message: res.data.message || 'CampusCoins API is running',
          latencyMs,
          lastChecked: new Date(),
          loading: false,
        });
      } else {
        setStatus({
          isOnline: false,
          message: res.error || 'Backend unreachable',
          latencyMs: null,
          lastChecked: new Date(),
          loading: false,
        });
      }
    } catch (err) {
      setStatus({
        isOnline: false,
        message: err.message || 'Connection failed',
        latencyMs: null,
        lastChecked: new Date(),
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    runCheck();
    const timer = setInterval(runCheck, intervalMs);
    return () => clearInterval(timer);
  }, [runCheck, intervalMs]);

  return { ...status, refetch: runCheck };
};

export default useHealthCheck;
