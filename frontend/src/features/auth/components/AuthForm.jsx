import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth.js';

function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email').trim();
    const password = formData.get('password');

    try {
      if (isRegister) {
        await register({
          name: formData.get('name').trim(),
          email,
          password,
        });
      } else {
        await login({ email, password });
      }

      navigate(location.state?.from?.pathname || '/dashboard', {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister && (
          <label className="field">
            <span>Your name</span>
            <input
              autoComplete="name"
              maxLength={80}
              minLength={2}
              name="name"
              placeholder="e.g. Jordan Lee"
              required
            />
          </label>
        )}
        <label className="field">
          <span>Email address</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <span className="password-wrap">
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 8 : undefined}
              name="password"
              placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
              required
              type={showPassword ? 'text' : 'password'}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="icon-button password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        {!isRegister && (
          <div className="form-options">
            <label className="remember-option">
              <input type="checkbox" />
              <span>Keep me signed in</span>
            </label>
            <a className="text-link" href="#help">
              Need help?
            </a>
          </div>
        )}
        <button className="submit-button" disabled={submitting} type="submit">
          {submitting ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <>
              {isRegister ? 'Create account' : 'Sign in'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="switch-auth">
        {isRegister ? 'Already have an account?' : 'New to Link Pulse?'}{' '}
        <Link to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </>
  );
}

export { AuthForm };