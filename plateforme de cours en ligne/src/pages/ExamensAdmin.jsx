import { useState, useEffect } from 'react';
import examService from '../services/examService';

const ExamensAdmin = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const examsData = await examService.getAllExams();
        setExams(examsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des examens:', error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      try {
        await examService.deleteExam(id);
        setExams(exams.filter(e => e.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'examen.');
      }
    }
  };

  if (loading) {
    return (
      <div className="main-content examensAdmin">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des examens…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content examensAdmin">
      <div className="page-header">
        <h1>Gestion des Examens</h1>
        <p>Consultez, modifiez et supprimez les examens créés par les formateurs.</p>
      </div>

      <div className="admin-table-header">
        <button className={`filter-btn exam-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tous ({exams.length})
        </button>
      </div>

      <div className="admin-table">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Matière</th>
              <th>Formateur</th>
              <th>Date création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Aucun examen trouvé
                </td>
              </tr>
            ) : (
              exams.map(exam => (
                <tr key={exam.id}>
                  <td><strong>{exam.title}</strong></td>
                  <td>{exam.course_matiere || exam.course_title || '-'}</td>
                  <td>{exam.instructor_name || '-'}</td>
                  <td>{new Date(exam.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="table-actions">
                    <button className="btn-xs btn-info">Consulter</button>
                    <button className="btn-xs btn-danger" onClick={() => handleDelete(exam.id)}>Supprimer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Version mobile avec cartes */}
        <div className="mobile-cards" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {exams.length === 0 ? (
            <div className="empty-state">
              <p>Aucun examen trouvé</p>
            </div>
          ) : (
            exams.map(exam => (
              <div key={exam.id} className="admin-card">
                <div className="card-header">
                  <div className="card-title">
                    <strong>{exam.title}</strong>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="card-field">
                    <span className="field-label">Matière:</span>
                    <span className="field-value">{exam.course_matiere || exam.course_title || '-'}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Formateur:</span>
                    <span className="field-value">{exam.instructor_name || '-'}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Création:</span>
                    <span className="field-value">{new Date(exam.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button className="btn-xs btn-info">Consulter</button>
                  <button className="btn-xs btn-danger" onClick={() => handleDelete(exam.id)}>Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamensAdmin;
