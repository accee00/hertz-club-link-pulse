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
        <div className="[margin-bottom:18px] [padding:12px_14px] [border-left:3px_solid_var(--red)] [background:#f0efea] [color:#8b3a36] [font-size:13px]" role="alert">
          {error}
        </div>
      )}
      <form className="[display:grid] [gap:19px]" onSubmit={handleSubmit}>
        {isRegister && (
          <label className="[display:grid] [gap:8px] [color:#35413d] [font-size:12px] [font-weight:700]">
            <span>Your name</span>
            <input className="[width:100%] [height:51px] [padding:0_15px] [border:1px_solid_#dce2dc] [border-radius:4px] [background:#fff] [color:var(--ink)] [font-size:14px] [transition:border-color_.18s,_box-shadow_.18s] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--green)] [&:focus]:[box-shadow:none] [&:focus]:[outline:2px_solid_#a8a151]"
              autoComplete="name"
              maxLength={80}
              minLength={2}
              name="name"
              placeholder="e.g. Jordan Lee"
              required
            />
          </label>
        )}
        <label className="[display:grid] [gap:8px] [color:#35413d] [font-size:12px] [font-weight:700]">
          <span>Email address</span>
          <input className="[width:100%] [height:51px] [padding:0_15px] [border:1px_solid_#dce2dc] [border-radius:4px] [background:#fff] [color:var(--ink)] [font-size:14px] [transition:border-color_.18s,_box-shadow_.18s] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--green)] [&:focus]:[box-shadow:none] [&:focus]:[outline:2px_solid_#a8a151]"
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <label className="[display:grid] [gap:8px] [color:#35413d] [font-size:12px] [font-weight:700]">
          <span>Password</span>
          <span className="[position:relative]">
            <input className="[width:100%] [height:51px] [padding:0_15px] [border:1px_solid_#dce2dc] [border-radius:4px] [background:#fff] [color:var(--ink)] [font-size:14px] [transition:border-color_.18s,_box-shadow_.18s] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--green)] [&:focus]:[box-shadow:none] [&:focus]:[outline:2px_solid_#a8a151] [padding-right:50px]"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 8 : undefined}
              name="password"
              placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
              required
              type={showPassword ? 'text' : 'password'}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [position:absolute] [top:6px] [right:6px]"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        {!isRegister && (
          <div className="[display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [margin-top:-3px] [font-size:12px]">
            <label className="[display:inline-flex] [align-items:center] [gap:8px] [color:#58635e]">
              <input className="[width:15px] [height:15px] [accent-color:var(--green)]" type="checkbox" />
              <span>Keep me signed in</span>
            </label>
            <a className="[color:var(--green)] [font-weight:700] [text-decoration:none] [&:hover]:[text-decoration:underline]" href="#help">
              Need help?
            </a>
          </div>
        )}
        <button className="[display:flex] [min-height:52px] [align-items:center] [justify-content:space-between] [margin-top:5px] [padding:0_17px_0_19px] [border:0] [border-radius:4px] [background:var(--green)] [color:white] [font-weight:700] [cursor:pointer] [transition:background_.18s,_transform_.18s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--green-dark)] [&:disabled]:[opacity:.72] [&:disabled]:[cursor:wait]" disabled={submitting} type="submit">
          {submitting ? (
            <LoaderCircle className="[animation:spin_.8s_linear_infinite]" size={18} />
          ) : (
            <>
              {isRegister ? 'Create account' : 'Sign in'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="[margin:22px_0_0] [color:#66716c] [text-align:center] [font-size:13px]">
        {isRegister ? 'Already have an account?' : 'New to LinkPulse?'}{' '}
        <Link to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Sign in' : 'Register'}
        </Link>
      </p>
    </>
  );
}

export { AuthForm };