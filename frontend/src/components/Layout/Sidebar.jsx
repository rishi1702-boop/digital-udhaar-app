import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { HiOutlineHome, HiOutlineUsers, HiOutlineCreditCard, HiOutlineCog, HiOutlineBell, HiOutlineBookOpen } from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const links = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: t('dashboard') },
    { to: '/customers', icon: <HiOutlineUsers />, label: t('customers') },
    { to: '/cashbook', icon: <HiOutlineBookOpen />, label: t('cashbook') },
    { to: '/reminders', icon: <HiOutlineBell />, label: t('reminders') },
    { to: '/settings', icon: <HiOutlineCog />, label: t('settings') },
  ];


  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">₹</div>
          <div>
            <h2>Udhaar Khata</h2>
            <span>{t('digitalLedger')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
