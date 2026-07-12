import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AuthPage.css';

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register — backend returns the user but not a token
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });

      // Immediately log in to get the JWT
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password
      });

      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Start learning smarter with ContIQ</p>

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
            <label htmlFor="name" className="auth-card__label">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="auth-card__input"
              disabled={loading}
            />
          </div>

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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="auth-card__input"
              disabled={loading}
            />
          </div>

          <div className="auth-card__field">
            <label htmlFor="confirm" className="auth-card__label">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
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
                Creating account…
              </>
            ) : 'Create account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
