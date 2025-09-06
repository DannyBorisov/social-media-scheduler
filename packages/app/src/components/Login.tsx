import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(auth.currentUser)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  auth.onAuthStateChanged((user) => {
    setUser(user)
  })

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const testTokenVerification = async () => {
    if (!user) return
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('http://localhost:3000/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      
      const data = await response.json()
      console.log('Token verification result:', data)
      alert(`Token verified! UID: ${data.uid}`)
    } catch (err) {
      console.error('Token verification failed:', err)
      alert('Token verification failed')
    }
  }

  if (user) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <h2>Welcome!</h2>
        <p>Logged in as: {user.email}</p>
        <p>UID: {user.uid}</p>
        <button onClick={handleSignOut} style={{ marginRight: '10px' }}>
          Sign Out
        </button>
        <button onClick={testTokenVerification}>
          Test Token Verification
        </button>
      </div>
    )
  }

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
        
        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      
      <button 
        onClick={() => setIsSignUp(!isSignUp)}
        style={{ width: '100%', padding: '10px', backgroundColor: '#f5f5f5' }}
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
    </div>
  )
}