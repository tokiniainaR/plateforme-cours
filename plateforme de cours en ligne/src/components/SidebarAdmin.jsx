import { NavLink, useLocation } from 'react-router-dom';

const SidebarAdmin = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <NavLink to="/admin-accueil" className="sidebar-brand" title="Platetude Admin">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 8.5V13.5C6 14.05 8 15 12 15s6-0.95 6-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 12v6" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 18h4" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </NavLink>
      
      <nav className="sidebar-nav">
        <NavLink to="/admin-accueil" className={`menu-item ${isActive('/admin-accueil')}`} title="Dashboard">
          <svg viewBox="0 0 24 24">
            <path d="M3 9.5L12 4l9 5.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/>
          </svg>
          <span>Accueil</span>
        </NavLink>
        
        <NavLink to="/admin-comptes" className={`menu-item ${isActive('/admin-comptes')}`} title="Comptes">
          <svg viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Comptes</span>
        </NavLink>
        
        <NavLink to="/admin-cours" className={`menu-item ${isActive('/admin-cours')}`} title="Cours">
          <svg viewBox="0 0 24 24">
            <path d="M4 19a2 2 0 0 1 2-2h14"/>
            <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/>
          </svg>
          <span>Cours</span>
        </NavLink>

        <NavLink to="/admin-examens" className={`menu-item ${isActive('/admin-examens')}`} title="Examens">
          <svg viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2"/>
          </svg>
          <span>Examens</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default SidebarAdmin;
