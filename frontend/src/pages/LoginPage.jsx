import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AuthPage.css';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Go back to wherever the user came from, or default to '/'
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password
      });

      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-card__logo">
          <img src="/logo.png" alt="ContIQ" />
        </div>

        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">Sign in to continue to ContIQ</p>

        {error && (
          <div className="auth-card__error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
          <div className="auth-card__field">
            <label htmlFor="email" className="auth-card__label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="auth-card__input"
              disabled={loading}
            />
          </div>

          <div className="auth-card__field">
            <label htmlFor="password" className="auth-card__label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="auth-card__input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-card__button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-card__spinner" />
                Signing in…
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-card__link">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
