import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import examService from '../services/examService';

const ExamensDetailProf = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('id');

  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedSubject, setSelectedSubject] = useState('Toutes');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Charger les données de l'examen
  useEffect(() => {
    const fetchExamData = async () => {
      console.log('ExamensDetailProf - examId:', examId);
      if (!examId) {
        console.log('ExamensDetailProf - No examId provided');
        setError('ID d\'examen manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('ExamensDetailProf - Fetching exam data for ID:', examId);
        const [examData, submissionsData] = await Promise.all([
          examService.getExamById(examId),
          examService.getStudentSubmissions(examId)
        ]);

        console.log('ExamensDetailProf - Exam data received:', examData);
        console.log('ExamensDetailProf - Submissions data received:', submissionsData);

        if (examData) {
          setExam(examData);
          setEditForm({
            startDate: examData.start_date?.replace(' ', 'T') || '',
            endDate: examData.end_date?.replace(' ', 'T') || ''
          });
        } else {
          setError('Examen introuvable');
        }
        setSubmissions(submissionsData || []);
      } catch (err) {
        console.error('ExamensDetailProf - Error loading exam:', err);
        setError('Impossible de charger l\'examen: ' + (err.message || 'Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  const handleSaveExam = async () => {
    try {
      await examService.updateExam(examId, {
        start_date: new Date(editForm.startDate).toISOString().slice(0, 19).replace('T', ' '),
        end_date: new Date(editForm.endDate).toISOString().slice(0, 19).replace('T', ' ')
      });
      setExam({...exam, start_date: editForm.startDate.replace('T', ' '), end_date: editForm.endDate.replace('T', ' ')});
      setShowEditModal(false);
      alert('Examen mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de l\'examen.');
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="main-content examensDetailProf">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement de l'examen…</p>
          <div style={{ marginTop: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="main-content examensDetailProf">
        <Link to="/examens-prof" className="back-btn">
          &larr; Retour aux examens
        </Link>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Erreur de chargement</h2>
          <p>{error || 'Cet examen n\'existe pas ou a été supprimé.'}</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            ID de l'examen: {examId || 'Non fourni'}
          </p>
          <Link to="/examens-prof" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Retour à la liste des examens
          </Link>
        </div>
      </div>
    );
  }

  const submittedCount = submissions.filter(s => s.status !== 'pending').length;
  const totalCount = submissions.length;
  const timeRemaining = new Date(exam.end_date) > new Date() ? 'En cours' : 'Terminé';

  const subjectOptions = [...new Set([exam.course, ...exam.submissions.map(s => s.studentField)])];
  const levelOptions = [...new Set(exam.submissions.map(s => s.studentLevel).filter(Boolean))];

  const filteredSubmissions = exam.submissions.filter(submission => {
    const subjectMatch = selectedSubject === 'Toutes' || submission.studentField === selectedSubject;
    const levelMatch = selectedLevel === 'all' || submission.studentLevel === selectedLevel;
    return subjectMatch && levelMatch;
  });

  return (
    <div className="examensDetailProf">
      {/* HEADER */}
      <div className="prof-exam-header">
        <div className="prof-exam-title-section">
          <Link to="/examens-prof" className="back-btn">
            <svg viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Retour aux examens
          </Link>
          <h1>{exam.title}</h1>
          <p className="prof-exam-course">{exam.course_title}</p>
        </div>
        <div className="prof-exam-actions">
          <button className="btn-secondary-outline" onClick={() => setShowEditModal(true)}>
            <svg viewBox="0 0 24 24">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
            Modifier l'examen
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="prof-exam-stats-grid">
        <div className="prof-exam-stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{submittedCount}/{totalCount}</h3>
            <p>Copies rendues</p>
          </div>
        </div>
        <div className="prof-exam-stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{timeRemaining}</h3>
            <p>Statut</p>
          </div>
        </div>
        <div className="prof-exam-stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Fichier</h3>
            <p>Type d'examen</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="prof-tabs-container">
        <div className="prof-tabs">
          <button
            className={`prof-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button
            className={`prof-tab ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Copies des étudiants ({submittedCount})
          </button>
        </div>

        <div className="prof-tab-content">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="prof-exam-overview">
              <div className="prof-exam-info-grid">
                <div className="prof-exam-info-card">
                  <h3>Informations de l'examen</h3>
                  <div className="info-row">
                    <span className="label">Cours:</span>
                    <span>{exam.course_title}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Matière:</span>
                    <span>{exam.course_matiere || 'Non spécifiée'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date de début:</span>
                    <span>{new Date(exam.start_date).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date de fin:</span>
                    <span>{new Date(exam.end_date).toLocaleString('fr-FR')}</span>
                  </div>
                  {exam.description && (
                    <div className="info-row">
                      <span className="label">Description:</span>
                      <span>{exam.description}</span>
                    </div>
                  )}
                </div>
                <div className="prof-exam-info-card">
                  <h3>Statistiques</h3>
                  <div className="info-row">
                    <span className="label">Total d'étudiants:</span>
                    <span>{totalCount}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Copies rendues:</span>
                    <span>{submittedCount}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Copies non rendues:</span>
                    <span>{totalCount - submittedCount}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Statut:</span>
                    <span>{timeRemaining}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === 'submissions' && (
            <div className="prof-submissions-section">
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--light)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <p style={{ marginBottom: '10px' }}>Pour consulter et télécharger les copies des étudiants, accédez à la page dédiée :</p>
                <Link to={`/prof-examens-copies/?id=${examId}`} className="btn-primary">
                  Voir les copies d'examen
                </Link>
              </div>

              <div className="prof-submissions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Soumis le</th>
                      <th>Statut</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length > 0 ? (
                      submissions.map(submission => (
                        <tr key={submission.id}>
                          <td>{submission.student_name}</td>
                          <td>
                            {submission.created_at ? 
                              new Date(submission.created_at).toLocaleString('fr-FR') : 
                              'Non soumis'
                            }
                          </td>
                          <td>
                            <span className={`status-badge ${submission.status}`}>
                              {submission.status === 'pending' ? 'À noter' : 'Notée'}
                            </span>
                          </td>
                          <td>
                            {submission.grade !== null && submission.grade !== undefined
                              ? `${submission.grade}/20`
                              : 'À noter'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--gray)' }}>
                          Aucune soumission pour cet examen
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT EXAM MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'examen</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveExam(); }} className="modal-form">
              <div className="form-group">
                <label>Date et heure de début</label>
                <input
                  type="datetime-local"
                  value={editForm.startDate}
                  onChange={e => setEditForm({...editForm, startDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date et heure de fin</label>
                <input
                  type="datetime-local"
                  value={editForm.endDate}
                  onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamensDetailProf;