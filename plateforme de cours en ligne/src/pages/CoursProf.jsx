import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../services/courseService';
import matiereService from '../services/matiereService';
import authService from '../services/authService';

const CoursProf = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [matieres, setMatieres] = useState([]);
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [newCourse, setNewCourse] = useState({ 
    title: '', 
    description: '', 
    matiere_id: '', 
    filiereName: '',
    niveau: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchMatieres();
    fetchInstructorProfile();
  }, []);

  const normalizeUser = (data) => {
    if (!data) return null;
    return data.user || data;
  };

  const fetchCourses = async () => {
    try {
      const data = await courseService.getInstructorCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch instructor courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatieres = async () => {
    try {
      const data = await matiereService.getAllMatieres();
      setMatieres(data);
    } catch (error) {
      console.error('Failed to fetch matières:', error);
    }
  };

  const fetchInstructorProfile = async () => {
    try {
      const profileData = normalizeUser(await authService.getCurrentUser());
      if (profileData) {
        setInstructorProfile(profileData);
      }
    } catch (error) {
      console.error('Impossible de charger le profil du formateur :', error);
    }
  };

  const buildInitialCourseState = (profile, matieresList) => {
    if (profile?.matiere_id) {
      const selected = matieresList?.find((matiere) => String(matiere.id) === String(profile.matiere_id));
      return {
        title: '',
        description: '',
        matiere_id: profile.matiere_id,
        filiereName: selected?.filiereName || profile.filiere || '',
        niveau: ''
      };
    }

    return {
      title: '',
      description: '',
      matiere_id: '',
      filiereName: '',
      niveau: ''
    };
  };

  useEffect(() => {
    if (instructorProfile && matieres.length) {
      setNewCourse((prev) => ({
        ...buildInitialCourseState(instructorProfile, matieres),
        title: prev.title,
        description: prev.description,
        niveau: prev.niveau
      }));
    }
  }, [instructorProfile, matieres]);

  const handleNiveauChange = (e) => {
    setNewCourse({ ...newCourse, niveau: e.target.value });
  };

  const hasFixedMatiere = Boolean(instructorProfile?.matiere_id);

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      await courseService.deleteCourse(courseId);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Erreur lors de la suppression du cours.');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Vous devez être connecté pour créer un cours.');
      return;
    }
    
    // Validation des champs requis
    if (!newCourse.title || !newCourse.description || !newCourse.matiere_id || !newCourse.niveau) {
      alert('Veuillez remplir tous les champs obligatoires (Titre, Description, Matière, Niveau).');
      return;
    }

    setCreating(true);

    try {
      const payload = {
        ...newCourse
      };
      console.log('Creating course with data:', payload);
      const response = await courseService.createCourse(payload);
      console.log('Course created successfully:', response);
      setShowModal(false);
      setNewCourse(buildInitialCourseState(instructorProfile, matieres));
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Erreur lors de la création du cours: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="main-content coursProf">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Gestion des Cours</h1>
        <p>Créez, modifiez et gérez vos cours et leur contenu.</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="prof-actions">
        <button className="btn-primary" onClick={() => {
          setNewCourse(buildInitialCourseState(instructorProfile, matieres));
          setShowModal(true);
        }}>
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Créer un nouveau cours
        </button>
      </div>

      {/* COURSES LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des cours…</p>
        </div>
      ) : (
        <div className="prof-courses-grid">
          {courses.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24">
                <path d="M4 19a2 2 0 0 1 2-2h14"/>
                <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/>
              </svg>
              <p>Aucun cours créé. Commencez à créer votre premier cours !</p>
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="prof-course-card">
                <div className="prof-course-card-header">
                  <h3>{course.title}</h3>
                  <div className="prof-course-actions">
                    <button className="btn-icon danger" onClick={() => handleDeleteCourse(course.id)} title="Supprimer">
                      <svg viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="prof-course-desc">{course.description}</p>

                <div className="prof-course-level">
                  <span className="level-badge">{course.niveau}</span>
                </div>

                <Link to={`/prof-cours-detail/?id=${course.id}`} className="btn-course-manage">
                  Gérer le cours
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* ADD COURSE MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer un nouveau cours</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="modal-form">
              <div className="form-group">
                <label>Titre du cours *</label>
                <input 
                  type="text" 
                  placeholder="ex. Gestion de Projet"
                  value={newCourse.title}
                  onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  placeholder="Décrivez votre cours..."
                  value={newCourse.description}
                  onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                {hasFixedMatiere ? (
                  <>
                    <div className="form-group">
                      <label>Matière *</label>
                      <input
                        type="text"
                        value={matieres.find((matiere) => String(matiere.id) === String(newCourse.matiere_id))?.name || 'Matière du profil'}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>Filière</label>
                      <input type="text" value={newCourse.filiereName || instructorProfile?.filiere || ''} disabled />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Matière *</label>
                      <select 
                        value={newCourse.matiere_id}
                        onChange={e => {
                          const selected = matieres.find((matiere) => String(matiere.id) === String(e.target.value));
                          setNewCourse({
                            ...newCourse,
                            matiere_id: e.target.value,
                            filiereName: selected ? selected.filiereName || '' : ''
                          });
                        }}
                        required
                      >
                        <option value="">Sélectionner</option>
                        {matieres.map((matiere) => (
                          <option key={matiere.id} value={matiere.id}>{matiere.name || matiere.nom || matiere.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Filière</label>
                      <input type="text" value={newCourse.filiereName || 'Sélectionnez une matière'} disabled />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label>Niveau *</label>
                  <select 
                    value={newCourse.niveau}
                    onChange={handleNiveauChange}
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Création...' : 'Créer le cours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursProf;
