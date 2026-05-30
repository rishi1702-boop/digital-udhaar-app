import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page-bg" style={{ backgroundImage: "url('/register-illustration.png')" }}>
      <div className="auth-overlay"></div>
      <div className="auth-card-overlay">
        <div className="auth-logo">
          <div className="auth-logo-icon">₹</div>
          <h1>Create Account</h1>
          <p>Start managing your store's khata digitally</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" placeholder="enter your name" required value={form.name} onChange={update('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input className="form-input" placeholder="enter your store name" required value={form.storeName} onChange={update('storeName')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="enter your email" required value={form.email} onChange={update('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" placeholder="enter your phone number" value={form.phone} onChange={update('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="min 6 characters" required minLength={6} value={form.password} onChange={update('password')} />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
