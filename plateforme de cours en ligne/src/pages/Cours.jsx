import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../services/courseService';
import authService from '../services/authService';
import AvatarFromName from '../components/AvatarFromName';
import { allCourses, userProfile } from '../data/coursesData';

const normalizeCourses = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.courses)) return data.courses;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

const normalizeUser = (data) => {
  if (!data) return null;
  if (data.user) return data.user;
  return data;
};

const safeText = (value) => (typeof value === 'string' ? value : '');

const getCourseLevels = (niveau) => {
  if (!niveau) return [];
  if (Array.isArray(niveau)) return niveau.map((n) => safeText(n)).filter(Boolean);
  return safeText(niveau).split(',').map((level) => level.trim()).filter(Boolean);
};

const courseSupportsLevel = (course, niveau) => {
  const levels = getCourseLevels(course.niveau);
  const target = safeText(niveau).toLowerCase();
  return levels.some((level) => safeText(level).toLowerCase() === target);
};

const Cours = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, userData] = await Promise.all([
          courseService.getAllCourses(),
          authService.getCurrentUser()
        ]);
        setCourses(normalizeCourses(coursesData));
        setUser(normalizeUser(userData));
      } catch (err) {
        console.error('API failed', err);
        setError('Impossible de charger les données.');
        // Fallback to static data
        setCourses(allCourses);
        setUser(userProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mainCourses = useMemo(() => {
    if (!user) return [];
    const filtered = normalizeCourses(courses).filter((course) => {
      const courseFiliere = safeText(course.filiereName || course.filiere);
      return (
        courseFiliere.toLowerCase() === safeText(user.filiere).toLowerCase() &&
        courseSupportsLevel(course, user.niveau)
      );
    });

    return filtered.filter((course) => {
      const query = searchQuery.toLowerCase();
      return (
        safeText(course.title).toLowerCase().includes(query) ||
        safeText(course.description).toLowerCase().includes(query)
      );
    });
  }, [courses, user, searchQuery]);

  const groupedCoursesByMatiere = useMemo(() => {
    return mainCourses.reduce((groups, course) => {
      const matiere = safeText(course.matiereName || course.matiere) || 'Autres matières';
      if (!groups[matiere]) groups[matiere] = [];
      groups[matiere].push(course);
      return groups;
    }, {});
  }, [mainCourses]);

  const niveauClass = (n) => {
    const normalized = safeText(n);
    return normalized.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const displayCourses = (courseList, recommended = false) => {
    const safeCourses = normalizeCourses(courseList);

    if (!safeCourses.length) {
      return (
        <div className="empty-state">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <p>Aucun cours trouvé.</p>
        </div>
      );
    }

    return safeCourses.map((course) => {
      const f = { nom: course.formateurName || 'Formateur', specialite: '' };
      const levels = getCourseLevels(course.niveau);

      return (
        <div key={course.id ?? course.title} className="course-card">
          <div className={`card-strip ${recommended ? 'recommended' : ''}`}></div>
          <div className="card-body">
            <div className="card-badges">
              <span className="badge badge-filiere">{safeText(course.filiereName || course.filiere) || 'Filière indisponible'}</span>
              {levels.length > 0 ? levels.map((level) => (
                <span key={level} className={`badge badge-niveau-${niveauClass(level)}`}>{level}</span>
              )) : (
                <span className={`badge badge-niveau-${niveauClass(course.niveau)}`}>{safeText(course.niveau) || 'Niveau inconnu'}</span>
              )}
            </div>
            <div className="card-title">
              {safeText(course.title) || 'Titre du cours indisponible'}
              {course.matiereName && (
                <span className="card-subtitle"> — {safeText(course.matiereName)}</span>
              )}
            </div>
            <p className="card-desc">{safeText(course.description) || 'Description non disponible.'}</p>
            <div className="card-stats">
              <span className="card-stat">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {safeText(course.duree) || 'N/A'}
              </span>
              <span className="card-stat">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                {Array.isArray(course.videos) ? course.videos.length : (course.videos ?? '0')} vidéos
              </span>
              <span className="card-stat">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                {course.etudiants ?? 0}
              </span>
            </div>
          </div>
          <div className="card-divider"></div>
          <div className="card-footer">
            <Link to={`/formateur?id=${course.formateurId}`} className="card-instructor" title={`Voir le profil de ${f.nom}`}>
              <AvatarFromName name={f.nom} size="small" className="instructor-avatar" />
              <div className="instructor-text">
                <small>Formateur</small>
                <strong>{f.nom}</strong>
              </div>
            </Link>
            <Link to={`/course-detail/${course.id}`} className="btn-view">
              Voir
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h1>Chargement des cours…</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Mes Cours</h1>
        <p>Découvrez vos cours et élargissez vos compétences.</p>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: '16px', color: '#c53030' }}>
          {error}
        </div>
      )}

      <div className="search-bar">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input 
          type="text" 
          id="search-input" 
          placeholder="Rechercher un cours…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <section className="section">
        <div className="section-header">
          <h2>Cours disponibles</h2>
          <span className="section-count" id="main-count">{mainCourses.length} cours</span>
        </div>
        {mainCourses.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p>Aucun cours trouvé.</p>
          </div>
        ) : (
          Object.entries(groupedCoursesByMatiere).map(([matiere, courseList]) => (
            <section key={matiere} className="course-group">
              <div className="group-header">
                <h3>{matiere}</h3>
                <span>{courseList.length} cours</span>
              </div>
              <div className="course-grid">
                {displayCourses(courseList, false)}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  );
};

export default Cours;