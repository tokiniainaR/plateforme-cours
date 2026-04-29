import { useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { allCourses, formateurs } from '../data/coursesData';
import AvatarFromName from '../components/AvatarFromName';

const Pub = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = parseInt(searchParams.get('id')) || 3;
  const course = useMemo(() => allCourses.find(c => c.id === courseId), [courseId]);

  const getUserEnrollments = () => {
    return JSON.parse(localStorage.getItem('userEnrollments') || '[]');
  };

  const enrollNow = () => {
    const enrollments = getUserEnrollments();
    if (!enrollments.includes(courseId)) {
      enrollments.push(courseId);
      localStorage.setItem('userEnrollments', JSON.stringify(enrollments));
    }
    navigate(`/course-detail/${courseId}`);
  };

  if (!course) return null;

  const formateur = formateurs[course.formateurId] || { nom: 'Formateur', specialite: '' };

  return (
    <main className="main-content">
      <Link to="/cours" className="back-btn">
        <svg viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour aux cours
      </Link>

      <div className="enrollment-hero">
        <h1 id="enrollment-title">{course.title}</h1>
        <p id="enrollment-description">{course.description}</p>
        <div className="enrollment-badges">
          <div className="enrollment-badge">
            <strong id="enrollment-duration">{course.duree}</strong>
            <span>De contenu</span>
          </div>
          <div className="enrollment-badge">
            <strong id="enrollment-videos">{course.videos}</strong>
            <span>Vidéos</span>
          </div>
          <div className="enrollment-badge">
            <strong id="enrollment-students">{course.etudiants}</strong>
            <span>Étudiants</span>
          </div>
        </div>
        <button className="enrollment-cta-btn" onClick={enrollNow} style={{ border: 'none', cursor: 'pointer' }}>
          S'inscrire maintenant
          <svg viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="enrollment-content">
        <div className="enrollment-section">
          <h2>
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Ce que vous apprendrez
          </h2>
          <ul className="enrollment-list">
            <li>Les fondamentaux du cours</li>
            <li>Les meilleures pratiques</li>
            <li>Des projets pratiques</li>
          </ul>
        </div>

        <div className="enrollment-section">
          <h2>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
            </svg>
            Votre formateur
          </h2>
          <div className="enrollment-instructor">
            <AvatarFromName name={formateur.nom} size="small" className="enrollment-instructor-avatar" />
            <div className="enrollment-instructor-info">
              <strong id="trainer-name">{formateur.nom}</strong>
              <span id="trainer-specialty">{formateur.specialite}</span>
            </div>
          </div>
          <div className="enrollment-features">
            <div className="enrollment-feature-item">
              <strong>Expert</strong>
              <span>10+ ans d'exp</span>
            </div>
            <div className="enrollment-feature-item">
              <strong>4.9★</strong>
              <span>Très bien noté</span>
            </div>
          </div>
        </div>

        <div className="enrollment-section">
          <h2>
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Pour qui est ce cours
          </h2>
          <ul className="enrollment-list">
            <li>Débutants ou intermédiaires</li>
            <li>Professionnels en reconversion</li>
            <li>Étudiants cherchant à se spécialiser</li>
            <li>Toute personne motivée à apprendre</li>
          </ul>
        </div>

        <div className="enrollment-section">
          <h2>
            <svg viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            Contenu du cours
          </h2>
          <ul className="enrollment-list">
            <li>Modules vidéo progressifs</li>
            <li>Documents à télécharger</li>
            <li>Quizzes et évaluations</li>
            <li>Accès à vie au contenu</li>
          </ul>
        </div>

        <div className="enrollment-section enrollment-full-width" style={{ textAlign: 'center', background: 'linear-gradient(135deg,#F0F9FF,#F5F3FF)' }}>
          <h2 style={{ justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Prêt à commencer ?
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '16px' }}>Rejoignez des centaines d'étudiants et démarrez votre apprentissage dès aujourd'hui</p>
          <button className="enrollment-cta-btn" onClick={enrollNow} style={{ border: 'none', cursor: 'pointer' }}>
            S'inscrire au cours
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
};

export default Pub;