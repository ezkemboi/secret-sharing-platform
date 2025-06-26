import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import Login  from '@/components/Login';
import Dashboard  from '@/components/Dashboard';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogin = () => setToken('demo-token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
      <Container>
        {!token ? (
            <Login onLogin={handleLogin} />
        ) : (
            <Dashboard onLogout={handleLogout} />
        )}
      </Container>
  )
}
