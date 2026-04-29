import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import questionService from '../services/questionService';

const QuestionsStudent = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getStudentQuestions();
      setQuestions(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement de vos questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;

    try {
      await questionService.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Erreur lors de la suppression de la question');
    }
  };

  const filteredQuestions = filter === 'unanswered'
    ? questions.filter(q => q.status !== 'answered')
    : questions;

  return (
    <div className="main-content questionsStudent">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Mes Questions</h1>
        <p>Consultez vos questions et les réponses de vos formateurs.</p>
      </div>

      {/* FILTERS */}
      <div className="student-q-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes ({questions.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unanswered' ? 'active' : ''}`}
          onClick={() => setFilter('unanswered')}
        >
          Sans réponse ({questions.filter(q => q.status !== 'answered').length})
        </button>
      </div>

      {/* QUESTIONS LIST */}
      <div className="student-questions-list">
        {loading ? (
          <div className="loading-state">
            <p>Chargement de vos questions...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchQuestions}>Réessayer</button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p>Aucune question pour cette catégorie.</p>
            <Link to="/cours" className="btn-primary">Poser une question dans un cours</Link>
          </div>
        ) : (
          filteredQuestions.map(question => (
            <div key={question.id} className="student-question-card">
              <div className="student-question-header">
                <div className="student-question-course">
                  <strong>{question.course_title || 'Cours inconnu'}</strong>
                </div>
                <div className="student-question-status">
                  {question.status === 'answered' ? (
                    <span className="badge-answered">✓ Répondu</span>
                  ) : (
                    <span className="badge-pending">⧗ En attente</span>
                  )}
                </div>
              </div>

              <div className="student-question-content">
                <p><strong>Votre question :</strong> {question.content}</p>
              </div>

              <div className="student-question-meta">
                <span className="q-date">Posée le {new Date(question.created_at).toLocaleDateString('fr-FR')}</span>
              </div>

              {question.status === 'answered' && question.answer && (
                <div className="student-question-answer">
                  <h4>Réponse du formateur :</h4>
                  <p>{question.answer}</p>
                  <small>Répondu le {new Date(question.updated_at || question.created_at).toLocaleDateString('fr-FR')}</small>
                </div>
              )}

              <div className="student-question-actions">
                <button className="btn-icon" onClick={() => handleDeleteQuestion(question.id)} title="Supprimer la question">
                  <svg viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionsStudent;