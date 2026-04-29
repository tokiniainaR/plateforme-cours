import { NavLink, useLocation } from 'react-router-dom';
import UserAvatarWidget from './UserAvatarWidget';

const SidebarProf = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/prof-cours' && (location.pathname === '/prof-cours' || location.pathname === '/prof-cours-detail')) {
      return 'active';
    }
    if (path === '/prof-profil' && (location.pathname === '/prof-profil' || location.pathname === '/prof-modification')) {
      return 'active';
    }
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <NavLink to="/prof-accueil" className="sidebar-brand" title="Platetude Prof">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 8.5V13.5C6 14.05 8 15 12 15s6-0.95 6-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 12v6" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 18h4" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </NavLink>
      
      <nav className="sidebar-nav">
        <NavLink to="/prof-accueil" className={`menu-item ${isActive('/prof-accueil')}`} title="Dashboard">
          <svg viewBox="0 0 24 24">
            <path d="M3 9.5L12 4l9 5.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/>
          </svg>
          <span>Acceuil</span>
        </NavLink>
        
        <NavLink to="/prof-cours" className={`menu-item ${isActive('/prof-cours')}`} title="Mes cours">
          <svg viewBox="0 0 24 24">
            <path d="M4 19a2 2 0 0 1 2-2h14"/>
            <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/>
          </svg>
          <span>Cours</span>
        </NavLink>
        
        <NavLink to="/prof-examens" className={`menu-item ${isActive('/prof-examens')}`} title="Examens">
          <svg viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
          </svg>
          <span>Examens</span>
        </NavLink>
        
        <NavLink to="/prof-profil" className={`menu-item ${isActive('/prof-profil')}`} title="Profil">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="7" r="4"/>
            <path d="M5.5 21a8.38 8.38 0 0 1 13 0"/>
          </svg>
          <span>Profil</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-bottom">
        <NavLink to="/prof-profil" className="sidebar-avatar" title="Mon profil">
          <UserAvatarWidget size="small" />
        </NavLink>
      </div>
    </div>
  );
};

export default SidebarProf;
