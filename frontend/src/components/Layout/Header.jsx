import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { HiOutlineMenuAlt2, HiOutlineUser, HiOutlineLogout, HiOutlineCog } from 'react-icons/hi';

const Header = ({ title, subtitle }) => {
  const outletContext = useOutletContext();
  const toggleSidebar = outletContext?.toggleSidebar || (() => {});
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-title">
        <button className="btn-icon btn-ghost mobile-menu-btn" onClick={toggleSidebar} style={{marginRight:'8px'}} id="menu-toggle">
          <HiOutlineMenuAlt2 size={22} />
        </button>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions" id="header-actions">
        <div className="header-profile" ref={dropdownRef} style={{position:'relative'}}>
          <button
            className="header-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'6px 14px 6px 6px', borderRadius:'50px',
              background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)',
              cursor:'pointer', transition:'var(--transition)', color:'var(--text-primary)',
            }}
          >
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                style={{
                  width:'32px', height:'32px', borderRadius:'50%',
                  objectFit:'cover', border:'1px solid var(--border)'
                }} 
              />
            ) : (
              <div style={{
                width:'32px', height:'32px', borderRadius:'50%',
                background:'var(--gradient-accent)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:'0.8rem', color:'#fff',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:'0.82rem', fontWeight:600, lineHeight:1.2}}>{user?.name || 'User'}</div>
              <div style={{fontSize:'0.68rem', color:'var(--text-muted)', lineHeight:1.2}}>{user?.storeName || 'Store'}</div>
            </div>
          </button>

          {dropdownOpen && (
            <div style={{
              position:'absolute', top:'calc(100% + 8px)', right:0,
              minWidth:'180px', padding:'6px',
              background:'var(--bg-secondary)', border:'1px solid var(--border)',
              borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-lg)',
              animation:'scaleIn 0.15s ease', zIndex:200,
            }}>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                style={{
                  display:'flex', alignItems:'center', gap:'10px', width:'100%',
                  padding:'10px 14px', border:'none', background:'none',
                  color:'var(--text-secondary)', cursor:'pointer', borderRadius:'var(--radius-sm)',
                  fontSize:'0.85rem', transition:'var(--transition)', textAlign:'left',
                }}
                onMouseEnter={(e) => { e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.color='var(--text-primary)'; }}
                onMouseLeave={(e) => { e.target.style.background='none'; e.target.style.color='var(--text-secondary)'; }}
              >
                <HiOutlineUser style={{flexShrink:0}} /> Profile & Settings
              </button>
              <div style={{height:'1px', background:'var(--border)', margin:'4px 8px'}} />
              <button
                onClick={handleLogout}
                style={{
                  display:'flex', alignItems:'center', gap:'10px', width:'100%',
                  padding:'10px 14px', border:'none', background:'none',
                  color:'var(--danger)', cursor:'pointer', borderRadius:'var(--radius-sm)',
                  fontSize:'0.85rem', transition:'var(--transition)', textAlign:'left',
                }}
                onMouseEnter={(e) => { e.target.style.background='rgba(239,68,68,0.1)'; }}
                onMouseLeave={(e) => { e.target.style.background='none'; }}
              >
                <HiOutlineLogout style={{flexShrink:0}} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
