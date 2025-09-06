import { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCreateUser, useGetUser } from '../api/user';

export default function Login() {
  const [email, setEmail] = useState('');
  const { user, setUser } = useUser();
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const createUser = useCreateUser();
  const getUser = useGetUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    } else {
      console.log('No user is logged in');
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential: UserCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const dbUser = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
        };
        await createUser.mutateAsync(dbUser);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const dbUser = await getUser.mutateAsync(userCredential.user.uid);
        setUser(dbUser);
      }

      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        style={{ width: '100%', padding: '10px', backgroundColor: '#f5f5f5' }}
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
    </div>
  );
}
