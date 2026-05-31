import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--gradient-bg)',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '300px',
        height: '300px',
        background: 'rgba(220, 38, 38, 0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: '400px',
        height: '400px',
        background: 'rgba(16, 185, 129, 0.05)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0
      }} />

      <div className="glass-card" style={{
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '540px',
        width: '100%',
        animation: 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
      }}>
        
        <div style={{
          fontSize: '8.5rem',
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          animation: 'float 6s ease-in-out infinite',
          letterSpacing: '-4px'
        }}>
          404
        </div>
        
        <h2 style={{ 
          fontSize: '2rem', 
          color: 'var(--text-primary)', 
          marginBottom: '16px',
          fontWeight: 800
        }}>
          Oops! Page Not Found
        </h2>
        
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '1.05rem', 
          marginBottom: '40px', 
          lineHeight: 1.6,
          maxWidth: '400px',
          margin: '0 auto 40px'
        }}>
          It looks like you've wandered off the ledger. The page you're trying to reach doesn't exist or has been moved.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/" className="action-btn action-btn-gave" style={{ 
            padding: '14px 28px', 
            fontSize: '1.05rem',
            textDecoration: 'none',
            borderRadius: '50px'
          }}>
            <HiOutlineHome style={{ fontSize: '1.3rem' }} /> Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
