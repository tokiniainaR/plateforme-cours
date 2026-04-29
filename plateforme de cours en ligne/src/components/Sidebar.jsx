import { NavLink, useLocation } from 'react-router-dom';
import UserAvatarWidget from './UserAvatarWidget';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    // Logique pour déterminer si un lien est actif
    if (path === '/cours' && (location.pathname === '/cours' || location.pathname.startsWith('/course-detail'))) {
      return 'active';
    }
    if (path === '/profil' && (location.pathname === '/profil' || location.pathname === '/modification')) {
      return 'active';
    }
    if (path === '/examens' && (location.pathname === '/examens' || location.pathname.startsWith('/exam-content'))) {
      return 'active';
    }
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <NavLink to="/accueil" className="sidebar-brand" title="Platetude">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 8.5V13.5C6 14.05 8 15 12 15s6-0.95 6-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 12v6" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 18h4" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </NavLink>
      
      <nav className="sidebar-nav">
        <NavLink to="/accueil" className={`menu-item ${isActive('/accueil')}`} title="Accueil">
          <svg viewBox="0 0 24 24">
            <path d="M3 9.5L12 4l9 5.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/>
          </svg>
          <span>Accueil</span>
        </NavLink>
        
        <NavLink to="/cours" className={`menu-item ${isActive('/cours')}`} title="Cours">
          <svg viewBox="0 0 24 24">
            <path d="M4 6l8 4 8-4"/>
            <path d="M4 6v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6"/>
            <path d="M4 12l8 4 8-4"/>
          </svg>
          <span>Cours</span>
        </NavLink>
        
        <NavLink to="/profil" className={`menu-item ${isActive('/profil')}`} title="Profil">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
          <span>Profil</span>
        </NavLink>

        <NavLink to="/examens" className={`menu-item ${isActive('/examens')}`} title="Examens">
          <svg viewBox="0 0 24 24">
            <path d="M8 2h8v4h2v2H6V6h2V2z" />
            <rect x="6" y="8" width="12" height="12" rx="2" />
            <path d="M9 12h6" />
            <path d="M9 15h6" />
          </svg>
          <span>Examens</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-bottom">
        <NavLink to="/profil" className="sidebar-avatar" title="Mon profil">
          <UserAvatarWidget size="small" />
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;