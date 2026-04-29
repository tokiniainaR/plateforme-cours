import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalExams: 0,
    totalEnrollments: 0,
    totalFormateurs: 0,
    totalStudents: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recentActivities = [
    { id: 1, type: 'student',   message: 'Nouveaux étudiants inscrits',       date: 'Il y a 2h' },
    { id: 2, type: 'formateur', message: 'Nouveaux cours publiés',          date: 'Il y a 5h' },
    { id: 3, type: 'course',    message: 'Cours approuvés récemment',             date: 'Hier, 14h30' },
    { id: 4, type: 'report',    message: 'Signalements en attente', date: 'Hier, 09h15' }
  ];

  const systemStats = [
    { label: 'Comptes actifs',            value: stats.totalUsers, pct: 99,  color: '#3B82F6' },
    { label: 'Cours vérifiés',            value: stats.totalCourses,   pct: 88,  color: '#10B981' },
    { label: 'Inscriptions totales',   value: stats.totalEnrollments,   pct: 75,  color: '#F59E0B' },
    { label: 'Examens créés',      value: stats.totalExams,    pct: 60,   color: '#EF4444' }
  ];

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const activityMeta = {
    student:   { bg: '#EFF6FF', color: '#3B82F6' },
    formateur: { bg: '#ECFDF5', color: '#10B981' },
    course:    { bg: '#FEF3C7', color: '#D97706' },
    report:    { bg: '#FEF2F2', color: '#EF4444' }
  };

  if (loading) {
    return (
      <div className="main-content dashboardAdmin">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement du tableau de bord…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content dashboardAdmin">

      {/* ── WELCOME ── */}
      <div className="admin-welcome">
        <div className="admin-welcome-content">
          <div className="admin-welcome-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div className="admin-platform-badge">
              <span className="admin-status-dot"></span>
              Plateforme en ligne
            </div>
            <h1>Bienvenue, Administrateur !</h1>
            <p style={{ textTransform: 'capitalize' }}>{today} — Tableau de bord de gestion</p>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#3B82F6' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#3B82F6' }}>{stats.totalStudents.toLocaleString()}</h2>
            <p>Étudiants inscrits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#10B981' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#10B981' }}>{stats.totalFormateurs}</h2>
            <p>Formateurs actifs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#D97706' }}>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#D97706' }}>{stats.totalCourses}</h2>
            <p>Cours disponibles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E8FF' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#7C3AED' }}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#7C3AED' }}>{stats.totalExams}</h2>
            <p>Examens créés</p>
          </div>
        </div>
      </div>

      

      {/* ── QUICK ACTIONS ── */}
      <div className="admin-quick-actions">
        <h3>Actions rapides</h3>
        <div className="actions-grid">
          <Link to="/admin-comptes" className="action-btn">
            <div className="action-btn-icon">
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="action-btn-text">
              <span className="action-btn-title">Gérer les comptes</span>
              <span className="action-btn-desc">Utilisateurs &amp; rôles</span>
            </div>
          </Link>

          <Link to="/admin-cours" className="action-btn">
            <div className="action-btn-icon">
              <svg viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div className="action-btn-text">
              <span className="action-btn-title">Gérer les cours</span>
              <span className="action-btn-desc">Approuver &amp; vérifier</span>
            </div>
          </Link>

          <Link to="/admin-examens" className="action-btn">
            <div className="action-btn-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <div className="action-btn-text">
              <span className="action-btn-title">Gérer les examens</span>
              <span className="action-btn-desc">Consulter &amp; supprimer</span>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DashboardAdmin;
