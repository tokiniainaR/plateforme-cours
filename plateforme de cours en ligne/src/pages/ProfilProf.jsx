import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import courseService from '../services/courseService';
import examService from '../services/examService';
import Avatar from '../components/Avatar';

const ProfilProf = () => {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [matiereName, setMatiereName] = useState('Non définie');
  const [allNiveaux, setAllNiveaux] = useState('Non défini');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const userResult = await authService.getCurrentUser();
        const currentUser = userResult?.user || userResult;
        setProfile(currentUser || null);

        const instructorCourses = await courseService.getInstructorCourses();
        setCourses(instructorCourses || []);

        const instructorExams = await examService.getInstructorExams();
        setExams(instructorExams || []);

        // Extract matiere name and niveaux from courses
        if (instructorCourses && instructorCourses.length > 0) {
          const firstCourse = instructorCourses[0];
          setMatiereName(firstCourse.matiereName || firstCourse.matiere || 'Non définie');
          
          const niveauxSet = new Set();
          instructorCourses.forEach(course => {
            if (course.niveaux && Array.isArray(course.niveaux)) {
              course.niveaux.forEach(niv => niveauxSet.add(niv));
            }
          });
          setAllNiveaux(Array.from(niveauxSet).join(', ') || 'Non défini');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil formateur :', err);
        setError(err.message || 'Impossible de charger le profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((sum, course) => sum + (parseInt(course.etudiants, 10) || 0), 0);
  const fullName = profile ? `${profile.prenom || ''} ${profile.nom || ''}`.trim() : 'Formateur';
  const location = profile?.ville || 'Ville non renseignée';
  const specialty = profile?.filiere || 'Spécialité non renseignée';
  const level = profile?.niveau || 'Niveau non renseigné';

  // Combine courses and exams for recent activities
  const recentActivities = [
    ...courses.map(course => ({ ...course, type: 'course', date: new Date(course.created_at) })),
    ...exams.map(exam => ({ ...exam, type: 'exam', date: new Date(exam.created_at) }))
  ].sort((a, b) => b.date - a.date).slice(0, 4);

  if (loading) {
    return (
      <div className="main-content profilProf">
        <div className="loading">Chargement du profil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content profilProf">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="main-content profilProf">
      {/* BANNER */}
      <div className="profile-banner">
        <div className="profile-banner-inner">
          <div className="profile-photo-wrap">
            <Avatar prenom={profile?.prenom || ''} nom={profile?.nom || ''} size="large" />
            <Link to="/prof-modification" className="edit-photo-btn" title="Modifier le profil">
              <svg viewBox="0 0 24 24">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </Link>
          </div>
          <div className="profile-banner-info">
            <div className="profile-header">
              <h1>{fullName}</h1>
            </div>
            <p>{location} &nbsp;•&nbsp; Formateur en {specialty}</p>
            <div className="quick-stats">
              <div className="quick-stat">
                <h3>{totalCourses}</h3>
                <span>Cours actifs</span>
              </div>
              <div className="quick-stat">
                <h3>{totalStudents}</h3>
                <span>Étudiants</span>
              </div>
              <div className="quick-stat">
                <h3>{level}</h3>
                <span>Niveau</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMATIONS DU PROFIL */}
      <div className="profile-info-section">
        <div className="section-card">
          <div className="section-card-header">
            <h2>Informations du profil</h2>
            <Link to="/prof-modification" className="edit-link">Modifier →</Link>
          </div>
          <div className="skills-grid">
            <div className="skill-item">
              <div className="skill-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" />
                  <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7" />
                </svg>
              </div>
              <div className="skill-content">
                <h4>Filière</h4>
                <span>{profile.filiere || 'Non renseignée'}</span>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="skill-content">
                <h4>Matière</h4>
                <span>{matiereName}</span>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="skill-content">
                <h4>Niveau</h4>
                <span>{allNiveaux}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE COL */}
      <div className="single-col">
        {/* BIO */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>À propos</h2>
            <Link to="/prof-modification" className="edit-link">Modifier →</Link>
          </div>
          <p className="profile-bio">
            {profile?.description || `Formateur spécialisé en ${profile.filiere || 'gestion'} avec une expérience sur des contenus pédagogiques et des projets de formation.`}
          </p>
          <div className="bio-highlights">
            <div className="highlight-item">
              <svg viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Formateur certifié</span>
            </div>
            <div className="highlight-item">
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>{totalStudents} étudiants formés</span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="two-col">
        {/* COURS */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Mes cours actifs</h2>
            <div className="header-actions">
              <Link to="/prof-cours" className="see-all">Voir tous →</Link>
              <Link to="/prof-cours" className="btn-primary small">Ajouter un cours</Link>
            </div>
          </div>

          <div className="popular-courses">
            {courses.slice(0, 4).map((course) => (
              <div key={course.id} className="course-item">
                <div className="course-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div className="course-info">
                  <h4>{course.title || 'Cours sans titre'}</h4>
                  <div className="course-stats">
                    <span className="students-count">{course.etudiants || 0} étudiants</span>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="empty-state">
                <p>Aucun cours disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVITÉS */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Activités récentes</h2>
          </div>

          <div className="recent-activities">
            {recentActivities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="activity-item">
                <div className="activity-icon success">
                  <svg viewBox="0 0 24 24">
                    {activity.type === 'course' ? (
                      <>
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </>
                    ) : (
                      <>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </>
                    )}
                  </svg>
                </div>
                <div className="activity-content">
                  <strong>{activity.type === 'course' ? 'Nouveau cours créé' : 'Nouvel examen créé'}</strong>
                  <span>{activity.type === 'course' ? `Cours "${activity.title}" ajouté à votre catalogue.` : `Examen "${activity.title}" créé.`}</span>
                  <div className="activity-meta">
                    <span className="activity-time">Créé récemment</span>
                    <span className="activity-type">{activity.type === 'course' ? 'Création cours' : 'Création examen'}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="empty-state">
                <p>Aucune activité récente.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="profile-actions-section">
        <div className="profile-actions">
          <Link to="/prof-modification" className="btn-primary">
            <svg viewBox="0 0 24 24">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Modifier mon profil
          </Link>
          <Link to="/prof-cours" className="btn-secondary-outline">
            <svg viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Gérer mes cours
          </Link>
        </div>

        {/* QUICK STATS SUMMARY */}
        <div className="quick-stats-summary">
          <div className="summary-item">
            <div className="summary-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <div className="summary-content">
              <h4>2h 30m</h4>
              <span>Temps de réponse moyen</span>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" />
              </svg>
            </div>
            <div className="summary-content">
              <h4>98%</h4>
              <span>Taux de réussite</span>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-icon">
              <svg viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="summary-content">
              <h4>247</h4>
              <span>Messages ce mois</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilProf;
