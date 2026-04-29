import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import questionService from '../services/questionService';

const QuestionsProf = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getInstructorQuestions();
      setQuestions(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = filter === 'unanswered' 
    ? questions.filter(q => q.status !== 'answered')
    : questions;

  const handleReply = async (e, questionId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await questionService.replyQuestion(questionId, replyText);
      setReplyText('');
      setSelectedQuestion(null);
      alert('Réponse envoyée avec succès !');
      // Refresh questions to show updated status
      fetchQuestions();
    } catch (err) {
      console.error('Error replying to question:', err);
      alert('Erreur lors de l\'envoi de la réponse');
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

  return (
    <div className="main-content profilProf">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Questions des Étudiants</h1>
        <p>Consultez et répondez aux questions posées par vos étudiants.</p>
      </div>

      {/* FILTERS */}
      <div className="prof-q-filters">
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
      <div className="prof-questions-list">
        {loading ? (
          <div className="loading-state">
            <p>Chargement des questions...</p>
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
          </div>
        ) : (
          filteredQuestions.map(question => (
            <div key={question.id} className="prof-question-card">
              <div className="prof-question-header">
                <div className="prof-question-author">
                  <strong>{question.student_name || 'Étudiant anonyme'}</strong>
                  <span className="prof-q-course">{question.course_title || 'Cours inconnu'}</span>
                </div>
                <div className="prof-question-status">
                  {question.status === 'answered' ? (
                    <span className="badge-answered">✓ Répondu</span>
                  ) : (
                    <span className="badge-pending">⧗ En attente</span>
                  )}
                </div>
              </div>

              <div className="prof-question-content">
                <p>{question.content}</p>
              </div>

              <div className="prof-question-meta">
                <span className="q-date">{new Date(question.created_at).toLocaleDateString('fr-FR')}</span>
                {question.status === 'answered' && question.answer && (
                  <span className="q-replies">Réponse disponible</span>
                )}
              </div>

              <div className="prof-question-actions">
                {question.status === 'answered' ? (
                  <>
                    <button 
                      className="btn-secondary-outline"
                      onClick={() => setSelectedQuestion(selectedQuestion === question.id ? null : question.id)}
                    >
                      {selectedQuestion === question.id ? 'Masquer la réponse' : 'Voir la réponse'}
                    </button>
                    <button className="btn-icon" onClick={() => handleDeleteQuestion(question.id)}>
                      <svg viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={() => setSelectedQuestion(selectedQuestion === question.id ? null : question.id)}
                  >
                    {selectedQuestion === question.id ? 'Annuler' : 'Répondre'}
                  </button>
                )}
              </div>

              {/* REPLY FORM */}
              {selectedQuestion === question.id && question.status !== 'answered' && (
                <form onSubmit={(e) => handleReply(e, question.id)} className="prof-reply-form">
                  <textarea 
                    placeholder="Écrivez votre réponse..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows="4"
                    required
                  />
                  <div className="reply-actions">
                    <button type="button" className="btn-secondary" onClick={() => setSelectedQuestion(null)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn-primary">
                      Envoyer la réponse
                    </button>
                  </div>
                </form>
              )}

              {/* VIEW ANSWER */}
              {selectedQuestion === question.id && question.status === 'answered' && question.answer && (
                <div className="prof-answer-view">
                  <h4>Réponse du formateur :</h4>
                  <p>{question.answer}</p>
                  <small>Répondu le {new Date(question.updated_at || question.created_at).toLocaleDateString('fr-FR')}</small>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionsProf;
