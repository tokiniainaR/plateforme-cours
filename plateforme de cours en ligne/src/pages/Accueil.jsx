import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../services/courseService';
import examService from '../services/examService';
import authService from '../services/authService';

const Accueil = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    totalTime: '0h'
  });
  const [user, setUser] = useState({ nom: '', prenom: '', filiere: '' });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledExams, setEnrolledExams] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = Math.max(0, now - date);
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}j`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}sem`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mois`;
    const years = Math.floor(days / 365);
    return `${years}an${years > 1 ? 's' : ''}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResult, userResult, coursesResult, examsResult] = await Promise.allSettled([
          courseService.getStudentStats(),
          authService.getCurrentUser(),
          courseService.getStudentCourses(),
          examService.getStudentExams()
        ]);

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value);
        } else {
          console.error('Failed to fetch student stats:', statsResult.reason);
        }

        if (userResult.status === 'fulfilled') {
          const userData = userResult.value?.user || userResult.value || {};
          console.log('Current user data:', userData);
          setUser({
            nom: '',
            prenom: '',
            filiere: '',
            ...userData
          });
        } else {
          console.error('Failed to fetch user data:', userResult.reason);
        }

        let courses = [];
        let exams = [];

        // Try to get student-specific data
        if (coursesResult.status === 'fulfilled') {
          const result = coursesResult.value;
          console.log('Courses API response:', result);
          console.log('Courses result type:', typeof result, 'Is array:', Array.isArray(result));
          courses = Array.isArray(result) ? result : (Array.isArray(result?.courses) ? result.courses : []);
        } else {
          console.error('Failed to fetch student courses:', coursesResult.reason);
          // Fallback to all courses
          const allCoursesResult = await courseService.getAllCourses();
          console.log('Fallback to all courses:', allCoursesResult);
          courses = Array.isArray(allCoursesResult) ? allCoursesResult : (Array.isArray(allCoursesResult?.courses) ? allCoursesResult.courses : []);
        }

        if (examsResult.status === 'fulfilled') {
          const result = examsResult.value;
          console.log('Exams API response:', result);
          console.log('Exams result type:', typeof result, 'Is array:', Array.isArray(result));
          exams = Array.isArray(result) ? result : (Array.isArray(result?.exams) ? result.exams : []);
        } else {
          console.error('Failed to fetch student exams:', examsResult.reason);
          // Fallback to all exams
          const allExamsResult = await examService.getAllExams();
          console.log('Fallback to all exams:', allExamsResult);
          exams = Array.isArray(allExamsResult) ? allExamsResult : (Array.isArray(allExamsResult?.exams) ? allExamsResult.exams : []);
        }

        console.log('Parsed courses:', courses);
        console.log('Parsed exams:', exams);

        setEnrolledCourses(courses);
        setEnrolledExams(exams);

        const courseActivities = courses.map(course => {
          const dateStr = course.enrolled_at || course.created_at;
          const date = dateStr ? new Date(dateStr) : new Date(0);
          console.log(`Processing course: title="${course.title}", enrolled_at="${course.enrolled_at}", created_at="${course.created_at}", date="${date}"`);
          return { ...course, type: 'course', date, activityLabel: course.enrolled_at ? 'Cours inscrit' : 'Cours disponible' };
        });

        const examActivities = exams.map(exam => {
          const dateStr = exam.created_at || exam.start_date || exam.end_date;
          const date = dateStr ? new Date(dateStr) : new Date(0);
          console.log(`Processing exam: title="${exam.title}", created_at="${exam.created_at}", date="${date}"`);
          return { ...exam, type: 'exam', date, activityLabel: 'Examen disponible' };
        });

        const activities = [...courseActivities, ...examActivities]
          .sort((a, b) => b.date - a.date)
          .slice(0, 4);

        console.log('Final activities:', activities);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  const fullName = [user.prenom, user.nom].filter(Boolean).join(' ') || 'étudiant';
  const filiereLabel = user.filiere || 'non renseignée';

  return (
    <div className="main-content">
      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">
          <svg viewBox="0 0 24 24" width="13" height="13" style={{ stroke: 'white', fill: 'none', strokeWidth: 2 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Bienvenue, {fullName}
        </div>
        <p className="hero-subtitle">
          Vous suivez actuellement la filière <strong>{filiereLabel}</strong>.
        </p>
        <h1>Continuez votre parcours d'apprentissage</h1>
        <p>Développez vos compétences et atteignez vos objectifs grâce à un parcours personnalisé adapté à votre profil.</p>
        <div className="hero-actions">
          <Link to="/cours" className="btn-hero btn-hero-primary">
            <svg viewBox="0 0 24 24">
              <path d="M4 19a2 2 0 0 1 2-2h14" />
              <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
            </svg>
            Mes cours
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid-3" id="stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#3B82F6' }}>
              <path d="M4 19a2 2 0 0 1 2-2h14" />
              <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#3B82F6' }}>{stats.enrolledCourses}</h2>
            <p>Cours actifs</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#10B981' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="stat-info">
            <h2 style={{ color: '#10B981' }}>{stats.totalTime}</h2>
            <p>Temps d'apprentissage</p>
          </div>
        </div>
        

      </div>

      {/* TWO COL */}
      <div className="two-col">
        {/* ACTIVITÉS */}
        <div className="section-card">
          <div className="section-card-header">
            <h2>Activités récentes</h2>
          </div>

          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => {
              const colors = ['#EFF6FF', '#ECFDF5', '#F3E8FF', '#FEF3C7'];
              const strokes = ['#3B82F6', '#10B981', '#7C3AED', '#D97706'];
              
              return (
                <div key={`${activity.type}-${activity.id}`} className="activity">
                  <div className="activity-icon" style={{ background: colors[index % colors.length] }}>
                    <svg viewBox="0 0 24 24" style={{ stroke: strokes[index % strokes.length] }}>
                      {activity.type === 'course' ? (
                        <>
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
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
                    <strong>{activity.title || (activity.type === 'course' ? 'Cours sans titre' : 'Examen sans titre')}</strong>
                    <span>{activity.activityLabel || (activity.type === 'course' ? 'Cours inscrit' : 'Examen disponible')}</span>
                  </div>
                  <span className="activity-time">{formatRelativeTime(new Date(activity.date))}</span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              <p>Aucune activité récente</p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default Accueil;