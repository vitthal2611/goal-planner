import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AuthScreen.css';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back!');
      } else {
        await signUp(email, password);
        toast.success('Account created!');
      }
    } catch (error) {
      const errorMessages = {
        'auth/email-already-in-use': 'Email already exists',
        'auth/weak-password': 'Password must be at least 6 characters',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-email': 'Invalid email address',
        'auth/invalid-credential': 'Invalid email or password'
      };
      toast.error(errorMessages[error.code] || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">🎯 Life Tracker</h1>
          <p className="auth-subtitle">Track your finances and habits</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
          <button onClick={() => setIsLogin(!isLogin)} className="auth-toggle-btn">
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
