import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import examService from '../services/examService';
import courseService from '../services/courseService';

const ExamensProf = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [section, setSection] = useState('all');
  const [courses, setCourses] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [newExam, setNewExam] = useState({ 
    title: '', 
    course: '', 
    description: '',
    content: '',
    files: [],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const examsData = await examService.getInstructorExams();
        const coursesData = await courseService.getInstructorCourses();
        
        // Trier les examens par date de création décroissante (plus récent en premier)
        const sortedExams = (examsData || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setExams(sortedExams);
        setCourses(coursesData || []);
        
        // Si l'enseignant n'a qu'un seul cours, le pré-sélectionner
        if (coursesData && coursesData.length === 1) {
          setNewExam(prev => ({ ...prev, course: coursesData[0].id }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des examens:', error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fonction pour calculer le temps restant
  const calculateTimeRemaining = (endDate) => {
    if (!endDate) return 'Date inconnue';
    const now = new Date();
    // Convertir le format MySQL "YYYY-MM-DD HH:MM:SS" en objet Date local
    let end;
    if (typeof endDate === 'string') {
      // Format: "YYYY-MM-DD HH:MM:SS" -> traiter comme heure locale
      end = new Date(endDate.replace(' ', 'T'));
    } else {
      end = new Date(endDate);
    }
    if (Number.isNaN(end.getTime())) return 'Date invalide';
    const diff = end - now;

    if (diff <= 0) return 'Terminé';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Mise à jour du compte à rebours toutes les secondes
  useEffect(() => {
    const updateCountdowns = () => {
      const newTimeRemaining = {};
      exams.forEach(exam => {
        const endDate = exam.end_date;
        newTimeRemaining[exam.id] = calculateTimeRemaining(endDate);
      });
      setTimeRemaining(newTimeRemaining);
    };

    updateCountdowns(); // Mise à jour initiale
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [exams]);

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    const initialState = { 
      title: '', 
      course: '', 
      description: '',
      content: '',
      files: [],
      startDate: '',
      endDate: ''
    };
    
    // Si un seul cours, le pré-sélectionner
    if (courses && courses.length === 1) {
      initialState.course = courses[0].id;
    }
    
    setNewExam(initialState);
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (newExam.title.trim() && newExam.course && newExam.startDate && newExam.endDate && (newExam.content.trim() || newExam.files.length > 0)) {
      try {
        const formData = new FormData();
        formData.append('title', newExam.title);
        formData.append('course_id', newExam.course);
        formData.append('description', newExam.description || '');
        formData.append('content', newExam.content);
        formData.append('start_date', new Date(newExam.startDate).toISOString().slice(0, 19).replace('T', ' '));
        formData.append('end_date', new Date(newExam.endDate).toISOString().slice(0, 19).replace('T', ' '));
        
        // Ajouter les fichiers
        newExam.files.forEach((file, index) => {
          formData.append(`files`, file);
        });
        
        const createdExam = await examService.createExam(formData);
        setExams([...exams, createdExam]);
        resetForm();
        setShowModal(false);
      } catch (error) {
        console.error('Erreur lors de la création de l\'examen:', error);
        alert('Erreur lors de la création de l\'examen.');
      }
    } else {
      alert('Veuillez saisir un contenu texte ou sélectionner au moins un fichier.');
    }
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      try {
        await examService.deleteExam(id);
        setExams(exams.filter(e => e.id !== id));
        resetForm();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'examen.');
      }
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Fonction pour parser correctement les dates MySQL (YYYY-MM-DD HH:MM:SS)
  const parseDate = (dateString) => {
    if (typeof dateString === 'string') {
      // Format: "YYYY-MM-DD HH:MM:SS" -> traiter comme heure locale
      return new Date(dateString.replace(' ', 'T'));
    }
    return new Date(dateString);
  };

  const filteredExams = section === 'all' 
    ? exams
    : section === 'en-cours' 
    ? exams.filter(exam => parseDate(exam.end_date) > new Date())
    : exams.filter(exam => parseDate(exam.end_date) <= new Date());

  return (
    <div className="main-content examensProf">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Gestion des Examens</h1>
        <p>Créez et gérez les examens de vos cours, consultez les copies.</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="prof-actions">
        <button className="btn-primary" onClick={handleOpenModal}>
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Créer un examen
        </button>
      </div>

      {/* EXAM SECTIONS */}
      <div className="exam-sections-nav">
        <button 
          className={`filter-btn ${section === 'all' ? 'active' : ''}`}
          onClick={() => setSection('all')}
        >
          Tous les examens
        </button>
        <button 
          className={`filter-btn ${section === 'en-cours' ? 'active' : ''}`}
          onClick={() => setSection('en-cours')}
        >
          Examens en cours
        </button>
        <button 
          className={`filter-btn ${section === 'termines' ? 'active' : ''}`}
          onClick={() => setSection('termines')}
        >
          Examens terminés
        </button>
      </div>

      {/* EXAMS LIST */}
      <div className="prof-exams-list">
        {filteredExams.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2"/>
            </svg>
            <p>
              {exams.length === 0 
                ? "Aucun examen créé. Commencez à créer votre premier examen !"
                : section === 'en-cours' 
                ? "Aucun examen en cours."
                : section === 'termines'
                ? "Aucun examen terminé."
                : "Aucun examen trouvé."
              }
            </p>
          </div>
        ) : (
          filteredExams.map(exam => (
            <div key={exam.id} className="prof-exam-card">
              <div className="prof-exam-card-header">
                <div className="prof-exam-info">
                  <h3>{exam.title}</h3>
                  <p className="prof-exam-course">{exam.course_title}</p>
                </div>
                <div className="prof-exam-actions">
                  <button className="btn-icon danger" onClick={() => handleDeleteExam(exam.id)} title="Supprimer">
                    <svg viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="prof-exam-stats">
                <div className="prof-exam-stat">
                  <span className="stat-label">Soumissions</span>
                  <strong>{exam.submissions}</strong>
                </div>
                <div className="prof-exam-stat">
                  <span className="stat-label">Temps restant</span>
                  <strong className={timeRemaining[exam.id] !== 'Terminé' ? 'countdown-active' : 'countdown-ended'}>
                    {timeRemaining[exam.id] || 'Calcul...'}
                  </strong>
                </div>
              </div>

              <div className="prof-exam-actions-full">
                <Link to={`/prof-examens-copies/?id=${exam.id}`} className="btn-primary">
                  Voir les copies
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD EXAM MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer un nouvel examen</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddExam} className="modal-form">
              <div className="form-group">
                <label>Titre de l'examen *</label>
                <input 
                  type="text" 
                  placeholder="ex. Quiz Gestion de Projet"
                  value={newExam.title}
                  onChange={e => setNewExam({...newExam, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cours associé *</label>
                {courses.length === 1 ? (
                  <div className="fixed-course-info">
                    <input 
                      type="text" 
                      value={courses[0].title}
                      readOnly
                      className="readonly-input"
                    />
                    <small className="info-text">Vous n'enseignez que cette matière</small>
                  </div>
                ) : (
                  <select 
                    value={newExam.course}
                    onChange={e => setNewExam({...newExam, course: e.target.value})}
                    required
                  >
                    <option value="">Sélectionnez un cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Description de l'examen (optionnel)"
                  value={newExam.description}
                  onChange={e => setNewExam({...newExam, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Contenu/Sujet de l'examen *</label>
                <small className="info-text" style={{ display: 'block', marginBottom: '8px' }}>
                  Vous pouvez soit saisir du texte, soit télécharger des fichiers (PDF, Word, etc.)
                </small>
                
                <textarea 
                  placeholder="Saisissez le contenu de l'examen ici..."
                  value={newExam.content}
                  onChange={e => setNewExam({...newExam, content: e.target.value})}
                  rows={6}
                  style={{ marginBottom: '12px' }}
                />
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>OU</strong>
                </div>
                
                <input 
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={e => setNewExam({...newExam, files: Array.from(e.target.files)})}
                  style={{ marginBottom: '8px' }}
                />
                
                {newExam.files.length > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--primary)' }}>
                    {newExam.files.length} fichier(s) sélectionné(s): {newExam.files.map(f => f.name).join(', ')}
                  </div>
                )}
                
                <small className="info-text">
                  Formats acceptés: PDF, Word (.doc, .docx), Texte (.txt), Images (.jpg, .png)
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date et heure de début *</label>
                  <input 
                    type="datetime-local"
                    value={newExam.startDate}
                    onChange={e => setNewExam({...newExam, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date et heure de fin *</label>
                  <input 
                    type="datetime-local"
                    value={newExam.endDate}
                    onChange={e => setNewExam({...newExam, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer l'examen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamensProf;
