import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './FacebookAuthCallback.module.css';
import apiClient from '../api/client';
import { useUser } from '../contexts/UserContext';

const FacebookAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (code && user) {
        try {
          setStatus('loading');
          setMessage('Exchanging authorization code for access token...');
          const response = await apiClient.get('/channel/auth/facebook/callback', { code });
          const data = await response.json();

          if (data.success) {
            setStatus('success');
            setMessage('Authentication successful! Access token obtained. Redirecting...');
            setTimeout(() => navigate('/'), 2000);
          } else {
            setStatus('error');
            setMessage(`Token exchange failed: ${data.error}`);
            setTimeout(() => navigate('/'), 3000);
          }
        } catch (err) {
          setStatus('error');
          setMessage('Failed to exchange authorization code for access token');
          setTimeout(() => navigate('/'), 3000);
        }
        return;
      }

      setStatus('error');
      setMessage('No valid authentication data received');
      setTimeout(() => navigate('/'), 3000);
    };

    handleCallback();
  }, [searchParams, navigate, user]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <div className={styles.spinner} />
            <h2 className={styles.title}>Authenticating...</h2>
            <p className={styles.message}>
              Please wait while we complete your Facebook authentication.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={`${styles.statusIcon} ${styles.successIcon}`}>✓</div>
            <h2 className={styles.successTitle}>Success!</h2>
            <p className={styles.message}>{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={`${styles.statusIcon} ${styles.errorIcon}`}>×</div>
            <h2 className={styles.errorTitle}>Authentication Failed</h2>
            <p className={styles.message}>{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FacebookAuthCallback;
