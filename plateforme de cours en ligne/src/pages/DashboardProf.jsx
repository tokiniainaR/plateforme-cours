import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import courseService from '../services/courseService';
import examService from '../services/examService';
import Avatar from '../components/Avatar';

const DashboardProf = () => {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formateur, setFormateur] = useState({
    nom: 'Formateur',
    specialite: 'Spécialiste',
    coursCount: 0,
    etudiantsCount: 0,
    examensCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [userResult, coursesData, examsData] = await Promise.all([
          authService.getCurrentUser(),
          courseService.getInstructorCourses(),
          examService.getInstructorExams()
        ]);

        const currentUser = userResult?.user || userResult;
        const fullName = currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() : 'Formateur';
        const specialty = currentUser?.filiere || 'Spécialiste en pédagogie';

        setCourses(coursesData);
        setExams(examsData);

        // Create recent activities from courses and exams
        const activities = [
          ...coursesData.map(course => ({ ...course, type: 'course', date: new Date(course.created_at) })),
          ...examsData.map(exam => ({ ...exam, type: 'exam', date: new Date(exam.created_at) }))
        ].sort((a, b) => b.date - a.date);

        setRecentActivities(activities);

        // Calculer les stats du formateur
        let totalStudents = 0;

        if (Array.isArray(coursesData) && coursesData.length > 0) {
          totalStudents = coursesData.reduce((sum, c) => sum + (Number.isFinite(c.etudiants) ? c.etudiants : 0), 0);
        }

        setFormateur({
          nom: fullName || 'Formateur',
          specialite: specialty,
          coursCount: Array.isArray(coursesData) ? coursesData.length : 0,
          etudiantsCount: totalStudents,
          examensCount: Array.isArray(examsData) ? examsData.length : 0
        });
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        setError(error.message || 'Une erreur est survenue lors du chargement du tableau de bord');
        setFormateur({
          nom: "Formateur",
          specialite: "Spécialiste",
          coursCount: 0,
          etudiantsCount: 0,
          examensCount: 0
        });
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const activeCourses = courses.filter(course => course.statut === 'actif');

  if (loading) {
    return (
      <div className="main-content dashboardProf">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement du tableau de bord…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content dashboardProf">
        <div style={{ textAlign: 'center', padding: '50px', color: '#dc2626' }}>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content dashboardProf">
      {/* WELCOME SECTION */}
      <div className="prof-welcome">
        <div className="prof-welcome-content">
          <h1>Bienvenue, {formateur.nom}!</h1>
          <p>Gérez vos cours, examens et interactions avec vos étudiants.</p>
        </div>
        <div className="prof-welcome-avatar">
          <Avatar prenom={formateur.prenom || ''} nom={formateur.nom || ''} size="large" />
        </div>
      </div>

      {/* STATS */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#3B82F6' }}>
              <path d="M4 19a2 2 0 0 1 2-2h14"/>
              <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#3B82F6' }}>{formateur.coursCount}</h2>
            <p>Cours créés</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#10B981' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#10B981' }}>{formateur.etudiantsCount}</h2>
            <p>Étudiants inscrits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#D97706' }}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#D97706' }}>{formateur.examensCount}</h2>
            <p>Examens créés</p>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS */}
      <div className="two-col">
        {/* MES COURS */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Mes cours actifs</h2>
            <Link to="/prof-cours" className="see-all">Voir tout →</Link>
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

          <Link to="/prof-cours" className="btn-primary-outline" style={{ marginTop: '12px' }}>
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Ajouter un cours
          </Link>
        </div>

        {/* ACTIVITÉS RÉCENTES */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Activités récentes</h2>
          </div>

          <div className="recent-activities">
            {recentActivities.slice(0, 4).map((activity) => (
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
                <p>Aucun activité récente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProf;
