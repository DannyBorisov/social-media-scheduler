import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import FacebookAuthCallback from './components/FacebookAuthCallback.tsx';
import Login from './components/Login.tsx';
import { UserProvider } from './contexts/UserContext';
import { CreatePostProvider } from './contexts/CreatePostContext.tsx';
import 'react-datetime/css/react-datetime.css';

const queryClient = new QueryClient();

const Main = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth/facebook" element={<FacebookAuthCallback />} />
      <Route path="/auth/tiktok" element={<>VERIFY TIKTOK</>} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CreatePostProvider>
        <UserProvider>
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        </UserProvider>
      </CreatePostProvider>
    </QueryClientProvider>
  </StrictMode>
);
