import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formateurs } from '../data/coursesData';
import courseService from '../services/courseService';
import userService from '../services/userService';
import AvatarFromName from '../components/AvatarFromName';

const normalizeCourses = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.courses)) return data.courses;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

const Formateur = () => {
  const [searchParams] = useSearchParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const id = searchParams.get('id');

  const getExperienceFromStartDate = (startDate) => {
    if (!startDate) return null;
    const parsed = new Date(startDate);
    if (Number.isNaN(parsed.getTime())) return null;

    const now = new Date();
    const years = now.getFullYear() - parsed.getFullYear();
    const monthAdjustment = now.getMonth() - parsed.getMonth();
    const dayAdjustment = now.getDate() - parsed.getDate();
    const experienceYears = years - (monthAdjustment < 0 || (monthAdjustment === 0 && dayAdjustment < 0) ? 1 : 0);

    return `${Math.max(experienceYears, 0)} an${experienceYears > 1 ? 's' : ''}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setProfileData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const numericId = Number(id);
        if (!Number.isNaN(numericId) && String(numericId) === id) {
          const [user, coursesData] = await Promise.all([
            userService.getUserById(numericId),
            courseService.getAllCourses()
          ]);

          const instructorCourses = normalizeCourses(coursesData).filter(
            (course) => String(course.formateurId) === String(id)
          );

          setProfileData({
            ...user,
            coursDonnes: instructorCourses
          });
        } else {
          const byKey = formateurs[id];
          if (byKey) {
            setProfileData(byKey);
          } else {
            const found = Object.values(formateurs).find((f) => String(f.id) === String(id));
            setProfileData(found || null);
          }
        }
      } catch (err) {
        console.error('Erreur chargement profil formateur :', err);
        setError('Impossible de charger le profil du formateur.');
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const formateur = useMemo(() => {
    if (!profileData) return null;
    if (profileData.specialite || profileData.bio) return profileData;

    const fullName = `${profileData.prenom || ''} ${profileData.nom || ''}`.trim() || 'Formateur';
    const experienceFromDate = getExperienceFromStartDate(profileData.date_debut_metier);

    return {
      id: profileData.id,
      nom: fullName,
      specialite: profileData.filiere || profileData.matiere || 'Formateur',
      avatar: profileData.avatar || `https://i.pravatar.cc/200?u=${profileData.id}`,
      bio: profileData.description || profileData.bio || `Profil de ${fullName}.`,
      email: profileData.email || '',
      etudiants: profileData.etudiants || 0,
      cours: profileData.cours || (Array.isArray(profileData.coursDonnes) ? profileData.coursDonnes.length : 0),
      note: profileData.note || 0,
      experience: experienceFromDate || profileData.experience || `${profileData.annees || 'N/A'} ans`,
      coursDonnes: profileData.coursDonnes || []
    };
  }, [profileData]);

  const renderStars = (note) => {
    let html = '<div className="stars">';
    for (let i = 1; i <= 5; i++) {
      html += `<svg className="star ${i <= Math.floor(note) ? '' : 'empty'}" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    html += `<span className="rating-value">${note}</span><span className="rating-label">/ 5</span></div>`;
    return { __html: html };
  };

  const niveauClass = (n) => {
    const map = { "Débutant": "#ECFDF5", "Intermédiaire": "#EFF6FF", "Avancé": "#FEF3C7" };
    const colorMap = { "Débutant": "#059669", "Intermédiaire": "#3B82F6", "Avancé": "#D97706" };
    return { background: map[n] || '#EFF6FF', color: colorMap[n] || '#3B82F6' };
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Chargement du profil du formateur...</div>
      </div>
    );
  }

  if (!formateur) {
    return (
      <div className="main-content">
        <Link to="/cours" className="back-btn">
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour aux cours
        </Link>
        <div className="not-found">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2>Formateur introuvable</h2>
          <p>{error || "Ce formateur n'existe pas ou le lien est incorrect."} <Link to="/cours">Retourner aux cours</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Link to="/cours" className="back-btn">
        <svg viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour aux cours
      </Link>

      <div className="profile-card">
        <div className="avatar-wrapper">
          <AvatarFromName name={formateur.nom} size="xlarge" className="profile-avatar" />
          <div className="avatar-badge">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{formateur.nom}</h1>
          <p className="profile-specialite">{formateur.specialite}</p>
          
          <p className="profile-bio">{formateur.bio}</p>
          <div className="profile-contact">
            <span className="contact-chip">
              <svg viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {formateur.email}
            </span>
            <span className="contact-chip">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              {formateur.experience} d'expérience
            </span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#EFF6FF' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#3B82F6' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 style={{ color: '#3B82F6' }}>{formateur.etudiants}</h3>
          <p>Étudiants formés</p>
        </div>
        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#F3E8FF' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#7C3AED' }}>
              <path d="M4 19a2 2 0 0 1 2-2h14" />
              <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
            </svg>
          </div>
          <h3 style={{ color: '#7C3AED' }}>{formateur.cours}</h3>
          <p>Cours créés</p>
        </div>
        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <svg viewBox="0 0 24 24" style={{ stroke: '#D97706' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 style={{ color: '#D97706' }}>{formateur.experience}</h3>
          <p>Expérience</p>
        </div>
      </div>

      <h2 className="section-title">Cours dispensés</h2>
      <div className="courses-list">
        {formateur.coursDonnes.map((c, index) => (
          <Link to={`/course-detail/${c.id}`} key={index} className="mini-course-card">
            <h4>{c.title}</h4>
            <p>Durée : {c.duree} &nbsp;|&nbsp; {c.etudiants} étudiants</p>
            <div className="mini-course-meta">
              <span className="mini-badge" style={niveauClass(c.niveau)}>{c.niveau}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Formateur;