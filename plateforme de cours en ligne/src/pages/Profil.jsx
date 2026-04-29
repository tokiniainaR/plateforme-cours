import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import courseService from '../services/courseService';
import Avatar from '../components/Avatar';

const Profil = () => {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ enrolledCourses: 0, completedCourses: 0, avgProgress: 0, totalTime: '0h' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const [userResult, coursesResult, statsResult] = await Promise.allSettled([
          authService.getCurrentUser(),
          courseService.getStudentCourses(),
          courseService.getStudentStats()
        ]);

        if (userResult.status === 'fulfilled') {
          setProfile(userResult.value?.user || userResult.value || null);
        } else {
          console.error('Erreur chargement utilisateur :', userResult.reason);
          setError('Impossible de charger votre profil.');
        }

        if (coursesResult.status === 'fulfilled') {
          setCourses(Array.isArray(coursesResult.value) ? coursesResult.value : []);
        } else {
          console.error('Erreur chargement des cours :', coursesResult.reason);
          setCourses([]);
        }

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value || { enrolledCourses: 0, completedCourses: 0, avgProgress: 0, totalTime: '0h' });
        }
      } catch (err) {
        console.error('Erreur Profil page :', err);
        setError('Une erreur est survenue lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Chargement du profil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const fullName = profile ? `${profile.prenom || ''} ${profile.nom || ''}`.trim() : 'Étudiant';
  const location = profile?.ville ? `${profile.ville} • ${profile.filiere || 'Filière non renseignée'}` : profile?.filiere || 'Filière non renseignée';
  const niveau = profile?.niveau || 'Niveau non renseigné';
  const completedCourses = stats.completedCourses || 0;
  const points = Math.max(0, Math.round((stats.avgProgress || 0) * 10));
  const courseCount = courses.length || stats.enrolledCourses;

  return (
    <div className="main-content">
      <div className="profile-banner">
        <div className="profile-banner-inner">
          <div className="profile-photo-wrap">
            <Avatar prenom={profile?.prenom || ''} nom={profile?.nom || ''} size="large" />
            <Link to="/modification" className="edit-photo-btn" title="Modifier le profil">
              <svg viewBox="0 0 24 24">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </Link>
          </div>
          <div className="profile-banner-info">
            <h1>{fullName}</h1>
            <p>{location}</p>
            <div className="quick-stats">
              <div className="quick-stat">
                <h3>{courseCount}</h3>
                <span>Cours inscrits</span>
              </div>
              <div className="quick-stat">
                <h3>{points}</h3>
                <span>Points</span>
              </div>
              <div className="quick-stat">
                <h3>{niveau}</h3>
                <span>Niveau</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="three-col">
        <div className="stat-card">
          <div className="icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8v6l-9 4-9-4V8" />
              <path d="M3 8l9 4 9-4" />
              <path d="M12 12v10" />
            </svg>
          </div>
          <span>Cours terminés</span>
          <h4 style={{ color: 'var(--accent)' }}>{completedCourses}</h4>
        </div>
        <div className="stat-card">
          <div className="icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span>Heures apprises</span>
          <h4 style={{ color: 'var(--primary)' }}>{stats.totalTime}</h4>
        </div>
        <div className="stat-card">
          <div className="icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3 7l7 1-5 5l1 7-6-3-6 3 1-7-5-5 7-1z" />
            </svg>
          </div>
          <span>Compétences</span>
          <h4 style={{ color: 'var(--secondary)' }}>{Math.round(stats.avgProgress || 0)}%</h4>
        </div>
      </div>

      <div className="two-col">
        <div className="section-card">
          <h2>Mon compte</h2>
          <p style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '20px', lineHeight: 1.6 }}>
            Gérez votre profil, vos informations personnelles et vos préférences d'apprentissage.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/modification" className="edit-link">
              <svg viewBox="0 0 24 24">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              Modifier mon profil
            </Link>
            <Link to="/cours" className="edit-link">
              <svg viewBox="0 0 24 24">
                <path d="M4 19a2 2 0 0 1 2-2h14" />
                <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
              </svg>
              Mes cours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;
